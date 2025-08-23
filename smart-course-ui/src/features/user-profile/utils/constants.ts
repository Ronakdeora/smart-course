import type { UserProfileFormValues } from "@/features/types";

// features/user-profile/utils/constants.ts
export const TZ = [
  "Asia/Kolkata",
  "UTC",
  "America/New_York",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Berlin",
  "Asia/Singapore",
  "Asia/Dubai",
  "Australia/Sydney",
];
export const LOCALES = ["en-IN", "en-US", "en-GB", "hi-IN", "de-DE", "fr-FR"];
export const LEARNING: UserProfileFormValues["learning_style"][] = [
  "Visual",
  "Auditory",
  "Reading/Writing",
  "Kinesthetic",
  "Mixed",
];
export const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2", "Native"] as const;
export const PACE = ["slow", "normal", "fast"] as const;
export const TONE = ["neutral", "casual", "formal"] as const;
