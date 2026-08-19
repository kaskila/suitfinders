import Link from "next/link";

import { Container } from "@/components/container";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <section className="py-16 sm:py-20">
      <Container className="space-y-4 py-12">
        <h1 className="font-heading text-3xl text-foreground sm:text-4xl">
          We couldn&apos;t find that suit.
        </h1>
        <p className="max-w-md text-base text-muted-foreground">
          It may have sold out, or the listing may no longer be available.
        </p>
        <Button asChild size="lg" className="h-12 px-8 text-base">
          <Link href="/suits">Back to all suits</Link>
        </Button>
      </Container>
    </section>
  );
}
