import Image from "next/image";
import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";
import { formatPrice } from "@/lib/data/format";
import type { ProductCard as ProductCardData } from "@/lib/types";

function ProductCard({ product }: { product: ProductCardData }) {
  return (
    <Link
      href={`/suits/${product.slug}`}
      className="block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <Card className="h-full transition-shadow hover:shadow-md">
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-muted">
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
        <CardContent className="space-y-1 pt-4">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {product.brand.name}
          </p>
          <h3 className="font-heading text-lg leading-snug text-foreground">
            {product.name}
          </h3>
          <p className="text-sm text-foreground">
            from {formatPrice(product.priceFrom)}
          </p>
          <p className="text-xs text-muted-foreground">
            Sizes: {product.sizes.join(", ")}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

export { ProductCard };
