import type { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/container";
import { formatDate, formatPrice } from "@/lib/data/format";
import { getRequests } from "@/lib/data/requests";
import type { CustomRequestListItem } from "@/lib/types";

export const metadata: Metadata = {
  title: "Requests | SuitFinders Admin",
};

function budgetLabel(min: number | null, max: number | null): string | null {
  if (min === null && max === null) return null;
  if (min !== null && max !== null) return `${formatPrice(min)} – ${formatPrice(max)}`;
  if (min !== null) return `From ${formatPrice(min)}`;
  return `Up to ${formatPrice(max as number)}`;
}

function whatsAppUrl(request: CustomRequestListItem): string {
  // Stored normalised as +260XXXXXXXXX; wa.me wants the same digits, no "+".
  const number = (request.contactWhatsapp ?? request.contactPhone).replace(/^\+/, "");
  const what = request.product
    ? `the ${request.product.name} (${request.product.size})`
    : "your request";
  const text = `Hi ${request.contactName}, this is SuitFinders following up on ${what}.`;
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

export default async function AdminRequestsPage() {
  const requests = await getRequests();

  return (
    <section className="py-16 sm:py-20">
      <Container className="max-w-3xl space-y-8">
        <div className="space-y-2">
          <h1 className="font-heading text-3xl text-foreground">Requests</h1>
          <p className="text-sm text-muted-foreground">
            {requests.length} {requests.length === 1 ? "request" : "requests"}
          </p>
        </div>

        {requests.length === 0 ? (
          <p className="text-base text-muted-foreground">No requests yet.</p>
        ) : (
          <ul className="divide-y divide-border border-y border-border">
            {requests.map((request) => (
              <li key={request.id} className="space-y-3 py-6">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <p className="font-sans text-base font-medium text-foreground">
                    {request.contactName}
                  </p>
                  <p className="text-xs text-muted-foreground">{formatDate(request.createdAt)}</p>
                </div>

                <p className="text-sm text-muted-foreground">{request.contactPhone}</p>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm text-foreground">
                    {request.product
                      ? `${request.product.name} — ${request.product.size}`
                      : "Open request"}
                  </span>
                  {request.occasion ? <Badge variant="outline">{request.occasion}</Badge> : null}
                </div>

                {budgetLabel(request.budgetMin, request.budgetMax) ? (
                  <p className="text-sm text-muted-foreground">
                    Budget: {budgetLabel(request.budgetMin, request.budgetMax)}
                  </p>
                ) : null}

                <p className="max-w-prose text-sm text-muted-foreground">{request.description}</p>

                <a
                  href={whatsAppUrl(request)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-sm font-medium text-foreground underline underline-offset-4 outline-none hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  Message on WhatsApp
                </a>
              </li>
            ))}
          </ul>
        )}
      </Container>
    </section>
  );
}
