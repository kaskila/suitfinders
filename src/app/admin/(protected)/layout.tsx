import { redirect } from "next/navigation";

import { getAdminSession } from "@/lib/auth/session";

import { AdminHeader } from "./admin-header";

/**
 * Every /admin route except /admin/login sits under this group, so a
 * single server-side check covers all of them — never trust a client
 * flag for this. This is also the only shell admin pages get: the public
 * SiteHeader/SiteFooter live in the (site) route group and never reach
 * here, since /admin sits outside it.
 */
export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        Skip to content
      </a>
      <AdminHeader email={session.user.email} />
      <main id="main-content" className="flex-1">
        {children}
      </main>
    </>
  );
}
