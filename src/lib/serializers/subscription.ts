import { Subscription } from "@/lib/types/subscription";

/**
 * Serializes a domain Subscription object to API format.
 * Converts Date objects to ISO string format for JSON serialization.
 *
 * @param s - The domain Subscription object
 * @returns The subscription in API format with serialized dates
 */
export const domainSubToApi = (s: Subscription) => ({
  ...s,
  renewalDate: s.renewalDate.toISOString(),
  createdAt: s.createdAt.toISOString(),
  updatedAt: s.updatedAt.toISOString(),
});

export default domainSubToApi;
