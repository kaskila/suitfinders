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
  const alt =
    "Suit rail, mannequin in a tailored suit, and shoes on display in a Lusaka boutique";

  const content = (
    <>
      <div className="space-y-6">
        <p className="inline-block rounded bg-[#211c17]/90 px-3 py-1 -mx-3 text-sm font-semibold tracking-widest text-primary uppercase">
          Find the right fit. Every time.
        </p>
        <h1 className="max-w-xl font-heading text-4xl leading-tight text-[#f8f3ea] sm:text-5xl lg:text-6xl">
          The suit you&apos;re looking for is already in{" "}
          <span className="text-primary">Lusaka.</span>
        </h1>
        <p className="max-w-sm text-lg text-[#f8f3ea]/80 lg:max-w-md">
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
    </>
  );

  return (
    <section className="relative isolate overflow-hidden bg-[#211c17]">
      {/* Below md: image sits in its own band at native aspect ratio, copy stacks
          below on the solid base colour. Nothing overlays the photo, so no scrim
          is needed to protect text — only a light seam fade into the panel below. */}
      <div className="md:hidden">
        <div className="relative aspect-[1691/930] w-full">
          <Image
            src="/suitfinders_hero.webp"
            alt={alt}
            fill
            priority
            sizes="100vw"
            className="object-cover object-[62%_22%]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#211c17]/70 to-transparent"
          />
        </div>
        <div className="flex flex-col gap-8 px-4 py-10">{content}</div>
      </div>

      {/* md and up: unchanged — image fills the section, copy overlays it on a scrim. */}
      <div className="relative hidden md:block">
        <Image
          src="/suitfinders_hero.webp"
          alt={alt}
          fill
          priority
          sizes="100vw"
          className="object-cover object-[40%_38%] lg:object-[54%_38%]"
        />

        {/* Left-to-right scrim (lg+ only): darkest through ~36%, transparent by ~58%. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 hidden lg:block"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(33,28,23,0.85) 0%, rgba(33,28,23,0.85) 36%, rgba(33,28,23,0) 58%)",
          }}
        />
        {/* md to lg: copy stacks over the full width, so the scrim must cover it too. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[#211c17]/85 lg:hidden"
        />
        {/* Bottom-up gradient behind the trust row. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3"
          style={{
            backgroundImage:
              "linear-gradient(to top, rgba(33,28,23,0.9) 0%, rgba(33,28,23,0.9) 45%, rgba(33,28,23,0) 100%)",
          }}
        />

        <div className="relative z-10 flex flex-col gap-8 px-4 py-14 pt-24 sm:px-6 sm:py-16 sm:pt-28 lg:min-h-[85vh] lg:justify-center lg:px-8 lg:py-20 lg:pt-24 xl:px-12">
          {content}
        </div>
      </div>
    </section>
  );
}

export { Hero };
