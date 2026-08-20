"use server";

import { RequestOccasion } from "@/generated/prisma/enums";
import { getProductBySlug, resolveVariantId } from "@/lib/data/products";
import { createCustomRequest } from "@/lib/data/requests";
import { sendRequestNotificationEmail } from "@/lib/notifications/request-email";
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

  let id: string;
  try {
    ({ id } = await createCustomRequest({
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
    }));
  } catch (error) {
    // Never leak a raw Prisma/database error message to the client.
    console.error("Failed to create custom request:", error);
    return {
      ok: false,
      errors: { form: "Something went wrong on our end. Please try again." },
    };
  }

  // Per docs/architecture.md's Request Notification Behaviour: the buyer's
  // request is already saved above, so a failure here is swallowed rather
  // than surfaced. It is still awaited inside this try/catch (not fired as
  // an un-awaited promise) because Vercel may terminate the function
  // container once the action returns, killing in-flight un-awaited work.
  try {
    const product = data.productSlug ? await getProductBySlug(data.productSlug) : null;
    await sendRequestNotificationEmail({
      requestId: id,
      contactName: data.name,
      contactPhone: data.phone,
      contactWhatsapp: data.whatsapp ?? null,
      product: product && data.size ? { name: product.name, size: data.size } : null,
      occasion: data.occasion ?? null,
      description: data.description,
      budgetMin: data.budgetMin ?? null,
      budgetMax: data.budgetMax ?? null,
    });
  } catch (error) {
    console.error("Failed to send request notification email:", error);
  }

  return { ok: true, id };
}
