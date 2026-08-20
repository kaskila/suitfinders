/**
 * The centralized write path for admin product management. No admin
 * component may query Prisma directly — everything here goes through the
 * shared `prisma` singleton in lib/db/prisma.ts, the same rule the public
 * catalog layer (lib/data/products.ts) follows.
 *
 * There is no delete: `setProductStatus` only ever moves a Product to
 * ARCHIVED. A Product can be referenced by a CustomRequest indirectly
 * (CustomRequest.productVariantId -> ProductVariant.productId), and
 * ProductVariant.productId is RESTRICT — hard-deleting a Product with any
 * variant a request has ever pointed at would either fail outright or
 * require deleting the variant first, which would silently sever that
 * request's history (see domain-model.md's Deletion Semantics). Archiving
 * removes the product from catalog visibility without destroying anything
 * a request still needs to display.
 */
import { ProductStatus } from "@/generated/prisma/enums";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";
import { storageRefToUrl } from "@/lib/data/storage";
import type { ProductFormValues } from "@/lib/validation/product";

export class ProductSlugConflictError extends Error {}
export class ProductSkuConflictError extends Error {}
export class ProductPrimaryCategoryConflictError extends Error {}

/**
 * Translates a raw Prisma write error into one of the typed conflict
 * errors above, or passes it through unchanged if it isn't one we
 * recognise. Server Actions catch the typed errors and turn them into
 * field-level messages; nothing upstream of this ever sees a raw Prisma
 * error (see architecture.md's Error Handling Principles).
 *
 * Discriminated on the underlying Postgres constraint name, not
 * `meta.modelName` — verified directly against the database that for a
 * NESTED write (prisma.product.create({ data: { categories: { create }}}),
 * the path createProduct actually uses), Prisma reports `meta.modelName`
 * as "Product" (the outer/root model) even when the violation is on
 * ProductCategory's partial unique index. modelName only identifies the
 * nested table correctly for a standalone write, which isn't the code
 * path here, so it can't be the discriminator. The Postgres constraint
 * name in the driver adapter's raw error message is stable regardless of
 * nesting: "Product_slug_key" and "ProductVariant_sku_key" are Prisma's
 * default `@unique` names (see the init migration), and
 * "product_category_one_primary" is the raw-SQL partial index (see the
 * ProductCategory model comment in schema.prisma).
 */
function translateProductWriteError(error: unknown): unknown {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    const meta = error.meta as
      | { driverAdapterError?: { cause?: { originalMessage?: string } } }
      | undefined;
    const originalMessage = meta?.driverAdapterError?.cause?.originalMessage ?? "";

    if (originalMessage.includes("Product_slug_key")) {
      return new ProductSlugConflictError("Slug already in use.");
    }
    if (originalMessage.includes("ProductVariant_sku_key")) {
      return new ProductSkuConflictError("SKU already in use.");
    }
    if (originalMessage.includes("product_category_one_primary")) {
      return new ProductPrimaryCategoryConflictError("Only one primary category is allowed.");
    }
  }
  return error;
}

export interface AdminProductListItem {
  id: string;
  slug: string;
  name: string;
  status: ProductStatus;
  createdAt: Date;
  brand: { name: string };
  vendor: { businessName: string };
  image: { url: string; alt: string } | null;
}

/** Every product, any status, newest first — for the admin product list. */
export async function listAllProducts(): Promise<AdminProductListItem[]> {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      slug: true,
      name: true,
      status: true,
      createdAt: true,
      brand: { select: { name: true } },
      vendor: { select: { businessName: true } },
      images: {
        select: { storageRef: true, altText: true },
        orderBy: { sortOrder: "asc" },
        take: 1,
      },
    },
  });

  return products.map((product) => ({
    id: product.id,
    slug: product.slug,
    name: product.name,
    status: product.status,
    createdAt: product.createdAt,
    brand: product.brand,
    vendor: product.vendor,
    image: product.images[0]
      ? { url: storageRefToUrl(product.images[0].storageRef), alt: product.images[0].altText ?? "" }
      : null,
  }));
}

export interface AdminProductVariant {
  id: string;
  size: string;
  color: string;
  sku: string;
  /** Prisma.Decimal's own string form — never routed through Number(). */
  price: string;
  stock: number;
}

export interface AdminProductImage {
  id: string;
  storageRef: string;
  url: string;
  altText: string;
  sortOrder: number;
}

export interface AdminProductDetail {
  id: string;
  name: string;
  slug: string;
  description: string;
  brandId: string;
  vendorId: string;
  status: ProductStatus;
  categories: { categoryId: string; isPrimary: boolean }[];
  variants: AdminProductVariant[];
  images: AdminProductImage[];
}

/** Full editable record for the edit form, or null if the id doesn't exist. */
export async function getProductForEdit(id: string): Promise<AdminProductDetail | null> {
  const product = await prisma.product.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      brandId: true,
      vendorId: true,
      status: true,
      categories: { select: { categoryId: true, isPrimary: true } },
      variants: {
        orderBy: { createdAt: "asc" },
        select: { id: true, size: true, color: true, sku: true, price: true, stock: true },
      },
      images: {
        orderBy: { sortOrder: "asc" },
        select: { id: true, storageRef: true, altText: true, sortOrder: true },
      },
    },
  });
  if (!product) return null;

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description ?? "",
    brandId: product.brandId,
    vendorId: product.vendorId,
    status: product.status,
    categories: product.categories,
    variants: product.variants.map((variant) => ({
      id: variant.id,
      size: variant.size,
      color: variant.color,
      sku: variant.sku,
      price: variant.price.toString(),
      stock: variant.stock,
    })),
    images: product.images.map((image) => ({
      id: image.id,
      storageRef: image.storageRef,
      url: storageRefToUrl(image.storageRef),
      altText: image.altText ?? "",
      sortOrder: image.sortOrder,
    })),
  };
}

/** Options for the brand/vendor/category selects on the product form. */
export async function listBrands(): Promise<{ id: string; name: string }[]> {
  return prisma.brand.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } });
}

export async function listVendors(): Promise<{ id: string; businessName: string }[]> {
  return prisma.vendor.findMany({
    select: { id: true, businessName: true },
    orderBy: { businessName: "asc" },
  });
}

export async function listCategories(): Promise<{ id: string; name: string }[]> {
  return prisma.category.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } });
}

/**
 * Creates a product with its categories, variants, and images in one
 * nested write (Prisma runs nested creates in a single transaction).
 * Throws ProductSlugConflictError, ProductSkuConflictError, or
 * ProductPrimaryCategoryConflictError for the conflicts the Server Action
 * needs to turn into field errors; anything else propagates unchanged.
 */
export async function createProduct(data: ProductFormValues): Promise<{ id: string; slug: string }> {
  try {
    return await prisma.product.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description ?? null,
        brandId: data.brandId,
        vendorId: data.vendorId,
        status: data.status,
        categories: {
          create: data.categories.map((category) => ({
            categoryId: category.categoryId,
            isPrimary: category.isPrimary,
          })),
        },
        variants: {
          create: data.variants.map((variant) => ({
            size: variant.size,
            color: variant.color,
            sku: variant.sku,
            // Prisma.Decimal parses the string with arbitrary precision
            // (decimal.js), the same avoidance of float error described
            // in lib/validation/product.ts's priceSchema.
            price: new Prisma.Decimal(variant.price),
            stock: variant.stock,
          })),
        },
        images: {
          create: data.images.map((image) => ({
            storageRef: image.storageRef,
            altText: image.altText ?? null,
            sortOrder: image.sortOrder,
          })),
        },
      },
      select: { id: true, slug: true },
    });
  } catch (error) {
    throw translateProductWriteError(error);
  }
}

/**
 * Updates a product's scalar fields and replaces its categories/variants/
 * images. Categories are fully replaced (no external references to a
 * ProductCategory row). Variants and images are matched by id/storageRef
 * and updated in place where possible — a variant a CustomRequest still
 * points at (productVariantId) must keep its id, or that request's link
 * gets silently SET NULL by a delete-and-recreate instead of an update.
 */
export async function updateProduct(
  id: string,
  data: ProductFormValues
): Promise<{ id: string; slug: string }> {
  try {
    return await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id },
        data: {
          name: data.name,
          slug: data.slug,
          description: data.description ?? null,
          brandId: data.brandId,
          vendorId: data.vendorId,
          status: data.status,
        },
      });

      await tx.productCategory.deleteMany({ where: { productId: id } });
      await tx.productCategory.createMany({
        data: data.categories.map((category) => ({
          productId: id,
          categoryId: category.categoryId,
          isPrimary: category.isPrimary,
        })),
      });

      const existingVariants = await tx.productVariant.findMany({
        where: { productId: id },
        select: { id: true },
      });
      const keepVariantIds = new Set(
        data.variants.map((variant) => variant.id).filter((variantId): variantId is string => Boolean(variantId))
      );
      const variantIdsToDelete = existingVariants
        .map((variant) => variant.id)
        .filter((existingId) => !keepVariantIds.has(existingId));
      if (variantIdsToDelete.length > 0) {
        await tx.productVariant.deleteMany({ where: { id: { in: variantIdsToDelete } } });
      }
      for (const variant of data.variants) {
        const variantData = {
          size: variant.size,
          color: variant.color,
          sku: variant.sku,
          price: new Prisma.Decimal(variant.price),
          stock: variant.stock,
        };
        if (variant.id) {
          await tx.productVariant.update({ where: { id: variant.id }, data: variantData });
        } else {
          await tx.productVariant.create({ data: { productId: id, ...variantData } });
        }
      }

      const existingImages = await tx.productImage.findMany({
        where: { productId: id },
        select: { id: true, storageRef: true },
      });
      const keepStorageRefs = new Set(data.images.map((image) => image.storageRef));
      const imageIdsToDelete = existingImages
        .filter((image) => !keepStorageRefs.has(image.storageRef))
        .map((image) => image.id);
      if (imageIdsToDelete.length > 0) {
        await tx.productImage.deleteMany({ where: { id: { in: imageIdsToDelete } } });
      }
      for (const image of data.images) {
        const existing = existingImages.find((candidate) => candidate.storageRef === image.storageRef);
        const imageData = {
          storageRef: image.storageRef,
          altText: image.altText ?? null,
          sortOrder: image.sortOrder,
        };
        if (existing) {
          await tx.productImage.update({ where: { id: existing.id }, data: imageData });
        } else {
          await tx.productImage.create({ data: { productId: id, ...imageData } });
        }
      }

      return { id, slug: data.slug };
    });
  } catch (error) {
    throw translateProductWriteError(error);
  }
}

/** DRAFT | PUBLISHED | ARCHIVED. Never a hard delete — see module comment. */
export async function setProductStatus(id: string, status: ProductStatus): Promise<void> {
  await prisma.product.update({ where: { id }, data: { status } });
}
