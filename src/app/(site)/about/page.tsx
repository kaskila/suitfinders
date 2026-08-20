import type { Metadata } from "next";

import { ClosingCta } from "@/components/home/closing-cta";
import { HowItWorks } from "@/components/home/how-it-works";
import { Container } from "@/components/container";
import { SectionHeading } from "@/components/section-heading";

export const metadata: Metadata = {
  title: "About | SuitFinders",
  description: "What SuitFinders is and how it works.",
};

export default function AboutPage() {
  return (
    <>
      <section className="py-16 sm:py-20">
        <Container className="max-w-2xl space-y-6">
          <SectionHeading
            eyebrow="About"
            title="Suits, sourced from Lusaka."
            description="SuitFinders is a platform for finding and sourcing suits in Zambia. We connect people looking for a suit with tailors, boutiques and importers across Lusaka — and when what you need isn't listed, we go and find it."
          />
          <p className="text-base text-muted-foreground">
            Most of what&apos;s available in Lusaka never makes it online. Browse what&apos;s
            listed, or tell us what you&apos;re after and we&apos;ll do the looking.
          </p>
        </Container>
      </section>

      <HowItWorks />
      <ClosingCta />
    </>
  );
}
