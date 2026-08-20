/**
 * The one definition of a valid admin product submission. Both the client
 * form (react-hook-form's zodResolver) and the create/update Server Actions
 * validate against this schema — nothing else may redefine these rules.
 */
import { z } from "zod";

export const PRODUCT_STATUSES = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;

const SLUG_REGEX = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** Auto-fill for the slug field from the product name; the field stays editable after. */
export function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Kept as a string all the way to the data layer, which parses it with
// Prisma.Decimal (arbitrary-precision, decimal.js-backed) rather than
// Number() — so the value the admin typed never round-trips through an
// IEEE-754 float before it reaches the database.
const priceSchema = z
  .string()
  .trim()
  .regex(/^\d+(\.\d{1,2})?$/, "Enter a price in kwacha, e.g. 1250 or 1250.50.")
  // Number() here is only a magnitude check for validation feedback, not
  // the value that gets stored — the original string is what's persisted.
  .refine((value) => Number(value) > 0, "Price must be greater than zero.");

const stockSchema = z
  .string()
  .trim()
  .regex(/^\d+$/, "Enter a whole number.")
  .transform((value) => Number(value))
  .pipe(z.number().int().min(0, "Stock cannot be negative."));

export const productVariantSchema = z.object({
  // Present only for a variant that already exists (edit mode) — lets the
  // data layer update variants in place rather than delete/recreate them,
  // since a recreated variant would sever any CustomRequest.productVariantId
  // still pointing at it (see domain-model.md's Deletion Semantics).
  id: z.string().optional(),
  size: z.string().trim().min(1, "Size is required.").max(20, "Keep the size under 20 characters."),
  color: z.string().trim().min(1, "Colour is required.").max(40, "Keep the colour under 40 characters."),
  sku: z.string().trim().min(1, "SKU is required.").max(64, "Keep the SKU under 64 characters."),
  price: priceSchema,
  stock: stockSchema,
});

export const productCategorySchema = z.object({
  categoryId: z.string().min(1, "Choose a category."),
  isPrimary: z.boolean(),
});

export const productImageSchema = z.object({
  storageRef: z.string().min(1),
  altText: z
    .string()
    .trim()
    .max(200, "Keep the alt text under 200 characters.")
    .optional()
    .transform((value) => (value === undefined || value === "" ? undefined : value)),
  sortOrder: z.number().int().min(0),
});

export const productFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Enter a product name.")
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
    brandId: z.string().min(1, "Choose a brand."),
    vendorId: z.string().min(1, "Choose a vendor."),
    status: z.enum(PRODUCT_STATUSES),
    categories: z.array(productCategorySchema).min(1, "Select at least one category."),
    variants: z.array(productVariantSchema).min(1, "Add at least one variant."),
    images: z.array(productImageSchema).default([]),
  })
  .superRefine((data, ctx) => {
    const primaryCount = data.categories.filter((category) => category.isPrimary).length;
    if (primaryCount !== 1) {
      ctx.addIssue({
        code: "custom",
        path: ["categories"],
        message: "Choose exactly one primary category.",
      });
    }

    const categoryIds = data.categories.map((category) => category.categoryId);
    if (new Set(categoryIds).size !== categoryIds.length) {
      ctx.addIssue({
        code: "custom",
        path: ["categories"],
        message: "Each category can only be added once.",
      });
    }

    const skus = data.variants.map((variant) => variant.sku.trim().toLowerCase());
    if (new Set(skus).size !== skus.length) {
      ctx.addIssue({
        code: "custom",
        path: ["variants"],
        message: "SKUs must be unique across variants.",
      });
    }
  });

/** The validated, normalised payload — final shape consumed by the Server Action. */
export type ProductFormValues = z.infer<typeof productFormSchema>;
/** Raw field shape as react-hook-form holds it, before parsing/normalising. */
export type ProductFormInput = z.input<typeof productFormSchema>;
