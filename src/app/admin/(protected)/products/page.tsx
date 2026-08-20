import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/container";
import { listAllProducts } from "@/lib/data/admin/products";

import { StatusActions } from "./status-actions";

export const metadata: Metadata = {
  title: "Products | SuitFinders Admin",
};

const STATUS_VARIANT = {
  DRAFT: "secondary",
  PUBLISHED: "default",
  ARCHIVED: "outline",
} as const;

export default async function AdminProductsPage() {
  const products = await listAllProducts();

  return (
    <section className="py-16 sm:py-20">
      <Container className="max-w-4xl space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2">
            <h1 className="font-heading text-3xl text-foreground">Products</h1>
            <p className="text-sm text-muted-foreground">
              {products.length} {products.length === 1 ? "product" : "products"}
            </p>
          </div>
          <Button asChild size="lg">
            <Link href="/admin/products/new">New Product</Link>
          </Button>
        </div>

        {products.length === 0 ? (
          <p className="text-base text-muted-foreground">No products yet.</p>
        ) : (
          <ul className="divide-y divide-border border-y border-border">
            {products.map((product) => (
              <li key={product.id} className="flex flex-wrap items-start gap-4 py-6">
                <div className="relative aspect-4/5 w-16 shrink-0 bg-muted">
                  {product.image ? (
                    <Image
                      src={product.image.url}
                      alt={product.image.alt}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  ) : null}
                </div>

                <div className="flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="font-sans text-base font-medium text-foreground underline-offset-4 hover:underline"
                    >
                      {product.name}
                    </Link>
                    <Badge variant={STATUS_VARIANT[product.status]}>{product.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {product.brand.name} · {product.vendor.businessName}
                  </p>
                  <StatusActions id={product.id} status={product.status} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Container>
    </section>
  );
}
