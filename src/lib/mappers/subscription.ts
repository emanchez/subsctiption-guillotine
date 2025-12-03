import { ApiSubscription, Subscription } from "@/lib/types/subscription";
import { HttpError } from "@/lib/util/helpers";
// ensure no data is null upon conversion
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

const apiSubToDomSub = (input: ApiSubscription): Subscription => {
  //try to convert/map subscription data from database to our subscription type
  try {
    const output: Subscription = {
      id: input.id,
      name: input.name,
      cost: input.cost,
      cycle: input.cycle,
      renewalDate: assertNonNullDate("renewalDate", input.renewalDate),
      createdAt: assertNonNullDate("createdAt", input.createdAt),
      updatedAt: assertNonNullDate("updatedAt", input.updatedAt),
      userId: input.userId,
      isActive: input.isActive,
    };

    if (input.reminderAlert) {
      output.reminderAlert = input.reminderAlert;
    }
    if (input.category) {
      output.category = input.category;
    }
    if (input.notes) {
      output.notes = input.notes;
    }
    return output;
  } catch (err) {
    // if there is a problem, throw an error
    const msg = err instanceof Error ? err.message : String(err);
    throw new HttpError(
      500,
      `Failed to map ApiSubscription id=${input.id}: ${msg}`
    );
  }
};

export default apiSubToDomSub;
