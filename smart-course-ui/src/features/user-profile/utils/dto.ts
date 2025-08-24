import type {
  AICustomField,
  AIPace,
  AITone,
  LangLevel,
  LearningStyle,
  UserProfileFormValues,
} from "@/features/user-profile/utils/types";

export interface UserProfileDto {
  fullName: string;
  email: string;
  standardLevel: string;
  bio: string;
  timezone: string;
  locale: string;
  weeklyTimeBudgetMin: number;
  preferredSessionMin: number;
  learningStyle: LearningStyle;
  accessibilityNotes: string;
  goals: string;
  priorKnowledgeTags: string[];
  aiProfile: { pace: AIPace; tone: AITone; custom: AICustomField[] };
  languageProficiencies: {
    languageCode: string;
    level: LangLevel;
    lastAssessedAt?: string;
  }[];
  derived: {
    sessionsPerWeek: number;
  };
}

export function toDto(data: UserProfileFormValues) {
  return {
    fullName: data.full_name,
    email: data.email,
    standardLevel: data.standard_level,
    bio: data.bio,
    timezone: data.timezone,
    locale: data.locale,
    weeklyTimeBudgetMin: data.weekly_time_budget_min,
    preferredSessionMin: data.preferred_session_min,
    learningStyle: data.learning_style,
    accessibilityNotes: data.accessibility_notes,
    goals: data.goals,
    priorKnowledgeTags: Array.from(
      new Set(data.prior_knowledge_tags.map((t) => t.trim()).filter(Boolean))
    ),
    aiProfile: data.ai_profile,
    languageProficiencies: (data.language_proficiencies || []).map((lp) => ({
      languageCode: lp.language_code,
      level: lp.level,
      lastAssessedAt: lp.last_assessed_at,
    })),
    derived: {
      sessionsPerWeek:
        data.preferred_session_min > 0
          ? Math.max(
              1,
              Math.floor(
                data.weekly_time_budget_min / data.preferred_session_min
              )
            )
          : 0,
    },
  };
}
