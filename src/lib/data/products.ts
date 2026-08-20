/**
 * The centralized catalog data-access layer. No component may query Prisma
 * directly — everything here goes through the shared `prisma` singleton in
 * lib/db/prisma.ts.
 *
 * Vendor status filtering (excluding inactive vendors' products) is a
 * catalog visibility rule from docs/architecture.md; it is enforced here,
 * once, rather than re-implemented at each call site.
 */
import { ProductStatus, ProductVariantStatus, VendorStatus } from "@/generated/prisma/enums";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";
import type { ProductCard, ProductDetail, ProductImageView, ProductVariantView } from "@/lib/types";

import { storageRefToUrl } from "./storage";

const cardSelect = {
  id: true,
  slug: true,
  name: true,
  brand: { select: { name: true, slug: true } },
  vendor: { select: { businessName: true } },
  images: {
    select: { id: true, sortOrder: true, storageRef: true, altText: true },
    orderBy: { sortOrder: "asc" },
    take: 1,
  },
  variants: {
    select: { size: true, price: true, stock: true },
  },
} satisfies Prisma.ProductSelect;

type ProductCardRow = Prisma.ProductGetPayload<{ select: typeof cardSelect }>;

const detailSelect = {
  id: true,
  slug: true,
  name: true,
  description: true,
  brand: { select: { name: true, slug: true } },
  vendor: { select: { businessName: true } },
  categories: {
    where: { isPrimary: true },
    select: { category: { select: { name: true, slug: true } } },
    take: 1,
  },
  images: {
    select: { id: true, sortOrder: true, storageRef: true, altText: true },
    orderBy: { sortOrder: "asc" },
  },
  variants: {
    select: { id: true, size: true, color: true, sku: true, price: true, stock: true },
  },
} satisfies Prisma.ProductSelect;

type ProductDetailRow = Prisma.ProductGetPayload<{ select: typeof detailSelect }>;

// Catalog visibility rule: published products from active vendors only.
const publishedFromActiveVendor = {
  status: ProductStatus.PUBLISHED,
  vendor: { status: VendorStatus.ACTIVE },
} satisfies Prisma.ProductWhereInput;

function toImageView(image: ProductDetailRow["images"][number]): ProductImageView {
  return {
    id: image.id,
    sortOrder: image.sortOrder,
    url: storageRefToUrl(image.storageRef),
    // ProductImage.altText is nullable in the schema; the view model is
    // not, so the coercion happens here, once, in the data layer.
    alt: image.altText ?? "",
  };
}

function toVariantView(variant: ProductDetailRow["variants"][number]): ProductVariantView {
  return {
    id: variant.id,
    size: variant.size,
    color: variant.color,
    sku: variant.sku,
    // Prisma.Decimal cannot be serialised from a Server Component to a
    // Client Component; convert to a plain number here, once.
    price: variant.price.toNumber(),
    stock: variant.stock,
    inStock: variant.stock > 0,
  };
}

function toProductCard(product: ProductCardRow): ProductCard {
  const image = product.images[0] ?? null;
  const prices = product.variants.map((variant) => variant.price.toNumber());

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    brand: product.brand,
    vendor: product.vendor,
    image: image ? toImageView(image) : null,
    priceFrom: Math.min(...prices),
    sizes: product.variants.map((variant) => variant.size),
    inStock: product.variants.some((variant) => variant.stock > 0),
  };
}

function toProductDetail(product: ProductDetailRow): ProductDetail {
  const prices = product.variants.map((variant) => variant.price.toNumber());

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    // Product.description is nullable in the Prisma schema; the view model
    // is not, so the coercion happens here, once, in the data layer.
    description: product.description ?? "",
    brand: product.brand,
    vendor: product.vendor,
    category: product.categories[0]?.category ?? null,
    images: product.images.map(toImageView),
    variants: product.variants.map(toVariantView),
    priceRange: { min: Math.min(...prices), max: Math.max(...prices) },
    inStock: product.variants.some((variant) => variant.stock > 0),
  };
}

export async function getPublishedProducts(): Promise<ProductCard[]> {
  const products = await prisma.product.findMany({
    where: publishedFromActiveVendor,
    select: cardSelect,
    orderBy: { createdAt: "asc" },
  });
  return products.map(toProductCard);
}

export async function getFeaturedProducts(limit: number): Promise<ProductCard[]> {
  const products = await prisma.product.findMany({
    where: publishedFromActiveVendor,
    select: cardSelect,
    orderBy: { createdAt: "asc" },
    take: limit,
  });
  return products.map(toProductCard);
}

export async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
  const product = await prisma.product.findFirst({
    where: { ...publishedFromActiveVendor, slug },
    select: detailSelect,
  });
  return product ? toProductDetail(product) : null;
}

/** In-stock, active variant sizes for a published product from an active vendor. */
export async function getAvailableSizes(slug: string): Promise<string[]> {
  const product = await prisma.product.findFirst({
    where: { ...publishedFromActiveVendor, slug },
    select: {
      variants: {
        where: { status: ProductVariantStatus.ACTIVE, stock: { gt: 0 } },
        select: { size: true },
        orderBy: { size: "asc" },
      },
    },
  });
  if (!product) return [];
  // A product's variants can share a size across colours; the request
  // form only asks for size, so dedupe to the sizes themselves.
  return Array.from(new Set(product.variants.map((variant) => variant.size)));
}

/**
 * Resolves a (product, size) pair to the ProductVariant it identifies.
 * Only matches in-stock, active variants of published products from active
 * vendors — the same purchasable set getAvailableSizes offers.
 */
export async function resolveVariantId(slug: string, size: string): Promise<string | null> {
  const variant = await prisma.productVariant.findFirst({
    where: {
      size,
      status: ProductVariantStatus.ACTIVE,
      stock: { gt: 0 },
      product: { slug, ...publishedFromActiveVendor },
    },
    select: { id: true },
    orderBy: { id: "asc" },
  });
  return variant?.id ?? null;
}
