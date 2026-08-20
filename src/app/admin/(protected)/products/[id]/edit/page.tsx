import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Container } from "@/components/container";
import {
  getProductForEdit,
  listBrands,
  listCategories,
  listVendors,
} from "@/lib/data/admin/products";
import type { ProductFormInput } from "@/lib/validation/product";

import { ProductForm } from "../../product-form";

export const metadata: Metadata = {
  title: "Edit Product | SuitFinders Admin",
};

export default async function EditProductPage({ params }: PageProps<"/admin/products/[id]/edit">) {
  const { id } = await params;
  const [product, brands, vendors, categories] = await Promise.all([
    getProductForEdit(id),
    listBrands(),
    listVendors(),
    listCategories(),
  ]);

  if (!product) {
    notFound();
  }

  const defaultValues: ProductFormInput = {
    name: product.name,
    slug: product.slug,
    description: product.description,
    brandId: product.brandId,
    vendorId: product.vendorId,
    status: product.status,
    categories: product.categories,
    variants: product.variants.map((variant) => ({
      id: variant.id,
      size: variant.size,
      color: variant.color,
      sku: variant.sku,
      price: variant.price,
      stock: String(variant.stock),
    })),
    images: product.images.map((image) => ({
      storageRef: image.storageRef,
      altText: image.altText,
      sortOrder: image.sortOrder,
    })),
  };

  const initialImageUrls = Object.fromEntries(
    product.images.map((image) => [image.storageRef, image.url])
  );

  return (
    <section className="py-16 sm:py-20">
      <Container className="max-w-3xl space-y-8">
        <div className="space-y-2">
          <h1 className="font-heading text-3xl text-foreground">Edit Product</h1>
        </div>

        <ProductForm
          mode="edit"
          productId={product.id}
          defaultValues={defaultValues}
          brands={brands}
          vendors={vendors}
          categories={categories}
          initialImageUrls={initialImageUrls}
        />
      </Container>
    </section>
  );
}
