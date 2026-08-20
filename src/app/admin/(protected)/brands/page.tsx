import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/container";
import { listAllBrands } from "@/lib/data/admin/brands";

import { DeleteBrandButton } from "./delete-brand-button";

export const metadata: Metadata = {
  title: "Brands | SuitFinders Admin",
};

export default async function AdminBrandsPage() {
  const brands = await listAllBrands();

  return (
    <section className="py-16 sm:py-20">
      <Container className="max-w-4xl space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2">
            <h1 className="font-heading text-3xl text-foreground">Brands</h1>
            <p className="text-sm text-muted-foreground">
              {brands.length} {brands.length === 1 ? "brand" : "brands"}
            </p>
          </div>
          <Button asChild size="lg">
            <Link href="/admin/brands/new">New Brand</Link>
          </Button>
        </div>

        {brands.length === 0 ? (
          <p className="text-base text-muted-foreground">No brands yet.</p>
        ) : (
          <ul className="divide-y divide-border border-y border-border">
            {brands.map((brand) => (
              <li key={brand.id} className="flex flex-wrap items-start gap-4 py-6">
                <div className="relative aspect-square w-16 shrink-0 bg-muted">
                  {brand.logoUrl ? (
                    <Image
                      src={brand.logoUrl}
                      alt=""
                      fill
                      sizes="64px"
                      className="object-contain"
                    />
                  ) : null}
                </div>

                <div className="flex-1 space-y-1.5">
                  <Link
                    href={`/admin/brands/${brand.id}/edit`}
                    className="font-sans text-base font-medium text-foreground underline-offset-4 hover:underline"
                  >
                    {brand.name}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    /{brand.slug} · {brand.productCount} {brand.productCount === 1 ? "product" : "products"}
                  </p>
                </div>

                <DeleteBrandButton id={brand.id} name={brand.name} />
              </li>
            ))}
          </ul>
        )}
      </Container>
    </section>
  );
}
