// src/lib/prisma.ts

import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Prisma 7 requires an adapter for SQLite
// Using better-sqlite3 which works well with Next.js
const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:src/backend/dev.db",
});

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
