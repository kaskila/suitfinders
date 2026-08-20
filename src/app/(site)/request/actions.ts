"use server";

import { RequestOccasion } from "@/generated/prisma/enums";
import { resolveVariantId } from "@/lib/data/products";
import { createCustomRequest } from "@/lib/data/requests";
import {
  requestFormSchema,
  type RequestFormInput,
  type REQUEST_OCCASIONS,
} from "@/lib/validation/request";

export type SubmitRequestResult =
  | { ok: true; id: string }
  | { ok: false; errors: Record<string, string> };

const OCCASION_TO_ENUM: Record<(typeof REQUEST_OCCASIONS)[number], RequestOccasion> = {
  Wedding: RequestOccasion.WEDDING,
  Business: RequestOccasion.BUSINESS,
  Funeral: RequestOccasion.FUNERAL,
  Church: RequestOccasion.CHURCH,
  Other: RequestOccasion.OTHER,
};

function fieldErrorsFrom(issues: { path: PropertyKey[]; message: string }[]): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !(key in errors)) {
      errors[key] = issue.message;
    }
  }
  return errors;
}

export async function submitCustomRequest(input: RequestFormInput): Promise<SubmitRequestResult> {
  // Server-side parse is the actual control — the client's zodResolver is
  // a courtesy for the buyer, not something the server can trust.
  const parsed = requestFormSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, errors: fieldErrorsFrom(parsed.error.issues) };
  }

  const data = parsed.data;

  let productVariantId: string | null = null;
  if (data.productSlug) {
    // data.size is guaranteed present here — the schema's superRefine
    // requires it whenever productSlug is set.
    productVariantId = await resolveVariantId(data.productSlug, data.size!);
    if (!productVariantId) {
      return {
        ok: false,
        errors: { size: "That size is no longer available. Please choose another." },
      };
    }
  }

  try {
    const { id } = await createCustomRequest({
      contactName: data.name,
      // Already normalised to +260XXXXXXXXX by the schema's transform.
      contactPhone: data.phone,
      contactWhatsapp: data.whatsapp ?? null,
      productVariantId,
      size: data.size ?? null,
      occasion: data.occasion ? OCCASION_TO_ENUM[data.occasion] : null,
      description: data.description,
      budgetMin: data.budgetMin ?? null,
      budgetMax: data.budgetMax ?? null,
    });
    return { ok: true, id };
  } catch (error) {
    // Never leak a raw Prisma/database error message to the client.
    console.error("Failed to create custom request:", error);
    return {
      ok: false,
      errors: { form: "Something went wrong on our end. Please try again." },
    };
  }
}
