export type LearningStyle =
  | "Visual"
  | "Auditory"
  | "Reading/Writing"
  | "Kinesthetic"
  | "Mixed";
export type LangLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2" | "Native";
export type AIPace = "slow" | "normal" | "fast";
export type AITone = "neutral" | "casual" | "formal";

export type AICustomField = { key: string; value: string };

export type UserProfileFormValues = {
  full_name: string;
  email: string;
  standard_level: string;
  bio: string;
  timezone: string;
  locale: string;
  weekly_time_budget_min: number;
  preferred_session_min: number;
  learning_style: LearningStyle;
  accessibility_notes: string;
  goals: string;
  prior_knowledge_tags: string[];
  ai_profile: { pace: AIPace; tone: AITone; custom: AICustomField[] };
  language_proficiencies: {
    language_code: string;
    level: LangLevel;
    last_assessed_at?: string;
  }[];
};
