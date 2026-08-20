/**
 * The one definition of a valid admin vendor submission. Both the client
 * form (react-hook-form's zodResolver) and the create/update Server Actions
 * validate against this schema — nothing else may redefine these rules.
 */
import { z } from "zod";

export const VENDOR_STATUSES = ["ACTIVE", "INACTIVE"] as const;

export const vendorFormSchema = z.object({
  businessName: z
    .string()
    .trim()
    .min(2, "Enter a business name.")
    .max(120, "Keep the name under 120 characters."),
  contactInfo: z
    .string()
    .trim()
    .max(200, "Keep contact info under 200 characters.")
    .optional()
    .transform((value) => (value === undefined || value === "" ? undefined : value)),
  status: z.enum(VENDOR_STATUSES),
});

/** The validated, normalised payload — final shape consumed by the Server Action. */
export type VendorFormValues = z.infer<typeof vendorFormSchema>;
/** Raw field shape as react-hook-form holds it, before parsing/normalising. */
export type VendorFormInput = z.input<typeof vendorFormSchema>;
