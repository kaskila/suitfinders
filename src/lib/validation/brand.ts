/**
 * The one definition of a valid admin brand submission. Both the client
 * form (react-hook-form's zodResolver) and the create/update Server Actions
 * validate against this schema — nothing else may redefine these rules.
 */
import { z } from "zod";

const SLUG_REGEX = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export const brandFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Enter a brand name.")
    .max(120, "Keep the name under 120 characters."),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(2, "Enter a slug.")
    .max(140, "Keep the slug under 140 characters.")
    .regex(SLUG_REGEX, "Use lowercase letters, numbers, and hyphens only."),
  description: z
    .string()
    .trim()
    .max(2000, "Keep the description under 2000 characters.")
    .optional()
    .transform((value) => (value === undefined || value === "" ? undefined : value)),
  // Cloudinary public_id, set by the logo uploader via the same signed
  // upload + verifyUploadedAsset flow product images use.
  logoRef: z
    .string()
    .optional()
    .transform((value) => (value === undefined || value === "" ? undefined : value)),
});

/** The validated, normalised payload — final shape consumed by the Server Action. */
export type BrandFormValues = z.infer<typeof brandFormSchema>;
/** Raw field shape as react-hook-form holds it, before parsing/normalising. */
export type BrandFormInput = z.input<typeof brandFormSchema>;
