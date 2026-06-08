import { PrismaClient } from "@prisma/client";
import { prismaRuntimeLooksStale } from "./prisma-stale";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrismaClient() {
  return new PrismaClient();
}

function getPrismaClient() {
  const cached = globalForPrisma.prisma;
  if (process.env.NODE_ENV === "production") {
    return cached ?? createPrismaClient();
  }

  if (cached && !prismaRuntimeLooksStale(cached)) {
    return cached;
  }

  const next = createPrismaClient();
  globalForPrisma.prisma = next;
  return next;
}

export const prisma = getPrismaClient();
