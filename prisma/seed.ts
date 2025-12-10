import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import fs from "fs/promises";
import path from "path";
import { User } from "../src/lib/types/user";

// convert JSON data to SQLite data

// Create SQLite adapter for Prisma
const dbUrl = process.env.DATABASE_URL || "file:src/backend/dev.db";

// Create Prisma client with better-sqlite3 adapter
const adapter = new PrismaBetterSqlite3({ url: dbUrl });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Starting database seed...");

  const dataDir = path.join(process.cwd(), "src", "data");
  const usersRaw = await fs.readFile(path.join(dataDir, "users.json"), "utf8");
  const subsRaw = await fs.readFile(path.join(dataDir, "subs.json"), "utf8");

  const users = JSON.parse(usersRaw) as User[];
  const subsParsed = JSON.parse(subsRaw);
  const subs = Array.isArray(subsParsed)
    ? subsParsed
    : subsParsed.data || subsParsed.subscriptions || [];

  console.log(
    `Found ${users.length} users and ${subs.length} subscriptions to migrate`
  );

  // Seed users first (idempotent with upsert)
  let userCount = 0;
  for (const u of users) {
    if (!u.id || !u.email) {
      console.warn(`WARNING: Skipping user with missing id or email:`, u);
      continue;
    }

    await prisma.user.upsert({
      where: { id: u.id },
      update: {
        email: u.email,
        username: u.username,
        timezone: u.timezone,
        emailNotifications: u.emailNotifications ?? true,
      },
      create: {
        id: u.id,
        email: u.email,
        username: u.username,
        timezone: u.timezone,
        emailNotifications: u.emailNotifications ?? true,
        createdAt: u.createdAt ? new Date(u.createdAt) : undefined,
      },
    });
    userCount++;
  }
  console.log(`Seeded ${userCount} users`);

  // Seed subscriptions (idempotent with upsert)
  let subCount = 0;
  let skipped = 0;
  for (const s of subs) {
    // Validate required fields
    if (!s.name || !s.userId || !s.renewalDate) {
      console.warn(
        `WARNING: Skipping subscription with missing required fields:`,
        s
      );
      skipped++;
      continue;
    }

    // Validate renewalDate
    const renewalDate = new Date(s.renewalDate);
    if (isNaN(renewalDate.getTime())) {
      console.warn(
        `WARNING: Skipping subscription with invalid renewalDate:`,
        s
      );
      skipped++;
      continue;
    }

    // Verify user exists
    const userExists = await prisma.user.findUnique({
      where: { id: s.userId },
    });
    if (!userExists) {
      console.warn(
        `WARNING: Skipping subscription for non-existent user ${s.userId}:`,
        s.name
      );
      skipped++;
      continue;
    }

    try {
      await prisma.subscription.upsert({
        where: { id: s.id },
        update: {
          name: s.name,
          cost: s.cost ?? 0,
          cycle: s.cycle ?? "monthly",
          renewalDate: renewalDate,
          updatedAt: s.updatedAt ? new Date(s.updatedAt) : undefined,
          isActive: s.isActive ?? true,
          category: s.category ?? null,
          notes: s.notes ?? null,
          reminder: s.reminderAlert
            ? JSON.stringify(s.reminderAlert)
            : s.reminder || null,
        },
        create: {
          id: s.id,
          name: s.name,
          cost: s.cost ?? 0,
          cycle: s.cycle ?? "monthly",
          renewalDate: renewalDate,
          createdAt: s.createdAt ? new Date(s.createdAt) : undefined,
          updatedAt: s.updatedAt ? new Date(s.updatedAt) : undefined,
          userId: s.userId,
          isActive: s.isActive ?? true,
          category: s.category ?? null,
          notes: s.notes ?? null,
          reminder: s.reminderAlert
            ? JSON.stringify(s.reminderAlert)
            : s.reminder || null,
        },
      });
      subCount++;
    } catch (err) {
      console.error(`ERROR: Failed to upsert subscription ${s.name}:`, err);
      skipped++;
    }
  }
  console.log(`Seeded ${subCount} subscriptions (${skipped} skipped)`);
  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
