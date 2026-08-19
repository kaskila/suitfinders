/**
 * Fixtures today, Prisma tomorrow. This is the only file that changes when
 * the database is wired in — every export here stays async so swapping the
 * fixture reads below for `prisma.product.findMany(...)` calls changes
 * nothing for callers.
 *
 * No component may import from lib/data/fixtures/ directly — only this file
 * (and its siblings under lib/data/) may.
 */
import { ProductStatus } from "@/generated/prisma/enums";
import type { ProductCard, ProductDetail, ProductImageView, ProductVariantView } from "@/lib/types";

import {
  products as productFixtures,
  type ProductFixture,
  type ProductImageFixture,
  type ProductVariantFixture,
} from "./fixtures/products";
import { storageRefToUrl } from "./storage";

function toImageView(image: ProductImageFixture): ProductImageView {
  return {
    id: image.id,
    sortOrder: image.sortOrder,
    url: storageRefToUrl(image.storageRef),
    alt: image.altText,
  };
}

function toVariantView(variant: ProductVariantFixture): ProductVariantView {
  return {
    id: variant.id,
    size: variant.size,
    color: variant.color,
    sku: variant.sku,
    price: variant.price,
    stock: variant.stock,
    inStock: variant.stock > 0,
  };
}

function sortedImages(product: ProductFixture): ProductImageFixture[] {
  return [...product.images].sort((a, b) => a.sortOrder - b.sortOrder);
}

function toProductCard(product: ProductFixture): ProductCard {
  const images = sortedImages(product);
  const prices = product.variants.map((variant) => variant.price);

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    brand: { name: product.brand.name, slug: product.brand.slug },
    vendor: { businessName: product.vendor.businessName },
    image: images.length > 0 ? toImageView(images[0]) : null,
    priceFrom: Math.min(...prices),
    sizes: product.variants.map((variant) => variant.size),
    inStock: product.variants.some((variant) => variant.stock > 0),
  };
}

function toProductDetail(product: ProductFixture): ProductDetail {
  const prices = product.variants.map((variant) => variant.price);

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    // Product.description is nullable in the Prisma schema; the view model
    // is not, so the coercion happens here, once, in the data layer.
    description: product.description ?? "",
    brand: { name: product.brand.name, slug: product.brand.slug },
    vendor: { businessName: product.vendor.businessName },
    category: product.category,
    images: sortedImages(product).map(toImageView),
    variants: product.variants.map(toVariantView),
    priceRange: { min: Math.min(...prices), max: Math.max(...prices) },
    inStock: product.variants.some((variant) => variant.stock > 0),
  };
}

function isPublished(product: ProductFixture): boolean {
  return product.status === ProductStatus.PUBLISHED;
}

export async function getPublishedProducts(): Promise<ProductCard[]> {
  return productFixtures.filter(isPublished).map(toProductCard);
}

export async function getFeaturedProducts(limit: number): Promise<ProductCard[]> {
  return productFixtures.filter(isPublished).slice(0, limit).map(toProductCard);
}

export async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
  const product = productFixtures.find((candidate) => candidate.slug === slug && isPublished(candidate));
  return product ? toProductDetail(product) : null;
}
