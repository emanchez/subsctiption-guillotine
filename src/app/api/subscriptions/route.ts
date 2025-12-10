import { prisma } from "@/lib/prisma";
import { HttpError, safeAsync } from "@/lib/util/helpers";
import apiSubToDomSub from "@/lib/mappers/subscription";
import domainSubToApi from "@/lib/serializers/subscription";
import { DbSubscription } from "@/lib/types/subscription";
import {
  createSubscriptionSchema,
  dbSubscriptionSchema,
} from "@/lib/validators/subscription.zod";
import { ZodIssue } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase-server";

/**
 * GET /api/subscriptions
 * Retrieves all subscriptions for a specific user.
 *
 * Query Parameters:
 * - userID: The user's ID (required, can also be provided in x-user-id header)
 *
 * Response:
 * - 200: { user: User, subscriptions: Subscription[] }
 * - 400: Missing userID parameter
 * - 404: User not found
 * - 500: Database error or validation failure
 */
export const GET = async (req: Request) => {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const res = await safeAsync(async () => {
    // Verify user exists in database
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
    });
    if (!dbUser) throw new HttpError(404, "User not found");

    // Fetch user's subscriptions ordered by renewal date
    const userSubs = await prisma.subscription.findMany({
      where: { userId: user.id },
      orderBy: { renewalDate: "asc" },
    });

    // Validate database results against expected schema
    // Using 'any' here because Prisma's generated types don't perfectly match our DbSubscription type
    const validatedSubs = userSubs.map((s: any) => {
      const result = dbSubscriptionSchema.safeParse(s);
      if (!result.success) {
        throw new HttpError(
          500,
          `Invalid subscription data: ${result.error.message}`
        );
      }
      return result.data;
    });

    // Transform validated data to domain objects and serialize for API response
    const mapped = validatedSubs.map((s: DbSubscription) => apiSubToDomSub(s));
    const serialized = mapped.map(domainSubToApi);
    return { user: dbUser, subscriptions: serialized };
  });

  return new Response(JSON.stringify(res), {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
};

/**
 * POST /api/subscriptions
 * Creates a new subscription for a user.
 *
 * Request Body:
 * - name: string (required)
 * - cost: number (required, non-negative)
 * - cycle: "monthly" | "yearly" (required)
 * - renewalDate: string (required, ISO datetime)
 * - userId: string (required)
 * - isActive: boolean (optional, defaults to true)
 * - category: SubscriptionCategory (optional)
 * - notes: string (optional)
 * - reminderAlert: ReminderAlert[] (optional, max 5 items)
 *
 * Response:
 * - 200: { subscription: Subscription }
 * - 400: Validation failed or invalid request body
 * - 404: User not found
 * - 500: Database error
 */
export const POST = async (req: Request) => {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const res = await safeAsync(async () => {
    // Parse and validate request body
    const body = await req.json();

    // Validate input against creation schema (but remove userId from validation since we get it from auth)
    const validation = createSubscriptionSchema.safeParse(body);
    if (!validation.success) {
      throw new HttpError(
        400,
        `Validation failed: ${validation.error.issues.map((e: ZodIssue) => `${e.path.join(".")}: ${e.message}`).join(", ")}`
      );
    }

    const data = validation.data;

    // Verify the authenticated user exists in database
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
    });
    if (!dbUser) throw new HttpError(404, "User not found");

    // Create new subscription in database using authenticated user's ID
    const newSub = await prisma.subscription.create({
      data: {
        name: data.name,
        cost: data.cost,
        cycle: data.cycle,
        renewalDate: new Date(data.renewalDate),
        userId: user.id, // Use authenticated user's ID
        isActive: data.isActive,
        category: data.category,
        notes: data.notes,
        reminder: data.reminderAlert
          ? JSON.stringify(data.reminderAlert)
          : undefined,
      },
    });

    // Validate the created subscription matches expected database schema
    const validatedSub = dbSubscriptionSchema.parse(newSub);

    // Transform to domain object and serialize for response
    const domainSub = apiSubToDomSub(validatedSub);
    const serialized = domainSubToApi(domainSub);

    return { subscription: serialized };
  });

  return new Response(JSON.stringify(res), {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
};
