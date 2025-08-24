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

export function toDto(
  data: Partial<UserProfileFormValues>
): Partial<UserProfileDto> {
  const dto: Partial<UserProfileDto> = {};

  // Only include fields that exist in the input data
  if ("full_name" in data) dto.fullName = data.full_name;
  if ("email" in data) dto.email = data.email;
  if ("standard_level" in data) dto.standardLevel = data.standard_level;
  if ("bio" in data) dto.bio = data.bio;
  if ("timezone" in data) dto.timezone = data.timezone;
  if ("locale" in data) dto.locale = data.locale;
  if ("weekly_time_budget_min" in data)
    dto.weeklyTimeBudgetMin = data.weekly_time_budget_min;
  if ("preferred_session_min" in data)
    dto.preferredSessionMin = data.preferred_session_min;
  if ("learning_style" in data) dto.learningStyle = data.learning_style;
  if ("accessibility_notes" in data)
    dto.accessibilityNotes = data.accessibility_notes;
  if ("goals" in data) dto.goals = data.goals;

  // Handle arrays and objects carefully
  if ("prior_knowledge_tags" in data && data.prior_knowledge_tags) {
    dto.priorKnowledgeTags = Array.from(
      new Set(data.prior_knowledge_tags.map((t) => t.trim()).filter(Boolean))
    );
  }

  if ("ai_profile" in data && data.ai_profile) {
    dto.aiProfile = data.ai_profile;
  }

  if ("language_proficiencies" in data && data.language_proficiencies) {
    dto.languageProficiencies = data.language_proficiencies.map((lp) => ({
      languageCode: lp.language_code,
      level: lp.level,
      lastAssessedAt: lp.last_assessed_at,
    }));
  }

  // Only calculate derived values if both fields are present
  if ("weekly_time_budget_min" in data && "preferred_session_min" in data) {
    dto.derived = {
      sessionsPerWeek:
        data.preferred_session_min! > 0
          ? Math.max(
              1,
              Math.floor(
                data.weekly_time_budget_min! / data.preferred_session_min!
              )
            )
          : 0,
    };
  }

  return dto;
}
