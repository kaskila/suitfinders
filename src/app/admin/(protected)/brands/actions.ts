"use server";

import { revalidatePath } from "next/cache";

import {
  BrandInUseError,
  BrandSlugConflictError,
  createBrand,
  deleteBrand,
  updateBrand,
} from "@/lib/data/admin/brands";
import { brandFormSchema, type BrandFormInput } from "@/lib/validation/brand";

export type BrandActionResult =
  | { ok: true; id: string; slug: string }
  | { ok: false; errors: Record<string, string> };

export type DeleteBrandActionResult = { ok: true } | { ok: false; error: string };

function fieldErrorsFrom(issues: { path: PropertyKey[]; message: string }[]): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of issues) {
    const key = issue.path.join(".");
    if (key && !(key in errors)) {
      errors[key] = issue.message;
    }
  }
  return errors;
}

/**
 * Maps the typed conflict errors lib/data/admin/brands.ts throws to
 * field-level messages. Anything else is an unexpected failure — logged,
 * never leaked to the client as a raw Prisma/database error.
 */
function errorsFromWriteFailure(error: unknown): Record<string, string> {
  if (error instanceof BrandSlugConflictError) {
    return { slug: "This slug is already in use. Choose another." };
  }
  console.error("Failed to write brand:", error);
  return { form: "Something went wrong on our end. Please try again." };
}

export async function createBrandAction(input: BrandFormInput): Promise<BrandActionResult> {
  // Server-side parse is the actual control — the client's zodResolver is
  // a courtesy, not something the server can rely on.
  const parsed = brandFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, errors: fieldErrorsFrom(parsed.error.issues) };
  }

  try {
    const brand = await createBrand(parsed.data);
    revalidatePath("/admin/brands");
    return { ok: true, id: brand.id, slug: brand.slug };
  } catch (error) {
    return { ok: false, errors: errorsFromWriteFailure(error) };
  }
}

export async function updateBrandAction(
  id: string,
  input: BrandFormInput
): Promise<BrandActionResult> {
  const parsed = brandFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, errors: fieldErrorsFrom(parsed.error.issues) };
  }

  try {
    const brand = await updateBrand(id, parsed.data);
    revalidatePath("/admin/brands");
    revalidatePath(`/admin/brands/${id}/edit`);
    return { ok: true, id: brand.id, slug: brand.slug };
  } catch (error) {
    return { ok: false, errors: errorsFromWriteFailure(error) };
  }
}

export async function deleteBrandAction(id: string): Promise<DeleteBrandActionResult> {
  try {
    await deleteBrand(id);
    revalidatePath("/admin/brands");
    return { ok: true };
  } catch (error) {
    if (error instanceof BrandInUseError) {
      return { ok: false, error: "This brand is used by one or more products and can't be deleted." };
    }
    console.error("Failed to delete brand:", error);
    return { ok: false, error: "Something went wrong on our end. Please try again." };
  }
}
