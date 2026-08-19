import { Container } from "@/components/container";
import { SectionHeading } from "@/components/section-heading";

const STEPS = [
  {
    title: "Tell us what you need",
    body: "Size, colour, budget, occasion. As specific or as vague as you like.",
  },
  {
    title: "We source it",
    body: "We work our network of Lusaka tailors, boutiques and importers.",
  },
  {
    title: "You try it on",
    body: "We connect you with the vendor and arrange the fitting.",
  },
];

function HowItWorks() {
  return (
    <section className="border-t border-border py-20 sm:py-28">
      <Container className="space-y-12">
        <SectionHeading title="How it works" />
        <ol className="grid grid-cols-1 gap-10 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <li key={step.title} className="space-y-3">
              <span className="font-heading text-3xl text-primary" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="font-heading text-xl text-foreground">{step.title}</h3>
              <p className="text-base text-muted-foreground">{step.body}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}

export { HowItWorks };
