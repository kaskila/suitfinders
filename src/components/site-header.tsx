"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Container } from "@/components/container";
import { MobileNav } from "@/components/mobile-nav";
import { NAV_LINKS } from "@/lib/nav-links";
import { cn } from "@/lib/utils";

function SiteHeader() {
  // The homepage hero is a full-bleed image the header floats over —
  // absolutely positioned so it takes no layout height, transparent, with
  // light text. Every other route keeps the header exactly as it's always
  // been: opaque, dark text, in normal flow, bottom border.
  const isHome = usePathname() === "/";

  return (
    <header
      className={cn(
        "border-b border-border bg-background",
        isHome && "absolute inset-x-0 top-0 z-10 border-0 bg-transparent"
      )}
    >
      <Container className="flex h-16 items-center justify-between">
        <Link
          href="/"
          className={cn(
            "font-heading text-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            isHome ? "text-[#f8f3ea]" : "text-foreground"
          )}
        >
          SuitFinders
        </Link>

        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    "text-sm font-medium outline-none hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    isHome ? "text-[#f8f3ea]" : "text-foreground"
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <MobileNav
          triggerClassName={cn(
            "size-11 md:hidden",
            isHome && "text-[#f8f3ea] hover:bg-[#f8f3ea]/10 hover:text-[#f8f3ea]"
          )}
        />
      </Container>
    </header>
  );
}

export { SiteHeader };
