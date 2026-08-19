import type { Metadata } from "next";
import Image from "next/image";

import { Container } from "@/components/container";
import { RequestForm } from "@/components/request-form";
import { formatPrice } from "@/lib/data/format";
import { getProductBySlug } from "@/lib/data/products";

export const metadata: Metadata = {
  title: "Request a Suit | SuitFinders",
  description:
    "Tell us what you're looking for and we'll go and find it in Lusaka.",
};

export default async function RequestPage({ searchParams }: PageProps<"/request">) {
  const params = await searchParams;
  const productParam = params.product;
  const slug = typeof productParam === "string" ? productParam : undefined;
  // An invalid or unknown slug is ignored silently — the form just renders blank.
  const product = slug ? await getProductBySlug(slug) : null;

  const primaryImage = product?.images[0] ?? null;
  const priceLabel = product
    ? product.priceRange.min === product.priceRange.max
      ? formatPrice(product.priceRange.min)
      : `${formatPrice(product.priceRange.min)} – ${formatPrice(product.priceRange.max)}`
    : null;

  return (
    <section className="py-16 sm:py-20">
      <Container className="max-w-2xl space-y-10">
        <div className="space-y-2">
          <h1 className="font-heading text-4xl leading-tight text-foreground sm:text-5xl">
            Request a Suit
          </h1>
          <p className="text-base text-muted-foreground">
            Tell us what you&apos;re looking for and we&apos;ll go and find it.
          </p>
        </div>

        {product ? (
          <div className="flex items-center gap-4 border border-border bg-card p-4">
            <div className="relative aspect-4/5 w-16 shrink-0 bg-muted">
              {primaryImage ? (
                <Image
                  src={primaryImage.url}
                  alt={primaryImage.alt}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              ) : null}
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {product.brand.name}
              </p>
              <p className="font-sans text-base font-medium text-foreground">
                {product.name}
              </p>
              <p className="text-sm text-muted-foreground">{priceLabel}</p>
            </div>
          </div>
        ) : null}

        <RequestForm productSlug={product?.slug} />
      </Container>
    </section>
  );
}
