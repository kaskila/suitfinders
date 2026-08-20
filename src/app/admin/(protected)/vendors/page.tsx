import type { Metadata } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/container";
import { listAllVendors } from "@/lib/data/admin/vendors";

import { VendorStatusToggle } from "./status-toggle";

export const metadata: Metadata = {
  title: "Vendors | SuitFinders Admin",
};

export default async function AdminVendorsPage() {
  const vendors = await listAllVendors();

  return (
    <section className="py-16 sm:py-20">
      <Container className="max-w-4xl space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2">
            <h1 className="font-heading text-3xl text-foreground">Vendors</h1>
            <p className="text-sm text-muted-foreground">
              {vendors.length} {vendors.length === 1 ? "vendor" : "vendors"}
            </p>
          </div>
          <Button asChild size="lg">
            <Link href="/admin/vendors/new">New Vendor</Link>
          </Button>
        </div>

        {vendors.length === 0 ? (
          <p className="text-base text-muted-foreground">No vendors yet.</p>
        ) : (
          <ul className="divide-y divide-border border-y border-border">
            {vendors.map((vendor) => (
              <li key={vendor.id} className="flex flex-wrap items-start justify-between gap-4 py-6">
                <div className="flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/admin/vendors/${vendor.id}/edit`}
                      className="font-sans text-base font-medium text-foreground underline-offset-4 hover:underline"
                    >
                      {vendor.businessName}
                    </Link>
                    <Badge variant={vendor.status === "ACTIVE" ? "default" : "secondary"}>
                      {vendor.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {vendor.contactInfo || "No contact info"} ·{" "}
                    {vendor.productCount} {vendor.productCount === 1 ? "product" : "products"}
                  </p>
                </div>
                <VendorStatusToggle id={vendor.id} status={vendor.status} />
              </li>
            ))}
          </ul>
        )}
      </Container>
    </section>
  );
}
