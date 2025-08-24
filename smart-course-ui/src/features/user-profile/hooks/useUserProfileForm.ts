// features/user-profile/hooks/useUserProfileForm.ts
import { useForm } from "react-hook-form";
import { toDto, type UserProfileDto } from "../utils/dto";

import type { UserProfileFormValues } from "@/features/user-profile/utils/types";
import UserClient from "../api-client/user-client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export function useUserProfileForm() {
  const userClient = new UserClient();
  const queryClient = useQueryClient();

  const userProfileQuery = useQuery<UserProfileDto>({
    queryKey: ["userProfile"],
    queryFn: () => userClient.getUserProfile().then((res) => res.data),
    enabled: !!localStorage.getItem("token"),
  });

  function patchForm(profile: UserProfileDto | undefined) {
    if (!profile) return;

    const data: UserProfileFormValues = {
      full_name: profile.fullName,
      email: profile.email,
      standard_level: profile.standardLevel,
      bio: profile.bio,
      timezone: profile.timezone,
      locale: profile.locale,
      weekly_time_budget_min: profile.weeklyTimeBudgetMin,
      preferred_session_min: profile.preferredSessionMin,
      learning_style: profile.learningStyle,
      accessibility_notes: profile.accessibilityNotes,
      goals: profile.goals,
      prior_knowledge_tags: profile.priorKnowledgeTags,
      ai_profile: profile.aiProfile,
      language_proficiencies: profile.languageProficiencies.map((lp) => ({
        language_code: lp.languageCode,
        level: lp.level,
        last_assessed_at: lp.lastAssessedAt,
      })),
    };

    form.reset(data);
  }

  const form = useForm<UserProfileFormValues>({
    mode: "onBlur",
    defaultValues: {
      full_name: "",
      email: "",
      standard_level: "",
      bio: "",
      timezone: "Asia/Kolkata",
      locale: "en-IN",
      weekly_time_budget_min: 300,
      preferred_session_min: 45,
      learning_style: "Mixed",
      accessibility_notes: "",
      goals: "",
      prior_knowledge_tags: [],
      ai_profile: { pace: "normal", tone: "neutral", custom: [] },
      language_proficiencies: [],
    },
  });

  async function submit(values: UserProfileFormValues) {
    if (
      values.preferred_session_min > values.weekly_time_budget_min &&
      values.weekly_time_budget_min > 0
    ) {
      alert("Session length cannot exceed weekly budget.");
      return;
    }
    const dto = toDto(values);
    userClient
      .updateUserProfile(dto)
      .then(() => {
        alert("Profile updated successfully!");
        queryClient.setQueryData(["userProfile"], dto);
      })
      .catch((error) => {
        console.error("Error updating profile:", error);
        alert("Failed to update profile.");
      });
  }

  return { form, submit, patchForm, userProfileQuery };
}
