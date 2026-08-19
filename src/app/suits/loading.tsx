import { Container } from "@/components/container";

const SKELETON_COUNT = 6;

export default function Loading() {
  return (
    <section className="py-16 sm:py-20">
      <Container className="space-y-10">
        <div className="space-y-2">
          <div className="h-10 w-40 animate-pulse bg-muted sm:h-12" />
          <div className="h-5 w-56 animate-pulse bg-muted" />
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
            <div key={index} className="space-y-4">
              <div className="aspect-4/5 w-full animate-pulse bg-muted" />
              <div className="space-y-2">
                <div className="h-3 w-20 animate-pulse bg-muted" />
                <div className="h-5 w-3/4 animate-pulse bg-muted" />
                <div className="h-4 w-24 animate-pulse bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
