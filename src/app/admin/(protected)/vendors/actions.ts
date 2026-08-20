"use server";

import { revalidatePath } from "next/cache";

import type { VendorStatus } from "@/generated/prisma/enums";
import { createVendor, setVendorStatus, updateVendor } from "@/lib/data/admin/vendors";
import { vendorFormSchema, type VendorFormInput } from "@/lib/validation/vendor";

export type VendorActionResult = { ok: true; id: string } | { ok: false; errors: Record<string, string> };

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

export async function createVendorAction(input: VendorFormInput): Promise<VendorActionResult> {
  // Server-side parse is the actual control — the client's zodResolver is
  // a courtesy, not something the server can rely on.
  const parsed = vendorFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, errors: fieldErrorsFrom(parsed.error.issues) };
  }

  try {
    const vendor = await createVendor(parsed.data);
    revalidatePath("/admin/vendors");
    return { ok: true, id: vendor.id };
  } catch (error) {
    console.error("Failed to create vendor:", error);
    return { ok: false, errors: { form: "Something went wrong on our end. Please try again." } };
  }
}

export async function updateVendorAction(
  id: string,
  input: VendorFormInput
): Promise<VendorActionResult> {
  const parsed = vendorFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, errors: fieldErrorsFrom(parsed.error.issues) };
  }

  try {
    const vendor = await updateVendor(id, parsed.data);
    revalidatePath("/admin/vendors");
    revalidatePath(`/admin/vendors/${id}/edit`);
    revalidatePath("/suits");
    return { ok: true, id: vendor.id };
  } catch (error) {
    console.error("Failed to update vendor:", error);
    return { ok: false, errors: { form: "Something went wrong on our end. Please try again." } };
  }
}

export async function setVendorStatusAction(id: string, status: VendorStatus): Promise<void> {
  await setVendorStatus(id, status);
  revalidatePath("/admin/vendors");
  revalidatePath("/suits");
}
