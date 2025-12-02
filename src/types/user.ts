type Timezone =
  | "America/New_York"
  | "America/Chicago"
  | "America/Denver"
  | "America/Los_Angeles"
  | "America/Vancouver"
  | "America/Toronto"
  | "Europe/London"
  | "Europe/Paris"
  | "Europe/Berlin"
  | "Europe/Rome"
  | "Europe/Madrid"
  | "Asia/Tokyo"
  | "Asia/Shanghai"
  | "Asia/Hong_Kong"
  | "Asia/Singapore"
  | "Australia/Sydney"
  | "Australia/Melbourne"
  | "Pacific/Auckland"
  | "UTC";

export type User = {
  id: string; // supabase auth
  email: string;
  username: string;
  createdAt: Date;
  emailNotifications: boolean; // permission to alert user via email
  timezone: Timezone; // app relies on user's subscriptions renewal/payment dates so knowing TZ is critical
};
