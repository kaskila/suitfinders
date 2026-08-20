import { redirect } from "next/navigation";

import { getAdminSession } from "@/lib/auth/session";

/**
 * Every /admin route except /admin/login sits under this group, so a
 * single server-side check covers all of them — never trust a client
 * flag for this.
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

  return <>{children}</>;
}
