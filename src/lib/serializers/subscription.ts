import { Subscription } from "@/lib/types/subscription";

// Convert domain Subscription -> API shape (dates serialized to ISO)
export const domainSubToApi = (s: Subscription) => ({
  ...s,
  renewalDate: s.renewalDate.toISOString(),
  createdAt: s.createdAt.toISOString(),
  updatedAt: s.updatedAt.toISOString(),
});

export default domainSubToApi;
