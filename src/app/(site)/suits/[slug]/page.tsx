import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/components/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/data/format";
import { getProductBySlug, getPublishedProducts } from "@/lib/data/products";
import { cn } from "@/lib/utils";

export async function generateStaticParams() {
  const products = await getPublishedProducts();
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/suits/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {};
  }

  return {
    title: `${product.name} | SuitFinders`,
    description: `${product.name} by ${product.brand.name}, available in Lusaka from ${formatPrice(product.priceRange.min)}.`,
  };
}

export default async function ProductPage({ params }: PageProps<"/suits/[slug]">) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const primaryImage = product.images[0] ?? null;
  const priceLabel =
    product.priceRange.min === product.priceRange.max
      ? formatPrice(product.priceRange.min)
      : `${formatPrice(product.priceRange.min)} – ${formatPrice(product.priceRange.max)}`;

  return (
    <section className="py-16 sm:py-20">
      <Container>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-start">
          <div className="relative aspect-4/5 w-full bg-muted">
            {primaryImage ? (
              <Image
                src={primaryImage.url}
                alt={primaryImage.alt}
                fill
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
                {product.name}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {product.brand.name}
              </p>
              <h1 className="font-heading text-4xl leading-tight text-foreground sm:text-5xl">
                {product.name}
              </h1>
              <p className="text-lg text-foreground">{priceLabel}</p>
            </div>

            {product.description ? (
              <p className="max-w-prose text-base text-muted-foreground">
                {product.description}
              </p>
            ) : null}

            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Available sizes</p>
              <ul className="flex flex-wrap gap-2">
                {product.variants.map((variant) => (
                  <li key={variant.id}>
                    <Badge
                      variant={variant.inStock ? "outline" : "secondary"}
                      className={cn(!variant.inStock && "text-muted-foreground")}
                    >
                      {variant.size}
                      {!variant.inStock ? " · Out of stock" : null}
                    </Badge>
                  </li>
                ))}
              </ul>
            </div>

            <p className="text-sm text-muted-foreground">
              Sold by {product.vendor.businessName}
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-12 px-8 text-base">
                <Link href={`/request?product=${product.slug}`}>
                  Request this suit
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-12 px-8 text-base">
                <Link href="/suits">Back to all suits</Link>
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
