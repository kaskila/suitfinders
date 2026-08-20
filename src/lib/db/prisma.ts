/**
 * The only file in the codebase that constructs a PrismaClient. Everything
 * else — data layer, seed script — imports `prisma` from here.
 *
 * Next.js hot reload re-evaluates modules on every save in dev, which would
 * otherwise construct a fresh PrismaClient (and its underlying connection
 * pool) each time. Stashing the instance on `globalThis` survives module
 * reevaluation, so dev keeps reusing the same pool instead of leaking a new
 * one per save. In production the module is evaluated once, so the global
 * is just a no-op indirection.
 */
import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  return new PrismaClient({ adapter });
}

export const prisma: PrismaClient = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
