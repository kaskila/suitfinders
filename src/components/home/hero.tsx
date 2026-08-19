import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";

function Hero() {
  return (
    <section className="relative min-h-[85svh] w-full md:min-h-[90svh]">
      <Image
        src="https://images.unsplash.com/photo-1665495005618-6f55e5f77a07?q=80&w=1600&auto=format&fit=crop"
        alt="Man in a grey tweed suit, smiling"
        fill
        priority
        sizes="100vw"
        className="object-cover object-[50%_18%]"
      />

      {/*
        Scrim: darkens toward the bottom-left, where the panel sits, and
        fades to nothing at the top. This is the legibility fallback if the
        photo is ever swapped — the panel's own opacity is the main guard.
      */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(to_bottom_left,transparent_0%,rgba(33,28,23,0.75)_100%)]"
      />

      <div className="absolute inset-0 flex flex-col justify-end">
        <div className="w-full px-4 pb-10 sm:px-6 sm:pb-12 md:w-auto md:max-w-xl md:px-0 md:pb-20 md:pl-8 lg:pl-12">
          <div className="space-y-6 rounded-lg bg-[#211c17]/75 p-6 backdrop-blur-md sm:p-8">
            <h1 className="max-w-xl font-heading text-4xl leading-tight text-[#f8f3ea] sm:text-5xl lg:text-6xl">
              The suit you&apos;re looking for is already in Lusaka.
            </h1>
            <p className="max-w-xl text-lg text-[#f8f3ea]">
              Browse suits from tailors, boutiques and importers across the city.
              Can&apos;t find it? Tell us what you want and we&apos;ll go and find it.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Button asChild size="lg" className="h-12 px-8 text-base">
                <Link href="/suits">Find a Suit</Link>
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
        </div>
      </div>
    </section>
  );
}

export { Hero };
