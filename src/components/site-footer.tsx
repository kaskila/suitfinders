import Link from "next/link";

import { Container } from "@/components/container";
import { NAV_LINKS } from "@/lib/nav-links";

function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <Container className="flex flex-col gap-6 py-12 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="font-heading text-xl text-foreground">SuitFinders</p>
          <p className="text-sm text-muted-foreground">
            Discover, source, and custom-order suits in Zambia.
          </p>
        </div>
        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="outline-none hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} SuitFinders. All rights reserved.
        </p>
      </Container>
    </footer>
  );
}

export { SiteFooter };
