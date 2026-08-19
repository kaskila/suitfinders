import Link from "next/link";

import { Container } from "@/components/container";
import { SectionHeading } from "@/components/section-heading";
import { ProductCard } from "@/components/home/product-card";
import { getFeaturedProducts } from "@/lib/data/products";

async function FeaturedProducts() {
  const products = await getFeaturedProducts(4);

  return (
    <section className="py-20 sm:py-28">
      <Container className="space-y-10">
        <SectionHeading title="Available now" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <Link
          href="/suits"
          className="inline-block text-sm font-medium text-foreground underline underline-offset-4 outline-none hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          See all suits
        </Link>
      </Container>
    </section>
  );
}

export { FeaturedProducts };
