import { Result } from "@/lib/types/generics";
import {
  ApiSubscription,
  SUBSCRIPTION_CATEGORIES,
  SUBSCRIPTION_CYCLES,
  REMINDER_TIMEFRAMES,
  ReminderAlert,
} from "@/lib/types/subscription";
import { createSuccess, createFailure } from "@/lib/util/helpers";
import * as TypeGuard from "../util/typeguards";

const isCycle = TypeGuard.isOneOf(SUBSCRIPTION_CYCLES);
const isCategory = TypeGuard.isOneOf(SUBSCRIPTION_CATEGORIES);
const isTimeframe = TypeGuard.isOneOf(REMINDER_TIMEFRAMES);

const validateApiSub = (input: ApiSubscription): Result<ApiSubscription> => {
  // Type check: id should be a number
  if (!TypeGuard.isNumber(input.id)) {
    return createFailure("subscription id must be a number");
  }

  // Type check: name should be a string
  if (!TypeGuard.isString(input.name)) {
    return createFailure("subscription name must be a string");
  }

  // Type check: cost should be a number
  if (!TypeGuard.isNumber(input.cost)) {
    return createFailure("subscription cost should be a number");
  }

  // Type check: cycle should be instance of SubscriptionCycle
  if (!isCycle(input.cycle)) {
    return createFailure(
      "subscription cycle should be valid literal type SubscriptionCycle -> 'monthly' | 'yearly'"
    );
  }

  // Type check: renewalDate should be a string or null
  if (typeof input.renewalDate !== "string" && input.renewalDate !== null) {
    return createFailure("renewalDate must be a string or null");
  }

  // Type check: createdAt should be a string or null
  if (typeof input.createdAt !== "string" && input.createdAt !== null) {
    return createFailure("createdAt must be a string or null");
  }

  // Type check: updatedAt should be a string or null
  if (typeof input.updatedAt !== "string" && input.updatedAt !== null) {
    return createFailure("updatedAt must be a string or null");
  }

  // Type check: userId should be a string
  if (typeof input.userId !== "string") {
    return createFailure("userId must be a string");
  }

  // Type check: isActive should be a boolean
  if (typeof input.isActive !== "boolean") {
    return createFailure("isActive must be a boolean");
  }

  // Type check: category (optional) should be instance of SubscriptionCategory
  if (input.category !== undefined) {
    if (!isCategory(input.category)) {
      return createFailure("category must be a valid SubscriptionCategory");
    }
  }

  // Type check: notes (optional) should be a string
  if (input.notes !== undefined && typeof input.notes !== "string") {
    return createFailure("notes must be a string");
  }

  // Type check: reminderAlert (optional) should be instance of ReminderAlert[]
  // if reminderAlert exists
  if (input.reminderAlert !== undefined) {
    // check if it is an array first
    if (!Array.isArray(input.reminderAlert))
      return createFailure("reminderAlert must be array");
    // check each element to ensure it is in the proper shape
    for (let i = 0; i < input.reminderAlert.length; i++) {
      const r = input.reminderAlert[i] as ReminderAlert;
      if (!r || !isTimeframe(r.timeframe) || !(typeof r.value === "number"))
        return createFailure(`reminderAlert[${i}] invalid`);
    }
  }

  // All checks passed
  return createSuccess(input);
};

export default validateApiSub;
