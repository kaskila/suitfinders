"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Container } from "@/components/container";
import { MobileNav } from "@/components/mobile-nav";
import { NAV_LINKS } from "@/lib/nav-links";
import { cn } from "@/lib/utils";

function SiteHeader() {
  // The homepage hero bleeds its paper background and image up behind the
  // header (see Hero's md:-mt-16). Every other route keeps the header
  // exactly as it's always been: opaque, full-width, in normal flow.
  const isHome = usePathname() === "/";

  return (
    <header
      className={cn(
        "border-b border-border bg-background",
        isHome && "md:relative md:z-10 md:border-0 md:bg-transparent"
      )}
    >
      <Container
        className={cn(isHome && "md:grid md:max-w-none md:grid-cols-2 md:px-0")}
      >
        <div
          className={cn(
            "flex h-16 items-center justify-between",
            isHome && "md:px-8 lg:px-12"
          )}
        >
          <Link
            href="/"
            className="font-heading text-2xl text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            SuitFinders
          </Link>

          {/*
            The split-column home header only has half the viewport to work
            with, so "Suits / Request a Suit / About" doesn't fit until the
            wider lg breakpoint — below that it falls back to the hamburger,
            same as mobile. Every other route keeps the original md switch.
          */}
          <nav aria-label="Primary" className={isHome ? "hidden lg:block" : "hidden md:block"}>
            <ul className="flex items-center gap-8">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm font-medium text-foreground outline-none hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <MobileNav
            triggerClassName={isHome ? "size-11 md:inline-flex lg:hidden" : "size-11 md:hidden"}
          />
        </div>
      </Container>
    </header>
  );
}

export { SiteHeader };
