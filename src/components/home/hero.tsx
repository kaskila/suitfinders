import { ArrowRight, MessageCircle, Ruler, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";

const TRUST_ITEMS = [
  {
    icon: ShieldCheck,
    title: "Trusted Sellers",
    body: "Curated boutiques and tailors",
  },
  {
    icon: Ruler,
    title: "Made or Matched",
    body: "To your measurements, or found in stock",
  },
  {
    icon: MessageCircle,
    title: "Personal Service",
    body: "Real people. Real advice. Real fast.",
  },
] as const;

function Hero() {
  return (
    <section className="relative flex flex-col bg-[#211c17] lg:flex-row">
      <div className="relative order-first aspect-[1755/896] w-full lg:order-2 lg:aspect-auto lg:w-[45%] lg:shrink-0">
        <Image
          src="/suitfinder_hero.webp"
          alt="Suit rail, mannequin in a tailored suit, and shoes on display in a Lusaka boutique"
          fill
          priority
          sizes="(min-width: 1024px) 45vw, 100vw"
          className="object-cover object-[58%_30%]"
        />
        {/* Soft fade so the image doesn't meet the content column as a hard edge. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 hidden w-32 bg-gradient-to-r from-[#211c17] to-transparent lg:block xl:w-40"
        />
      </div>

      <div className="flex flex-col gap-8 px-4 py-14 pt-24 sm:px-6 sm:py-16 sm:pt-28 lg:order-1 lg:w-[55%] lg:shrink-0 lg:justify-center lg:px-8 lg:py-20 lg:pt-24 xl:px-12">
        <div className="space-y-6">
          <p className="text-sm font-semibold tracking-widest text-primary uppercase">
            Find the right fit. Every time.
          </p>
          <h1 className="max-w-xl font-heading text-4xl leading-tight text-[#f8f3ea] sm:text-5xl lg:text-6xl">
            The suit you&apos;re looking for is already in{" "}
            <span className="text-primary">Lusaka.</span>
          </h1>
          <p className="max-w-xl text-lg text-[#f8f3ea]/80">
            Browse suits from tailors, boutiques and importers across the city.
            Can&apos;t find it? Tell us what you want and we&apos;ll go and find it.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Button asChild size="lg" className="h-12 px-8 text-base">
              <Link href="/suits">
                Find a Suit
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-12 border-[#f8f3ea]/50 bg-transparent px-8 text-base text-[#f8f3ea] hover:bg-[#f8f3ea]/10 hover:text-[#f8f3ea]"
            >
              <Link href="/request">Request a Suit</Link>
            </Button>
          </div>
        </div>

        <ul className="grid grid-cols-1 gap-6 border-t border-[#f8f3ea]/10 pt-6 sm:grid-cols-3">
          {TRUST_ITEMS.map(({ icon: Icon, title, body }) => (
            <li key={title} className="flex items-start gap-3">
              <Icon aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-medium text-[#f8f3ea]">{title}</p>
                <p className="text-sm text-[#f8f3ea]/70">{body}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export { Hero };
