import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/container";
import { SectionHeading } from "@/components/section-heading";

function ClosingCta() {
  return (
    <section className="bg-foreground py-16 text-background sm:py-20">
      <Container className="flex flex-col items-start gap-5">
        <SectionHeading title="Can't find it? That's the whole point." className="max-w-2xl" />
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
