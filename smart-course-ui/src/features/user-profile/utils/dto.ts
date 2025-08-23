import type { UserProfileFormValues } from "@/features/user-profile/utils/types";

export interface UserProfileDto {
  fullName: string;
  email: string;
  standardLevel: string;
  bio: string;
  timezone: string;
  locale: string;
  weeklyTimeBudgetMin: number;
  preferredSessionMin: number;
  learningStyle: string;
  accessibilityNotes: string;
  goals: string;
  priorKnowledgeTags: string[];
  aiProfile: Record<string, unknown>;
  languageProficiencies: {
    languageCode: string;
    level: string;
    lastAssessedAt: string | null;
  }[];
  derived: {
    sessionsPerWeek: number;
  };
}

export function toDto(data: UserProfileFormValues) {
  const ai: Record<string, unknown> = {
    pace: data.ai_profile.pace,
    tone: data.ai_profile.tone,
  };
  for (const cf of data.ai_profile.custom || []) {
    const k = (cf.key || "").trim();
    if (k) ai[k] = cf.value;
  }

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
    aiProfile: ai,
    languageProficiencies: (data.language_proficiencies || []).map((lp) => ({
      languageCode: lp.language_code,
      level: lp.level,
      lastAssessedAt: lp.last_assessed_at
        ? new Date(lp.last_assessed_at).toISOString()
        : null,
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
