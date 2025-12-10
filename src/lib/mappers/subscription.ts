import { DbSubscription, Subscription } from "@/lib/types/subscription";
import { HttpError } from "@/lib/util/helpers";

/**
 * Asserts that a date string is non-null and valid, converting it to a Date object.
 * Throws an error if the value is null or invalid.
 *
 * @param field - The field name for error reporting
 * @param value - The date string value to validate
 * @returns A valid Date object
 * @throws Error if the value is null or not a valid date
 */
const assertNonNullDate = (field: string, value: string | null): Date => {
  if (value == null) {
    throw new Error(
      `ApiSubscription.${field} is null but expected a valid date string`
    );
  }
  const temp = new Date(value);
  if (isNaN(temp.getTime())) {
    throw new Error(`ApiSubscription.${field} is not a valid date: "${value}"`);
  }
  return temp;
};

/**
 * Maps a DbSubscription (database layer) to a Subscription (domain layer).
 * Performs validation and type conversion for date fields and reminder parsing.
 *
 * @param input - The database subscription object
 * @returns A validated domain Subscription object
 * @throws HttpError if mapping fails due to invalid data
 */
const apiSubToDomSub = (input: DbSubscription): Subscription => {
  try {
    const output: Subscription = {
      id: input.id,
      name: input.name,
      cost: input.cost,
      cycle: input.cycle,
      renewalDate: assertNonNullDate(
        "renewalDate",
        input.renewalDate?.toISOString() || null
      ),
      createdAt: assertNonNullDate(
        "createdAt",
        input.createdAt?.toISOString() || null
      ),
      updatedAt: assertNonNullDate(
        "updatedAt",
        input.updatedAt?.toISOString() || null
      ),
      userId: input.userId,
      isActive: input.isActive,
    };

    // Parse reminder JSON string to array if present
    if (input.reminder) {
      try {
        const parsedReminder = JSON.parse(input.reminder);
        if (Array.isArray(parsedReminder)) {
          output.reminderAlert = parsedReminder;
        }
      } catch (parseError) {
        // If JSON parsing fails, ignore the reminder data
        console.warn(
          `Failed to parse reminder JSON for subscription ${input.id}:`,
          parseError
        );
      }
    }

    // Add optional fields if present
    if (input.category) {
      output.category = input.category;
    }
    if (input.notes) {
      output.notes = input.notes;
    }
    return output;
  } catch (err) {
    // Convert any errors to HttpError with context
    const msg = err instanceof Error ? err.message : String(err);
    throw new HttpError(
      500,
      `Failed to map DbSubscription id=${input.id}: ${msg}`
    );
  }
};

export default apiSubToDomSub;
