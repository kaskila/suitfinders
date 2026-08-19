import Image from "next/image";
import Link from "next/link";

import { formatPrice } from "@/lib/data/format";
import type { ProductCard as ProductCardData } from "@/lib/types";

function ProductCard({ product }: { product: ProductCardData }) {
  return (
    <Link
      href={`/suits/${product.slug}`}
      className="block outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <div className="relative aspect-4/5 w-full bg-muted">
        {product.image ? (
          <Image
            src={product.image.url}
            alt={product.image.alt}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
            {product.name}
          </div>
        )}
      </div>
      <div className="mt-4 space-y-1">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {product.brand.name}
        </p>
        <h3 className="font-sans text-lg leading-snug font-medium text-foreground">
          {product.name}
        </h3>
        <p className="text-sm text-foreground">
          from {formatPrice(product.priceFrom)}
        </p>
        <p className="text-xs text-muted-foreground">{product.sizes.join(", ")}</p>
      </div>
    </Link>
  );
}

export { ProductCard };
