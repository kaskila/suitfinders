"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth/auth";

/** Invalidates the admin's session server-side (deletes the AdminSession row), then redirects to login. */
export async function signOutAdmin(): Promise<void> {
  await auth.api.signOut({ headers: await headers() });
  redirect("/admin/login");
}
