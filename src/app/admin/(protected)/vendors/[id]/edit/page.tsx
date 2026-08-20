import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Container } from "@/components/container";
import { getVendorForEdit } from "@/lib/data/admin/vendors";
import type { VendorFormInput } from "@/lib/validation/vendor";

import { VendorForm } from "../../vendor-form";

export const metadata: Metadata = {
  title: "Edit Vendor | SuitFinders Admin",
};

export default async function EditVendorPage({ params }: PageProps<"/admin/vendors/[id]/edit">) {
  const { id } = await params;
  const vendor = await getVendorForEdit(id);

  if (!vendor) {
    notFound();
  }

  const defaultValues: VendorFormInput = {
    businessName: vendor.businessName,
    contactInfo: vendor.contactInfo,
    status: vendor.status,
  };

  return (
    <section className="py-16 sm:py-20">
      <Container className="max-w-lg space-y-8">
        <div className="space-y-2">
          <h1 className="font-heading text-3xl text-foreground">Edit Vendor</h1>
        </div>

        <VendorForm mode="edit" vendorId={vendor.id} defaultValues={defaultValues} />
      </Container>
    </section>
  );
}
