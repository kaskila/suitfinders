import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/container";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { getPublishedProducts } from "@/lib/data/products";

export const metadata: Metadata = {
  title: "Suits | SuitFinders",
  description:
    "Browse suits available from tailors, boutiques and importers in Lusaka.",
};

export default async function SuitsPage() {
  const products = await getPublishedProducts();

  return (
    <section className="py-16 sm:py-20">
      <Container className="space-y-10">
        <div className="space-y-2">
          <h1 className="font-heading text-4xl leading-tight text-foreground sm:text-5xl">
            Suits
          </h1>
          <p className="text-base text-muted-foreground">
            {products.length} {products.length === 1 ? "suit" : "suits"} available in
            Lusaka
          </p>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="space-y-4 py-12">
            <h2 className="font-heading text-2xl text-foreground">
              Nothing listed right now.
            </h2>
            <p className="max-w-md text-base text-muted-foreground">
              Tell us what you&apos;re looking for and we&apos;ll go and find it.
            </p>
            <Button asChild size="lg" className="h-12 px-8 text-base">
              <Link href="/request">Request a Suit</Link>
            </Button>
          </div>
        )}
      </Container>
    </section>
  );
}
