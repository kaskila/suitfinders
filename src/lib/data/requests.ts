/**
 * The centralized data-access path for custom requests: this is the only
 * file that writes CustomRequest (createCustomRequest), and the admin
 * inbox reads through getRequests here rather than querying Prisma itself.
 */
import type { RequestOccasion } from "@/generated/prisma/enums";
import { prisma } from "@/lib/db/prisma";
import type { CustomRequestListItem } from "@/lib/types";

const OCCASION_LABELS: Record<RequestOccasion, string> = {
  WEDDING: "Wedding",
  BUSINESS: "Business",
  FUNERAL: "Funeral",
  CHURCH: "Church",
  OTHER: "Other",
};

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

/** Every request, newest first, for the admin inbox. */
export async function getRequests(): Promise<CustomRequestListItem[]> {
  const requests = await prisma.customRequest.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      createdAt: true,
      contactName: true,
      contactPhone: true,
      contactWhatsapp: true,
      occasion: true,
      budgetMin: true,
      budgetMax: true,
      description: true,
      productVariant: {
        select: {
          size: true,
          product: { select: { name: true } },
        },
      },
    },
  });

  return requests.map((request) => ({
    id: request.id,
    createdAt: request.createdAt,
    contactName: request.contactName,
    contactPhone: request.contactPhone,
    contactWhatsapp: request.contactWhatsapp,
    description: request.description,
    product: request.productVariant
      ? { name: request.productVariant.product.name, size: request.productVariant.size }
      : null,
    occasion: request.occasion ? OCCASION_LABELS[request.occasion] : null,
    // Converted from Prisma.Decimal here, once, same as the product data layer.
    budgetMin: request.budgetMin ? request.budgetMin.toNumber() : null,
    budgetMax: request.budgetMax ? request.budgetMax.toNumber() : null,
  }));
}
