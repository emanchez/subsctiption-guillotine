import { describe, it, expect, vi, beforeEach } from "vitest";

// Test fixtures for consistent test data
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
      renewalDate: new Date("2025-12-01T00:00:00Z"),
      createdAt: new Date("2025-11-01T00:00:00Z"),
      updatedAt: new Date("2025-11-01T00:00:00Z"),
      userId: "user-1",
      isActive: true,
      reminder: null,
      notes: null,
    },
  ],
};

// Mock Prisma client to avoid database dependencies in tests
vi.mock("@/lib/prisma", () => {
  return {
    prisma: {
      user: {
        findUnique: vi.fn(),
      },
      subscription: {
        findMany: vi.fn(),
        create: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
      },
    },
  };
});

import { prisma } from "@/lib/prisma";
import { PUT, DELETE } from "./[id]/route";

// Import route handlers after setting up mocks
import { GET, POST } from "./route";

// Type assertion for mocked Prisma methods
const mockedPrisma = vi.mocked(prisma);

describe("/api/subscriptions GET", () => {
  beforeEach(() => {
    // Reset all mocks before each test to ensure clean state
    mockedPrisma.user.findUnique.mockReset?.();
    mockedPrisma.subscription.findMany.mockReset?.();
    mockedPrisma.subscription.create.mockReset?.();
  });

  it("returns 400 when missing userID", async () => {
    const res = await GET(new Request("http://localhost/api/subscriptions"));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/Missing userID/);
  });

  it("returns 404 when user not found", async () => {
    // Arrange: Mock user lookup to return null
    mockedPrisma.user.findUnique.mockResolvedValue(null);

    // Act: Make request with non-existent user ID
    const res = await GET(
      new Request("http://localhost/api/subscriptions?userID=not-found")
    );

    // Assert: Should return 404 with appropriate error message
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toMatch(/User not found/);
  });

  it("returns 200 and subscriptions for valid user", async () => {
    // Arrange: Mock successful user and subscription lookups
    mockedPrisma.user.findUnique.mockResolvedValue(usersFixture[0]);
    mockedPrisma.subscription.findMany.mockResolvedValue(subsFixture.data);

    // Act: Make request with valid user ID
    const res = await GET(
      new Request("http://localhost/api/subscriptions?userID=user-1")
    );

    // Assert: Should return 200 with user and subscriptions data
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.value.subscriptions)).toBe(true);
    expect(body.value.subscriptions[0].userId).toBe("user-1");
  });

  it("returns 500 when database query fails", async () => {
    // Arrange: Mock user exists but subscription query throws error
    mockedPrisma.user.findUnique.mockResolvedValue(usersFixture[0]);
    mockedPrisma.subscription.findMany.mockImplementation(async () => {
      throw new Error("Database query failed");
    });

    // Act: Make request that will trigger database error
    const res = await GET(
      new Request("http://localhost/api/subscriptions?userID=user-1")
    );

    // Assert: Should return 500 with error message
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe("Database query failed");
  });
});

describe("/api/subscriptions POST", () => {
  beforeEach(() => {
    // Reset all mocks before each test to ensure clean state
    mockedPrisma.user.findUnique.mockReset?.();
    mockedPrisma.subscription.create.mockReset?.();
  });

  // Valid test data for successful POST requests
  const validPostBody = {
    name: "Spotify",
    cost: 9.99,
    cycle: "monthly" as const,
    renewalDate: "2025-12-15T00:00:00Z",
    userId: "user-1",
    isActive: true,
    category: "entertainment" as const,
    notes: "Premium plan",
  };

  it("returns 400 when required fields are missing", async () => {
    // Arrange: Request body with missing required fields
    const incompleteBody = { name: "Netflix" };

    // Act: Make POST request with incomplete data
    const res = await POST(
      new Request("http://localhost/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(incompleteBody),
      })
    );

    // Assert: Should return 400 with validation error
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("Validation failed");
  });

  it("returns 400 when cycle is invalid", async () => {
    // Arrange: Request body with invalid cycle value
    const invalidBody = {
      ...validPostBody,
      cycle: "weekly", // Invalid cycle
    };

    // Act: Make POST request with invalid cycle
    const res = await POST(
      new Request("http://localhost/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invalidBody),
      })
    );

    // Assert: Should return 400 with validation error
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("Validation failed");
  });

  it("returns 400 when cost is negative", async () => {
    // Arrange: Request body with negative cost
    const invalidBody = {
      ...validPostBody,
      cost: -5, // Negative cost
    };

    // Act: Make POST request with negative cost
    const res = await POST(
      new Request("http://localhost/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invalidBody),
      })
    );

    // Assert: Should return 400 with validation error
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("Validation failed");
  });

  it("returns 400 when renewalDate is invalid", async () => {
    // Arrange: Request body with invalid date format
    const invalidBody = {
      ...validPostBody,
      renewalDate: "not-a-date", // Invalid date
    };

    // Act: Make POST request with invalid date
    const res = await POST(
      new Request("http://localhost/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invalidBody),
      })
    );

    // Assert: Should return 400 with validation error
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("Validation failed");
  });

  it("returns 404 when user not found", async () => {
    // Arrange: Mock user lookup to return null
    mockedPrisma.user.findUnique.mockResolvedValue(null);

    // Act: Make POST request with non-existent user ID
    const res = await POST(
      new Request("http://localhost/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validPostBody),
      })
    );

    // Assert: Should return 404 with user not found error
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toMatch(/User not found/);
  });

  it("returns 200 and creates subscription for valid input", async () => {
    // Arrange: Mock successful user lookup and subscription creation
    mockedPrisma.user.findUnique.mockResolvedValue(usersFixture[0]);

    const createdSub = {
      id: 2,
      name: validPostBody.name,
      cost: validPostBody.cost,
      cycle: validPostBody.cycle,
      renewalDate: new Date(validPostBody.renewalDate),
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: validPostBody.userId,
      isActive: validPostBody.isActive,
      category: validPostBody.category,
      notes: validPostBody.notes,
      reminder: null,
    };
    mockedPrisma.subscription.create.mockResolvedValue(createdSub);

    // Act: Make POST request with valid data
    const res = await POST(
      new Request("http://localhost/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validPostBody),
      })
    );

    // Assert: Should return 200 with created subscription
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.value.subscription).toBeDefined();
    expect(body.value.subscription.name).toBe(validPostBody.name);
    expect(body.value.subscription.userId).toBe(validPostBody.userId);
  });

  it("returns 200 with reminderAlert array", async () => {
    // Arrange: Mock successful user lookup
    mockedPrisma.user.findUnique.mockResolvedValue(usersFixture[0]);

    // Request body with reminder alerts
    const bodyWithReminders = {
      ...validPostBody,
      reminderAlert: [
        { timeframe: "days", value: 3 },
        { timeframe: "hours", value: 24 },
      ],
    };

    const createdSub = {
      id: 3,
      name: bodyWithReminders.name,
      cost: bodyWithReminders.cost,
      cycle: bodyWithReminders.cycle,
      renewalDate: new Date(bodyWithReminders.renewalDate),
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: bodyWithReminders.userId,
      isActive: bodyWithReminders.isActive,
      category: bodyWithReminders.category,
      notes: bodyWithReminders.notes,
      reminder: JSON.stringify(bodyWithReminders.reminderAlert),
    };
    mockedPrisma.subscription.create.mockResolvedValue(createdSub);

    // Act: Make POST request with reminder alerts
    const res = await POST(
      new Request("http://localhost/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyWithReminders),
      })
    );

    // Assert: Should return 200 with reminder alerts preserved
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.value.subscription.reminderAlert).toHaveLength(2);
  });

  it("returns 500 when database create fails", async () => {
    // Arrange: Mock user exists but create operation throws error
    mockedPrisma.user.findUnique.mockResolvedValue(usersFixture[0]);
    mockedPrisma.subscription.create.mockImplementation(async () => {
      throw new Error("Database create failed");
    });

    // Act: Make POST request that will trigger database error
    const res = await POST(
      new Request("http://localhost/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validPostBody),
      })
    );

    // Assert: Should return 500 with error message
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBeDefined();
  });

  describe("/api/subscriptions/[id] PUT", () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it("returns 200 and updates subscription for valid input", async () => {
      // Arrange: Mock existing subscription and successful update
      const existingSub = {
        id: 1,
        name: "Netflix",
        cost: 9.99,
        cycle: "monthly",
        renewalDate: new Date("2025-12-01T00:00:00Z"),
        createdAt: new Date("2025-11-01T00:00:00Z"),
        updatedAt: new Date("2025-11-01T00:00:00Z"),
        userId: "user-1",
        isActive: true,
        reminder: null,
        notes: null,
      };
      const updatedSub = {
        ...existingSub,
        name: "Netflix Premium",
        cost: 15.99,
        updatedAt: new Date(),
      };

      mockedPrisma.subscription.findUnique.mockResolvedValue(existingSub);
      mockedPrisma.subscription.update.mockResolvedValue(updatedSub);

      // Act: Make PUT request with valid update data
      const res = await PUT(
        new Request("http://localhost/api/subscriptions/1", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Netflix Premium",
            cost: 15.99,
          }),
        }),
        { params: Promise.resolve({ id: "1" }) }
      );

      // Assert: Should return 200 with updated subscription
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.value.subscription.name).toBe("Netflix Premium");
      expect(body.value.subscription.cost).toBe(15.99);
    });

    it("returns 400 for invalid subscription ID", async () => {
      // Act: Make PUT request with invalid ID
      const res = await PUT(
        new Request("http://localhost/api/subscriptions/invalid", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "Updated Name" }),
        }),
        { params: Promise.resolve({ id: "invalid" }) }
      );

      // Assert: Should return 400 with error message
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toMatch(/Invalid subscription ID/);
    });

    it("returns 404 when subscription not found", async () => {
      // Arrange: Mock subscription not found
      mockedPrisma.subscription.findUnique.mockResolvedValue(null);

      // Act: Make PUT request for non-existent subscription
      const res = await PUT(
        new Request("http://localhost/api/subscriptions/999", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "Updated Name" }),
        }),
        { params: Promise.resolve({ id: "999" }) }
      );

      // Assert: Should return 404 with error message
      expect(res.status).toBe(404);
      const body = await res.json();
      expect(body.error).toMatch(/Subscription not found/);
    });

    it("returns 400 when validation fails", async () => {
      // Arrange: Mock existing subscription
      mockedPrisma.subscription.findUnique.mockResolvedValue({
        id: 1,
        name: "Netflix",
        cost: 9.99,
        cycle: "monthly",
        renewalDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: "user-1",
        isActive: true,
        reminder: null,
        notes: null,
      });

      // Act: Make PUT request with invalid data
      const res = await PUT(
        new Request("http://localhost/api/subscriptions/1", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cost: -10 }), // Invalid negative cost
        }),
        { params: Promise.resolve({ id: "1" }) }
      );

      // Assert: Should return 400 with validation error
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toMatch(/Validation failed/);
    });
  });

  describe("/api/subscriptions/[id] DELETE", () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it("returns 200 and soft deletes subscription", async () => {
      // Arrange: Mock existing subscription
      const existingSub = {
        id: 1,
        name: "Netflix",
        cost: 9.99,
        cycle: "monthly",
        renewalDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: "user-1",
        isActive: true,
        reminder: null,
        notes: null,
      };

      mockedPrisma.subscription.findUnique.mockResolvedValue(existingSub);
      mockedPrisma.subscription.update.mockResolvedValue({
        ...existingSub,
        isActive: false,
      });

      // Act: Make DELETE request
      const res = await DELETE(
        new Request("http://localhost/api/subscriptions/1", {
          method: "DELETE",
        }),
        { params: Promise.resolve({ id: "1" }) }
      );

      // Assert: Should return 200 with success message
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.value.message).toBe("Subscription deleted successfully");

      // Verify the update was called with isActive: false
      expect(mockedPrisma.subscription.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { isActive: false },
      });
    });

    it("returns 400 for invalid subscription ID", async () => {
      // Act: Make DELETE request with invalid ID
      const res = await DELETE(
        new Request("http://localhost/api/subscriptions/invalid", {
          method: "DELETE",
        }),
        { params: Promise.resolve({ id: "invalid" }) }
      );

      // Assert: Should return 400 with error message
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toMatch(/Invalid subscription ID/);
    });

    it("returns 404 when subscription not found", async () => {
      // Arrange: Mock subscription not found
      mockedPrisma.subscription.findUnique.mockResolvedValue(null);

      // Act: Make DELETE request for non-existent subscription
      const res = await DELETE(
        new Request("http://localhost/api/subscriptions/999", {
          method: "DELETE",
        }),
        { params: Promise.resolve({ id: "999" }) }
      );

      // Assert: Should return 404 with error message
      expect(res.status).toBe(404);
      const body = await res.json();
      expect(body.error).toMatch(/Subscription not found/);
    });
  });
});
