type SubscriptionCycle = "monthly" | "yearly";
type SubscriptionCategory =
  | "entertainment" // youtube, netflix, xbox, spotify, etc
  | "fitness" // gym, workout plans
  | "shopping" // amazon prime
  | "development" // aws, copilot premium,
  | "productivity" // microsoft 365, zoom, jira, adobe CC
  | "utilities" // Internet, phone, cloud storage
  | "finance" // Banking fees, investment apps
  | "education" // Courses, learning platforms
  | "health" // Insurance, telemedicine
  | "news" // NYT, WSJ subscriptions
  | "food" // Meal kits, uber/grubhub premium plans
  | "transportation" // Public transit, parking
  | "other"; // Catch-all for miscellaneous
type ReminderTimeframe = "days" | "hours" | "weeks";
type ReminderAlert = {
  timeframe: ReminderTimeframe;
  value: number;
};

export type Subscription = {
  id: number;
  name: string;
  cost: number;
  cycle: SubscriptionCycle;
  renewalDate: Date;
  createdAt: Date;
  updatedAt: Date;
  userId: string; // supabase Auth
  isActive: boolean; // is cancelled or not (avoid having to delete data)
  reminderAlert?: ReminderAlert[]; // array of tuples for timeframe and value (i.e. ["days", 3], ["hours", 6"]). max of 5 reminders
  category?: SubscriptionCategory; // i.e. Netflix = Entertainment or GymName = Fitness
  notes?: string; // user notes on the entry
};
