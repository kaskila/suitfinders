"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Container } from "@/components/container";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { signOutAdmin } from "./actions";

const ADMIN_NAV_LINKS = [
  { href: "/admin/requests", label: "Requests" },
  { href: "/admin/products", label: "Products" },
] as const;

/** The admin shell's top bar — denser than the public header, same design tokens and active-link pattern. */
function AdminHeader({ email }: { email: string }) {
  const pathname = usePathname();

  return (
    <header className="border-b border-border bg-background">
      <Container className="flex h-14 items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="font-heading text-xl text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            SuitFinders
          </Link>

          <nav aria-label="Admin">
            <ul className="flex items-center gap-6">
              {ADMIN_NAV_LINKS.map((link) => {
                const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);

                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "relative pb-1 text-sm font-medium text-foreground outline-none hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                        isActive &&
                          "after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-primary after:content-['']"
                      )}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">{email}</span>
          <form action={signOutAdmin}>
            <Button type="submit" variant="outline" size="sm">
              Sign out
            </Button>
          </form>
        </div>
      </Container>
    </header>
  );
}

export { AdminHeader };
