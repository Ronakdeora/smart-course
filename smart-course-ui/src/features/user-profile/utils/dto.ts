import type { UserProfileFormValues } from "@/features/types";

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
    full_name: data.full_name,
    email: data.email,
    standard_level: data.standard_level,
    bio: data.bio,
    timezone: data.timezone,
    locale: data.locale,
    weekly_time_budget_min: data.weekly_time_budget_min,
    preferred_session_min: data.preferred_session_min,
    learning_style: data.learning_style,
    accessibility_notes: data.accessibility_notes,
    goals: data.goals,
    prior_knowledge_tags: Array.from(
      new Set(data.prior_knowledge_tags.map((t) => t.trim()).filter(Boolean))
    ),
    ai_profile: ai,
    language_proficiencies: (data.language_proficiencies || []).map((lp) => ({
      language_code: lp.language_code,
      level: lp.level,
      last_assessed_at: lp.last_assessed_at
        ? new Date(lp.last_assessed_at).toISOString()
        : null,
    })),
    derived: {
      sessions_per_week:
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
