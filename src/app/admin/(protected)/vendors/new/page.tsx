import type { Metadata } from "next";

import { Container } from "@/components/container";
import type { VendorFormInput } from "@/lib/validation/vendor";

import { VendorForm } from "../vendor-form";

export const metadata: Metadata = {
  title: "New Vendor | SuitFinders Admin",
};

const EMPTY_DEFAULTS: VendorFormInput = {
  businessName: "",
  contactInfo: "",
  status: "ACTIVE",
};

export default function NewVendorPage() {
  return (
    <section className="py-16 sm:py-20">
      <Container className="max-w-lg space-y-8">
        <div className="space-y-2">
          <h1 className="font-heading text-3xl text-foreground">New Vendor</h1>
        </div>

        <VendorForm mode="create" defaultValues={EMPTY_DEFAULTS} />
      </Container>
    </section>
  );
}
