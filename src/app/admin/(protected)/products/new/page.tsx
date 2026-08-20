import type { Metadata } from "next";

import { Container } from "@/components/container";
import { listBrands, listCategories, listVendors } from "@/lib/data/admin/products";
import type { ProductFormInput } from "@/lib/validation/product";

import { ProductForm } from "../product-form";

export const metadata: Metadata = {
  title: "New Product | SuitFinders Admin",
};

const EMPTY_DEFAULTS: ProductFormInput = {
  name: "",
  slug: "",
  description: "",
  brandId: "",
  vendorId: "",
  status: "DRAFT",
  categories: [],
  variants: [{ size: "", color: "", sku: "", price: "", stock: "" }],
  images: [],
};

export default async function NewProductPage() {
  const [brands, vendors, categories] = await Promise.all([
    listBrands(),
    listVendors(),
    listCategories(),
  ]);

  return (
    <section className="py-16 sm:py-20">
      <Container className="max-w-3xl space-y-8">
        <div className="space-y-2">
          <h1 className="font-heading text-3xl text-foreground">New Product</h1>
        </div>

        <ProductForm
          mode="create"
          defaultValues={EMPTY_DEFAULTS}
          brands={brands}
          vendors={vendors}
          categories={categories}
          initialImageUrls={{}}
        />
      </Container>
    </section>
  );
}
