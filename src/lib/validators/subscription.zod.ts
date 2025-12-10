import { z } from "zod";
import {
  SUBSCRIPTION_CYCLES,
  SUBSCRIPTION_CATEGORIES,
  REMINDER_TIMEFRAMES,
} from "@/lib/types/subscription";

/**
 * Zod schema for validating reminder alert objects.
 * Ensures timeframe is valid and value is a positive integer.
 */
export const reminderAlertSchema = z.object({
  timeframe: z.enum(REMINDER_TIMEFRAMES),
  value: z.number().int().positive(),
});

/**
 * Zod schema for validating subscription data from the database layer.
 * This schema handles Date objects as returned by Prisma.
 */
export const dbSubscriptionSchema = z.object({
  id: z.number().int(),
  name: z.string().min(1),
  cost: z.number().nonnegative(),
  cycle: z.enum(SUBSCRIPTION_CYCLES),
  renewalDate: z.date().nullable(),
  createdAt: z.date().nullable(),
  updatedAt: z.date().nullable(),
  userId: z.string().min(1),
  isActive: z.boolean(),
  category: z.enum(SUBSCRIPTION_CATEGORIES).optional(),
  notes: z.union([z.string(), z.null()]),
  reminder: z.string().nullable(), // JSON string from database
});

/**
 * Zod schema for validating subscription data from the API layer.
 * This schema ensures data integrity when reading from external sources.
 */
export const apiSubscriptionSchema = z.object({
  id: z.number().int(),
  name: z.string().min(1),
  cost: z.number().nonnegative(),
  cycle: z.enum(SUBSCRIPTION_CYCLES),
  renewalDate: z.string().datetime().nullable(),
  createdAt: z.string().datetime().nullable(),
  updatedAt: z.string().datetime().nullable(),
  userId: z.string().min(1),
  isActive: z.boolean(),
  category: z.enum(SUBSCRIPTION_CATEGORIES).optional(),
  notes: z.string().optional(),
  reminderAlert: z.array(reminderAlertSchema).max(5).optional(),
});

/**
 * Zod schema for validating POST request bodies when creating subscriptions.
 * Includes custom error messages for better user experience.
 */
export const createSubscriptionSchema = z.object({
  name: z.string().min(1, "Name is required"),
  cost: z.number().nonnegative("Cost must be non-negative"),
  cycle: z.enum(SUBSCRIPTION_CYCLES, {
    message: "Cycle must be 'monthly' or 'yearly'",
  }),
  renewalDate: z.string().datetime("Invalid renewal date format"),
  isActive: z.boolean().default(true),
  category: z.enum(SUBSCRIPTION_CATEGORIES).optional(),
  notes: z.string().optional(),
  reminderAlert: z.array(reminderAlertSchema).max(5).optional(),
});

/**
 * Zod schema for validating PUT request bodies when updating subscriptions.
 * All fields are optional but at least one field must be provided.
 */
export const updateSubscriptionSchema = createSubscriptionSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

export type CreateSubscriptionInput = z.infer<typeof createSubscriptionSchema>;
export type UpdateSubscriptionInput = z.infer<typeof updateSubscriptionSchema>;
