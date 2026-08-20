import type { Metadata } from "next";

import { Container } from "@/components/container";
import type { BrandFormInput } from "@/lib/validation/brand";

import { BrandForm } from "../brand-form";

export const metadata: Metadata = {
  title: "New Brand | SuitFinders Admin",
};

const EMPTY_DEFAULTS: BrandFormInput = {
  name: "",
  slug: "",
  description: "",
  logoRef: "",
};

export default function NewBrandPage() {
  return (
    <section className="py-16 sm:py-20">
      <Container className="max-w-2xl space-y-8">
        <div className="space-y-2">
          <h1 className="font-heading text-3xl text-foreground">New Brand</h1>
        </div>

        <BrandForm mode="create" defaultValues={EMPTY_DEFAULTS} />
      </Container>
    </section>
  );
}
