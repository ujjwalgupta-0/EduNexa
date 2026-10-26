import { PrismaClient } from "./generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis;

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

// Prisma Client is generated during development. A dev server that stays open
// across a schema change can retain an older singleton without newer models.
const previousClient = globalForPrisma.prisma;
if (previousClient && typeof previousClient.quiz === "undefined") {
  void previousClient.$disconnect().catch(() => {});
  globalForPrisma.prisma = undefined;
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
