/**
 * The centralized write path for admin vendor management. No admin
 * component may query Prisma directly — everything here goes through the
 * shared `prisma` singleton in lib/db/prisma.ts, the same rule the admin
 * product layer (lib/data/admin/products.ts) follows.
 *
 * Vendor.userId is required and unique (see docs/domain-model.md): vendors
 * are admin-managed and have no self-service login, so a vendor's User row
 * is an identity placeholder created alongside it — a random, never-shown
 * email, the same shape prisma/seed.ts uses for its own seeded vendors.
 *
 * There is no delete: setVendorStatus only ever moves a Vendor between
 * ACTIVE and INACTIVE. Vendor.userId/Product.vendorId are RESTRICT
 * (docs/domain-model.md's Deletion Semantics), so a hard delete would fail
 * outright once the vendor has any products. Deactivating instead removes
 * the vendor's products from catalog visibility — enforced once, in
 * lib/data/products.ts's publishedFromActiveVendor filter — without
 * destroying anything.
 */
import crypto from "node:crypto";

import { VendorStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/db/prisma";
import type { VendorFormValues } from "@/lib/validation/vendor";

export interface AdminVendorListItem {
  id: string;
  businessName: string;
  contactInfo: string;
  status: VendorStatus;
  productCount: number;
}

/** Every vendor, alphabetical, with its live product count — for the admin vendor list. */
export async function listAllVendors(): Promise<AdminVendorListItem[]> {
  const vendors = await prisma.vendor.findMany({
    orderBy: { businessName: "asc" },
    select: {
      id: true,
      businessName: true,
      contactInfo: true,
      status: true,
      _count: { select: { products: true } },
    },
  });

  return vendors.map((vendor) => ({
    id: vendor.id,
    businessName: vendor.businessName,
    contactInfo: vendor.contactInfo ?? "",
    status: vendor.status,
    productCount: vendor._count.products,
  }));
}

export interface AdminVendorDetail {
  id: string;
  businessName: string;
  contactInfo: string;
  status: VendorStatus;
}

/** Full editable record for the edit form, or null if the id doesn't exist. */
export async function getVendorForEdit(id: string): Promise<AdminVendorDetail | null> {
  const vendor = await prisma.vendor.findUnique({
    where: { id },
    select: { id: true, businessName: true, contactInfo: true, status: true },
  });
  if (!vendor) return null;

  return {
    id: vendor.id,
    businessName: vendor.businessName,
    contactInfo: vendor.contactInfo ?? "",
    status: vendor.status,
  };
}

/**
 * Creates the vendor's placeholder User identity and the Vendor row
 * together. The address is never surfaced anywhere — it exists purely to
 * satisfy Vendor.userId's required, unique foreign key.
 */
export async function createVendor(data: VendorFormValues): Promise<{ id: string }> {
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: `vendor-${crypto.randomUUID()}@vendors.suitfinders.local`,
        name: data.businessName,
      },
    });
    const vendor = await tx.vendor.create({
      data: {
        userId: user.id,
        businessName: data.businessName,
        contactInfo: data.contactInfo ?? null,
        status: data.status,
      },
      select: { id: true },
    });
    return vendor;
  });
}

export async function updateVendor(id: string, data: VendorFormValues): Promise<{ id: string }> {
  return prisma.vendor.update({
    where: { id },
    data: {
      businessName: data.businessName,
      contactInfo: data.contactInfo ?? null,
      status: data.status,
    },
    select: { id: true },
  });
}

/** ACTIVE | INACTIVE. Never a hard delete — see module comment. */
export async function setVendorStatus(id: string, status: VendorStatus): Promise<void> {
  await prisma.vendor.update({ where: { id }, data: { status } });
}
