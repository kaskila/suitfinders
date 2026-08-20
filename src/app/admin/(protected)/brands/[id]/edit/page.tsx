import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Container } from "@/components/container";
import { getBrandForEdit } from "@/lib/data/admin/brands";
import type { BrandFormInput } from "@/lib/validation/brand";

import { BrandForm } from "../../brand-form";

export const metadata: Metadata = {
  title: "Edit Brand | SuitFinders Admin",
};

export default async function EditBrandPage({ params }: PageProps<"/admin/brands/[id]/edit">) {
  const { id } = await params;
  const brand = await getBrandForEdit(id);

  if (!brand) {
    notFound();
  }

  const defaultValues: BrandFormInput = {
    name: brand.name,
    slug: brand.slug,
    description: brand.description,
    logoRef: brand.logoRef,
  };

  return (
    <section className="py-16 sm:py-20">
      <Container className="max-w-2xl space-y-8">
        <div className="space-y-2">
          <h1 className="font-heading text-3xl text-foreground">Edit Brand</h1>
        </div>

        <BrandForm
          mode="edit"
          brandId={brand.id}
          defaultValues={defaultValues}
          initialLogoUrl={brand.logoUrl ?? undefined}
        />
      </Container>
    </section>
  );
}
