/**
 * Better Auth, scoped to exactly one purpose: authenticating the single
 * seeded admin for /admin. It owns its own tables (AdminUser, AdminSession,
 * AdminAccount, AdminVerification) via the modelName overrides below — none
 * of them are the domain model's User/Admin, and Better Auth never touches
 * those.
 *
 * disableSignUp is set because there is no signup route: the one admin is
 * seeded (see prisma/seed.ts), and leaving sign-up reachable would let
 * anyone create a session-bearing account, which is the only thing /admin's
 * authorization check relies on existing.
 */
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";

import { prisma } from "@/lib/db/prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
  },
  user: { modelName: "AdminUser" },
  session: { modelName: "AdminSession" },
  account: { modelName: "AdminAccount" },
  verification: { modelName: "AdminVerification" },
  plugins: [nextCookies()],
});
