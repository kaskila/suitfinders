/**
 * Admin-only reads and writes for existing custom requests — the inbox
 * list, status changes, and admin notes. The public write
 * (createCustomRequest) lives in lib/data/requests.ts instead; this file
 * never creates a request, only reads and updates ones that already exist.
 */
import type { CustomRequestStatus, RequestOccasion } from "@/generated/prisma/enums";
import { prisma } from "@/lib/db/prisma";
import type { CustomRequestListItem } from "@/lib/types";

const OCCASION_LABELS: Record<RequestOccasion, string> = {
  WEDDING: "Wedding",
  BUSINESS: "Business",
  FUNERAL: "Funeral",
  CHURCH: "Church",
  OTHER: "Other",
};

// CLOSED/LOST are terminal — hidden by default so the inbox reflects what
// still needs attention, not the full history.
const HIDDEN_BY_DEFAULT: CustomRequestStatus[] = ["CLOSED", "LOST"];

/** Every request, newest first. Hides CLOSED/LOST unless showAll is set. */
export async function listRequests({
  showAll = false,
}: { showAll?: boolean } = {}): Promise<CustomRequestListItem[]> {
  const requests = await prisma.customRequest.findMany({
    where: showAll ? undefined : { status: { notIn: HIDDEN_BY_DEFAULT } },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      createdAt: true,
      contactName: true,
      contactPhone: true,
      contactWhatsapp: true,
      occasion: true,
      status: true,
      adminNotes: true,
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
    status: request.status,
    adminNotes: request.adminNotes,
    // Converted from Prisma.Decimal here, once, same as the product data layer.
    budgetMin: request.budgetMin ? request.budgetMin.toNumber() : null,
    budgetMax: request.budgetMax ? request.budgetMax.toNumber() : null,
  }));
}

export async function setRequestStatus(id: string, status: CustomRequestStatus): Promise<void> {
  await prisma.customRequest.update({ where: { id }, data: { status } });
}

/** adminNotes is free-form and deliberately unvalidated (see domain-model.md). */
export async function updateRequestAdminNotes(id: string, adminNotes: string | null): Promise<void> {
  await prisma.customRequest.update({ where: { id }, data: { adminNotes } });
}
