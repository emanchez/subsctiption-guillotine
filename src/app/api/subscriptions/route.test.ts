import { describe, it, expect, vi, beforeEach } from "vitest";

const usersFixture = [
  {
    id: "user-1",
    email: "a@b.com",
    username: "user1",
    createdAt: new Date().toISOString(),
    timezone: "UTC",
    emailNotifications: true,
  },
];

const subsFixture = {
  data: [
    {
      id: 1,
      name: "Netflix",
      cost: 9.99,
      cycle: "monthly",
      renewalDate: "2025-12-01T00:00:00Z",
      createdAt: "2025-11-01T00:00:00Z",
      updatedAt: "2025-11-01T00:00:00Z",
      userId: "user-1",
      isActive: true,
    },
  ],
};

// We'll mock Prisma client methods instead of fs reads now that the route uses the DB
vi.mock("@/lib/prisma", () => {
  return {
    prisma: {
      user: {
        findUnique: vi.fn(),
      },
      subscription: {
        findMany: vi.fn(),
      },
    },
  };
});

// Import the route AFTER setting up the mock
import { GET } from "./route";
import { prisma } from "@/lib/prisma";

// Get mocked prisma (treat methods as any for mock helpers)
const mockedPrisma = prisma as any;

describe("/api/subscriptions GET", () => {
  beforeEach(() => {
    // clear previous mock implementations
    (mockedPrisma.user.findUnique as any).mockReset?.();
    (mockedPrisma.subscription.findMany as any).mockReset?.();
  });

  it("returns 400 when missing userID", async () => {
    const res = await GET(new Request("http://localhost/api/subscriptions"));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/Missing userID/);
  });

  it("returns 404 when user not found", async () => {
    // mock user not found
    (mockedPrisma.user.findUnique as any).mockResolvedValue(null as any);

    const res = await GET(
      new Request("http://localhost/api/subscriptions?userID=not-found")
    );
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toMatch(/User not found/);
  });

  it("returns 200 and subscriptions for valid user", async () => {
    // mock user exists and subscriptions
    (mockedPrisma.user.findUnique as any).mockResolvedValue(
      usersFixture[0] as any
    );
    (mockedPrisma.subscription.findMany as any).mockResolvedValue(
      subsFixture.data as any
    );

    const res = await GET(
      new Request("http://localhost/api/subscriptions?userID=user-1")
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.value.subscriptions)).toBe(true);
    expect(body.value.subscriptions[0].userId).toBe("user-1");
  });

  it("returns 500 when database query fails", async () => {
    // mock user exists but subscription query throws (simulate DB error)
    (mockedPrisma.user.findUnique as any).mockResolvedValue(
      usersFixture[0] as any
    );
    (mockedPrisma.subscription.findMany as any).mockImplementation(async () => {
      throw new Error("Database query failed");
    });

    const res = await GET(
      new Request("http://localhost/api/subscriptions?userID=user-1")
    );
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toMatch(/Invalid subs shape/);
  });
});
