import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/container";

function ClosingCta() {
  return (
    <section className="bg-foreground py-20 text-background sm:py-28">
      <Container className="flex flex-col items-start gap-6">
        <h2 className="max-w-2xl font-heading text-3xl leading-tight sm:text-4xl">
          Can&apos;t find it? That&apos;s the whole point.
        </h2>
        <p className="max-w-xl text-lg text-background/80">
          Most of what&apos;s available in Lusaka never makes it online. Tell
          us what you&apos;re after and we&apos;ll do the looking.
        </p>
        <Button asChild size="lg" className="h-12 px-8 text-base">
          <Link href="/request">Request a Suit</Link>
        </Button>
      </Container>
    </section>
  );
}

export { ClosingCta };
