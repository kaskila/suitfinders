"use server";

import { revalidatePath } from "next/cache";

import type { ProductStatus } from "@/generated/prisma/enums";
import {
  createProduct,
  ProductPrimaryCategoryConflictError,
  ProductSkuConflictError,
  ProductSlugConflictError,
  setProductStatus,
  updateProduct,
} from "@/lib/data/admin/products";
import { productFormSchema, type ProductFormInput } from "@/lib/validation/product";

export type ProductActionResult =
  | { ok: true; id: string; slug: string }
  | { ok: false; errors: Record<string, string> };

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
 * Maps the typed conflict errors lib/data/admin/products.ts throws to
 * field-level messages. Anything else is an unexpected failure — logged,
 * never leaked to the client as a raw Prisma/database error.
 */
function errorsFromWriteFailure(error: unknown): Record<string, string> {
  if (error instanceof ProductSlugConflictError) {
    return { slug: "This slug is already in use. Choose another." };
  }
  if (error instanceof ProductSkuConflictError) {
    return { variants: "One of these SKUs is already in use on another product." };
  }
  if (error instanceof ProductPrimaryCategoryConflictError) {
    return { categories: "Only one category can be marked primary." };
  }
  console.error("Failed to write product:", error);
  return { form: "Something went wrong on our end. Please try again." };
}

export async function createProductAction(input: ProductFormInput): Promise<ProductActionResult> {
  // Server-side parse is the actual control — the client's zodResolver is
  // a courtesy, not something the server can rely on.
  const parsed = productFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, errors: fieldErrorsFrom(parsed.error.issues) };
  }

  try {
    const product = await createProduct(parsed.data);
    revalidatePath("/admin/products");
    revalidatePath("/suits");
    return { ok: true, id: product.id, slug: product.slug };
  } catch (error) {
    return { ok: false, errors: errorsFromWriteFailure(error) };
  }
}

export async function updateProductAction(
  id: string,
  input: ProductFormInput
): Promise<ProductActionResult> {
  const parsed = productFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, errors: fieldErrorsFrom(parsed.error.issues) };
  }

  try {
    const product = await updateProduct(id, parsed.data);
    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${id}/edit`);
    revalidatePath("/suits");
    revalidatePath(`/suits/${product.slug}`);
    return { ok: true, id: product.id, slug: product.slug };
  } catch (error) {
    return { ok: false, errors: errorsFromWriteFailure(error) };
  }
}

export async function setProductStatusAction(id: string, status: ProductStatus): Promise<void> {
  await setProductStatus(id, status);
  revalidatePath("/admin/products");
  revalidatePath("/suits");
}
