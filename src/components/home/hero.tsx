import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/container";

function Hero() {
  return (
    <section className="border-b border-border bg-background">
      <Container className="flex flex-col items-start gap-8 py-20 sm:py-28 lg:py-36">
        <h1 className="max-w-3xl font-heading text-4xl leading-tight text-foreground sm:text-5xl lg:text-6xl">
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
      </Container>
    </section>
  );
}

export { Hero };
