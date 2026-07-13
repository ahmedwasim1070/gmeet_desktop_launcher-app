// Types

// A meeting the user scheduled from the "Upcoming Meetings" section
export type ScheduledMeeting = {
  serial: number;
  name: string;
  date: number;
  type: "new" | "existing";
  url: string;
};

// Premium plan codes — must match the add-on Store IDs mapping in services/PremiumServices.ts
export type PremiumPlanCode = "annual" | "lifetime";

// License state resolved from the Microsoft Store (see Task.md).
// "developer" is the dev-build-only testing license (never from the Store).
export type PremiumLicense = {
  isPremium: boolean;
  plan: PremiumPlanCode | "free" | "developer";
};
