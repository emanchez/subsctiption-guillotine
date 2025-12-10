import { prisma } from "@/lib/prisma";
import { HttpError, safeAsync } from "@/lib/util/helpers";
import apiSubToDomSub from "@/lib/mappers/subscription";
import domainSubToApi from "@/lib/serializers/subscription";
import { DbSubscription } from "@/lib/types/subscription";
import {
  updateSubscriptionSchema,
  dbSubscriptionSchema,
} from "@/lib/validators/subscription.zod";
import { createServerSupabaseClient } from "@/lib/supabase-server";

/**
 * PUT /api/subscriptions/[id]
 * Updates an existing subscription.
 *
 * Request Body: (all fields optional, at least one required)
 * - name: string (optional)
 * - cost: number (optional)
 * - cycle: "monthly" | "yearly" (optional)
 * - renewalDate: string (optional, ISO datetime)
 * - isActive: boolean (optional)
 * - category: SubscriptionCategory (optional)
 * - notes: string (optional)
 * - reminderAlert: ReminderAlert[] (optional, max 5 items)
 *
 * Response:
 * - 200: { subscription: Subscription }
 * - 400: Validation failed or invalid request body
 * - 404: Subscription not found
 * - 500: Database error
 */
export const PUT = async (
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
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
    const { id } = await params;
    const subscriptionId = parseInt(id);
    if (isNaN(subscriptionId)) {
      throw new HttpError(400, "Invalid subscription ID");
    }

    // Parse and validate request body
    const body = await req.json();

    // Validate input against update schema
    const validation = updateSubscriptionSchema.safeParse(body);
    if (!validation.success) {
      throw new HttpError(
        400,
        `Validation failed: ${validation.error.issues.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ")}`
      );
    }

    const data = validation.data;

    // Check if subscription exists and belongs to the authenticated user
    const existingSub = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
    });
    if (!existingSub) {
      throw new HttpError(404, "Subscription not found");
    }
    if (existingSub.userId !== user.id) {
      throw new HttpError(
        403,
        "Forbidden: You can only update your own subscriptions"
      );
    }

    // Prepare update data
    const updateData: Partial<Omit<DbSubscription, "id">> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.cost !== undefined) updateData.cost = data.cost;
    if (data.cycle !== undefined) updateData.cycle = data.cycle;
    if (data.renewalDate !== undefined)
      updateData.renewalDate = new Date(data.renewalDate);
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.reminderAlert !== undefined) {
      updateData.reminder = JSON.stringify(data.reminderAlert);
    }

    // Update subscription in database
    // Using 'as any' here because our updateData type doesn't perfectly match Prisma's expected update input type
    const updatedSub = await prisma.subscription.update({
      where: { id: subscriptionId },
      data: updateData as any,
    });

    // Validate the updated subscription matches expected database schema
    const validatedSub = dbSubscriptionSchema.parse(updatedSub);

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

/**
 * DELETE /api/subscriptions/[id]
 * Soft deletes a subscription by marking it as inactive.
 *
 * Response:
 * - 200: { message: "Subscription deleted successfully" }
 * - 404: Subscription not found
 * - 500: Database error
 */
export const DELETE = async (
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
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
    const { id } = await params;
    const subscriptionId = parseInt(id);
    if (isNaN(subscriptionId)) {
      throw new HttpError(400, "Invalid subscription ID");
    }

    // Check if subscription exists and belongs to the authenticated user
    const existingSub = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
    });
    if (!existingSub) {
      throw new HttpError(404, "Subscription not found");
    }
    if (existingSub.userId !== user.id) {
      throw new HttpError(
        403,
        "Forbidden: You can only delete your own subscriptions"
      );
    }

    // Soft delete by marking as inactive
    await prisma.subscription.update({
      where: { id: subscriptionId },
      data: { isActive: false },
    });

    return { message: "Subscription deleted successfully" };
  });

  return new Response(JSON.stringify(res), {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
};
