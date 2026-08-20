/**
 * The centralized write path for custom requests. This is the only file
 * that writes CustomRequest — everything else (the Server Action) goes
 * through createCustomRequest below.
 */
import type { RequestOccasion } from "@/generated/prisma/enums";
import { prisma } from "@/lib/db/prisma";

export interface CreateCustomRequestInput {
  contactName: string;
  contactPhone: string;
  contactWhatsapp: string | null;
  productVariantId: string | null;
  size: string | null;
  occasion: RequestOccasion | null;
  description: string;
  budgetMin: number | null;
  budgetMax: number | null;
}

export async function createCustomRequest(
  data: CreateCustomRequestInput
): Promise<{ id: string }> {
  return prisma.customRequest.create({
    data: {
      // Buyers submit requests without an account; see domain-model.md's
      // Authentication Scope.
      customerId: null,
      contactName: data.contactName,
      contactPhone: data.contactPhone,
      contactWhatsapp: data.contactWhatsapp,
      productVariantId: data.productVariantId,
      size: data.size,
      occasion: data.occasion,
      description: data.description,
      budgetMin: data.budgetMin,
      budgetMax: data.budgetMax,
      // No measurements UI exists yet; the column is required, so an empty
      // object is the only value available until that form ships.
      measurements: {},
    },
    select: { id: true },
  });
}
