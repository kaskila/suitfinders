/**
 * The centralized write path for admin brand management. No admin
 * component may query Prisma directly — everything here goes through the
 * shared `prisma` singleton in lib/db/prisma.ts, the same rule the admin
 * product layer (lib/data/admin/products.ts) follows.
 *
 * Product.brandId is RESTRICT (docs/domain-model.md's Deletion Semantics):
 * a brand referenced by any product cannot be deleted. deleteBrand()
 * surfaces that as a typed BrandInUseError rather than a raw Prisma error,
 * the same translation pattern lib/data/admin/products.ts uses for its
 * write-conflict errors.
 */
import { Prisma } from "@/generated/prisma/client";
import { deleteCloudinaryAsset } from "@/lib/cloudinary";
import { prisma } from "@/lib/db/prisma";
import { storageRefToUrl } from "@/lib/data/storage";
import type { BrandFormValues } from "@/lib/validation/brand";

export class BrandSlugConflictError extends Error {}
export class BrandInUseError extends Error {}

/**
 * Translates a raw Prisma write error into one of the typed conflict
 * errors above, or passes it through unchanged if it isn't one we
 * recognise. Server Actions catch the typed errors and turn them into
 * user-facing messages; nothing upstream of this ever sees a raw Prisma
 * error (see architecture.md's Error Handling Principles).
 *
 * Discriminated the same way lib/data/admin/products.ts's
 * translateProductWriteError is: on the underlying Postgres constraint
 * name from the driver adapter's raw error, not `meta.modelName`.
 */
function translateBrandWriteError(error: unknown): unknown {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      const meta = error.meta as
        | { driverAdapterError?: { cause?: { originalMessage?: string } } }
        | undefined;
      const originalMessage = meta?.driverAdapterError?.cause?.originalMessage ?? "";
      if (originalMessage.includes("Brand_slug_key")) {
        return new BrandSlugConflictError("Slug already in use.");
      }
    }
    // P2003 is Prisma's documented "foreign key constraint failed" code;
    // in practice, this project's driver-adapter setup (@prisma/adapter-pg
    // on Prisma 7.9.1) reports a delete blocked by Product.brandId's native
    // Postgres RESTRICT constraint as P2039 (Postgres error 23001,
    // restrict_violation) instead — verified directly against the database.
    // Brand has exactly one relation that can block a delete this way, so
    // the code alone is enough; no message parsing needed.
    if (error.code === "P2003" || error.code === "P2039") {
      return new BrandInUseError("This brand is used by one or more products.");
    }
  }
  return error;
}

export interface AdminBrandListItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  logoUrl: string | null;
  productCount: number;
}

/** Every brand, alphabetical, with its live product count — for the admin brand list. */
export async function listAllBrands(): Promise<AdminBrandListItem[]> {
  const brands = await prisma.brand.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      logoRef: true,
      _count: { select: { products: true } },
    },
  });

  return brands.map((brand) => ({
    id: brand.id,
    name: brand.name,
    slug: brand.slug,
    description: brand.description ?? "",
    logoUrl: brand.logoRef ? storageRefToUrl(brand.logoRef) : null,
    productCount: brand._count.products,
  }));
}

export interface AdminBrandDetail {
  id: string;
  name: string;
  slug: string;
  description: string;
  logoRef: string;
  logoUrl: string | null;
}

/** Full editable record for the edit form, or null if the id doesn't exist. */
export async function getBrandForEdit(id: string): Promise<AdminBrandDetail | null> {
  const brand = await prisma.brand.findUnique({
    where: { id },
    select: { id: true, name: true, slug: true, description: true, logoRef: true },
  });
  if (!brand) return null;

  return {
    id: brand.id,
    name: brand.name,
    slug: brand.slug,
    description: brand.description ?? "",
    logoRef: brand.logoRef ?? "",
    logoUrl: brand.logoRef ? storageRefToUrl(brand.logoRef) : null,
  };
}

/** Throws BrandSlugConflictError for a duplicate slug; anything else propagates unchanged. */
export async function createBrand(data: BrandFormValues): Promise<{ id: string; slug: string }> {
  try {
    return await prisma.brand.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description ?? null,
        logoRef: data.logoRef ?? null,
      },
      select: { id: true, slug: true },
    });
  } catch (error) {
    throw translateBrandWriteError(error);
  }
}

/** Throws BrandSlugConflictError for a duplicate slug; anything else propagates unchanged. */
export async function updateBrand(
  id: string,
  data: BrandFormValues
): Promise<{ id: string; slug: string }> {
  try {
    return await prisma.brand.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description ?? null,
        logoRef: data.logoRef ?? null,
      },
      select: { id: true, slug: true },
    });
  } catch (error) {
    throw translateBrandWriteError(error);
  }
}

/**
 * Hard delete — Brand has no lifecycle status to fall back to the way
 * Vendor/Product do. Throws BrandInUseError when Product.brandId's RESTRICT
 * constraint blocks it; anything else propagates unchanged. On success,
 * also removes the brand's logo from Cloudinary so it isn't left orphaned.
 */
export async function deleteBrand(id: string): Promise<void> {
  const brand = await prisma.brand.findUnique({ where: { id }, select: { logoRef: true } });

  try {
    await prisma.brand.delete({ where: { id } });
  } catch (error) {
    throw translateBrandWriteError(error);
  }

  if (brand?.logoRef) {
    await deleteCloudinaryAsset(brand.logoRef);
  }
}
