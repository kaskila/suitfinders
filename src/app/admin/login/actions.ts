"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth/auth";

export async function loginAdmin(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  try {
    await auth.api.signInEmail({
      body: { email, password },
      headers: await headers(),
    });
  } catch {
    // Better Auth throws on invalid credentials; never surface its message
    // (or whether the email exists) to the client — a generic flag is all
    // the login page needs to show an error.
    redirect("/admin/login?error=1");
  }

  redirect("/admin/requests");
}
