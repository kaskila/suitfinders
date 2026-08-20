import { ClosingCta } from "@/components/home/closing-cta";
import { FeaturedProducts } from "@/components/home/featured-products";
import { Hero } from "@/components/home/hero";
import { HowItWorks } from "@/components/home/how-it-works";

export default function Home() {
  return (
    <>
      <Hero />
      <FeaturedProducts />
      <HowItWorks />
      <ClosingCta />
    </>
  );
}
