/**
 * The one definition of a valid suit request. Both the client form
 * (react-hook-form's zodResolver) and the Server Action validate against
 * this schema — nothing else may redefine these rules.
 */
import { z } from "zod";

/**
 * Zambian mobile numbers, in the three formats customers actually type:
 *   09XXXXXXXX      — local, leading 0                (10 digits)
 *   2609XXXXXXXX    — country code, no plus            (12 digits)
 *   +2609XXXXXXXX   — country code, with plus           (+ 12 digits)
 * In every case the national subscriber number is 9 digits starting
 * with "9" (e.g. 977123456), just reached via a different prefix.
 */
const ZAMBIAN_PHONE_REGEX = /^(?:\+260|260|0)9\d{8}$/;

/** Strips whichever prefix was used and re-adds the canonical +260 one. */
function normalizePhone(value: string): string {
  const withoutPlus = value.replace(/^\+/, "");
  const nationalNumber = withoutPlus.startsWith("260")
    ? withoutPlus.slice(3)
    : withoutPlus.slice(1); // drop the leading "0"
  return `+260${nationalNumber}`;
}

const phoneSchema = z
  .string()
  .trim()
  .regex(
    ZAMBIAN_PHONE_REGEX,
    "Enter a valid Zambian mobile number, e.g. 0977123456."
  )
  .transform(normalizePhone);

const optionalNonNegativeNumber = z
  .string()
  .optional()
  .transform((value) => (value === undefined || value.trim() === "" ? undefined : Number(value)))
  .pipe(z.number().min(0, "Must be zero or greater.").optional());

export const REQUEST_OCCASIONS = [
  "Wedding",
  "Business",
  "Funeral",
  "Church",
  "Other",
] as const;

export const requestFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Enter your name.")
      .max(80, "Keep your name under 80 characters."),
    phone: phoneSchema,
    whatsappSame: z.boolean().default(true),
    // Not phone-validated at this level — it's only relevant, and only
    // required/normalised, when whatsappSame is false. See superRefine
    // and transform below.
    whatsapp: z.string().optional(),
    // Empty/whitespace collapses to undefined so downstream code (the
    // size-required check below, the Server Action) only ever sees a real
    // slug or nothing — never a "" that looks present but isn't.
    productSlug: z
      .string()
      .optional()
      .transform((value) => (value === undefined || value.trim() === "" ? undefined : value.trim())),
    description: z
      .string()
      .trim()
      .min(10, "Tell us a bit more — at least 10 characters.")
      .max(1000, "Keep your description under 1000 characters."),
    // Free-text and optional when there's no product context. When the
    // buyer arrived via /request?product={slug}, this becomes a required
    // Select of that product's in-stock sizes — enforced below, since a
    // slug identifies a product but a purchasable unit is (slug + size).
    size: z.string().optional(),
    budgetMin: optionalNonNegativeNumber,
    budgetMax: optionalNonNegativeNumber,
    occasion: z
      .string()
      .optional()
      .transform((value) => (value === undefined || value === "" ? undefined : value))
      .pipe(z.enum(REQUEST_OCCASIONS).optional()),
  })
  .superRefine((data, ctx) => {
    if (!data.whatsappSame) {
      const trimmed = data.whatsapp?.trim();
      if (!trimmed) {
        ctx.addIssue({
          code: "custom",
          path: ["whatsapp"],
          message: 'Enter a WhatsApp number, or check "Same as phone number".',
        });
      } else {
        const result = phoneSchema.safeParse(trimmed);
        if (!result.success) {
          ctx.addIssue({
            code: "custom",
            path: ["whatsapp"],
            message: result.error.issues[0].message,
          });
        }
      }
    }

    if (
      data.budgetMin !== undefined &&
      data.budgetMax !== undefined &&
      data.budgetMax < data.budgetMin
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["budgetMax"],
        message: "Maximum budget must be at least the minimum budget.",
      });
    }

    // A slug identifies a product; a purchasable unit is a specific size.
    // Arriving with a product means the buyer must pick one of its
    // in-stock sizes so the Server Action can resolve a ProductVariant.
    if (data.productSlug && !data.size?.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["size"],
        message: "Select a size.",
      });
    }
  })
  .transform((data) => ({
    ...data,
    // Only normalise/keep whatsapp when it's actually in play — if
    // whatsappSame is true the field is hidden and its value is noise.
    whatsapp:
      !data.whatsappSame && data.whatsapp?.trim()
        ? normalizePhone(data.whatsapp.trim())
        : undefined,
    size: data.size?.trim() ? data.size.trim() : undefined,
  }));

/** The validated, normalised payload — final shape consumed by the Server Action. */
export type RequestFormValues = z.infer<typeof requestFormSchema>;

/** Raw field shape as react-hook-form holds it, before parsing/normalising. */
export type RequestFormInput = z.input<typeof requestFormSchema>;
