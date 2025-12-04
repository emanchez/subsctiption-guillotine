import { Result } from "@/lib/types/generics";
import {
  ApiSubscription,
  SUBSCRIPTION_CATEGORIES,
  SUBSCRIPTION_CYCLES,
  REMINDER_TIMEFRAMES,
} from "@/lib/types/subscription";
import { createSuccess, createFailure, isOneOf } from "@/lib/util/helpers";
import { create } from "domain";

const isCycle = isOneOf(SUBSCRIPTION_CYCLES);
const isCategory = isOneOf(SUBSCRIPTION_CATEGORIES);
const isTimeframe = isOneOf(REMINDER_TIMEFRAMES);

const validateApiSub = (input: ApiSubscription): Result<ApiSubscription> => {
  // Type check: id should be a number
  if (typeof input.id !== "number") {
    // TODO: return failure
  }

  // Type check: name should be a string
  if (typeof input.name !== "string") {
    // TODO: return failure
  }

  // Type check: cost should be a number
  if (typeof input.cost !== "number") {
    // TODO: return failure
  }

  // Type check: cycle should be instance of SubscriptionCycle
  if (!isCategory(input.cycle)) {
    // TODO: return failure
  }

  // Type check: renewalDate should be a string or null
  if (typeof input.renewalDate !== "string" && input.renewalDate !== null) {
    // TODO: return failure
  }

  // Type check: createdAt should be a string or null
  if (typeof input.createdAt !== "string" && input.createdAt !== null) {
    // TODO: return failure
  }

  // Type check: updatedAt should be a string or null
  if (typeof input.updatedAt !== "string" && input.updatedAt !== null) {
    // TODO: return failure
  }

  // Type check: userId should be a string
  if (typeof input.userId !== "string") {
    // TODO: return failure
  }

  // Type check: isActive should be a boolean
  if (typeof input.isActive !== "boolean") {
    // TODO: return failure
  }

  // Type check: category (optional) should be instance of SubscriptionCategory
  if (input.category !== undefined) {
    if (!isCategory(input.category)) {
      // TODO: return failure
    }
  }

  // Type check: notes (optional) should be a string
  if (input.notes !== undefined && typeof input.notes !== "string") {
    // TODO: return failure
  }

  // Type check: reminderAlert (optional) should be instance of ReminderAlert[]
  if (input.reminderAlert !== undefined) {
    if (!Array.isArray(input.reminderAlert))
      return createFailure("reminderAlert must be array");
    for (let i = 0; i < input.reminderAlert.length; i++) {
      const r = input.reminderAlert[i] as any;
      if (!r || !isTimeframe(r.timeframe) || !(typeof r.value === "number"))
        return createFailure(`reminderAlert[${i}] invalid`);
    }
  }

  // TODO: return success when full function is complete
  return createFailure("subscription validator not implemented yet");
};
