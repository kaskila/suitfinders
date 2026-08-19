import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";

function Hero() {
  return (
    <section className="border-b border-border bg-background md:-mt-16">
      <div className="grid grid-cols-1 md:grid-cols-2 md:items-start">
        <div className="relative order-1 aspect-4/5 w-full md:order-2 md:aspect-auto md:h-144">
          <Image
            src="https://images.unsplash.com/photo-1665495005618-6f55e5f77a07?q=80&w=1200&auto=format&fit=crop"
            alt="Man in a grey tweed suit, smiling"
            fill
            priority
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover object-[50%_18%]"
          />
        </div>
        <div className="order-2 flex flex-col items-start justify-center gap-8 px-4 py-16 sm:px-6 sm:py-20 md:order-1 md:justify-start md:px-8 md:py-0 md:pt-36 md:pb-12 lg:px-12 lg:pt-40">
          <h1 className="max-w-xl font-heading text-4xl leading-tight text-foreground sm:text-5xl lg:text-6xl">
            The suit you&apos;re looking for is already in Lusaka.
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground">
            Browse suits from tailors, boutiques and importers across the city.
            Can&apos;t find it? Tell us what you want and we&apos;ll go and find it.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Button asChild size="lg" className="h-12 px-8 text-base">
              <Link href="/suits">Find a Suit</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 px-8 text-base">
              <Link href="/request">Request a Suit</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export { Hero };
