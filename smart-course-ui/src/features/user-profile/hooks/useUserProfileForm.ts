// features/user-profile/hooks/useUserProfileForm.ts
import { useForm } from "react-hook-form";
import { toDto, type UserProfileDto } from "../utils/dto";
import { useRef, useCallback } from "react";
import type { UserProfileFormValues } from "@/features/user-profile/utils/types";
import UserClient from "../api-client/user-client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { isEqual } from "lodash";

export function useUserProfileForm() {
  const userClient = new UserClient();
  const queryClient = useQueryClient();
  // Keep reference to original data for comparison
  const originalData = useRef<UserProfileFormValues | null>(null);
  const hasPatched = useRef(false);

  const userProfileQuery = useQuery<UserProfileDto>({
    queryKey: ["userProfile"],
    queryFn: () => userClient.getUserProfile().then((res) => res.data),
    enabled: !!localStorage.getItem("token"),
  });

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

  const patchForm = useCallback((profile: UserProfileDto | undefined) => {
    if (!profile || hasPatched.current) return;

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

    // Store original data for comparison
    originalData.current = { ...data };
    form.reset(data);
    hasPatched.current = true;
  }, [form]);

  async function submit(values: UserProfileFormValues) {
    console.log("Submitting form with values:", values);
    if (
      values.preferred_session_min > values.weekly_time_budget_min &&
      values.weekly_time_budget_min > 0
    ) {
      alert("Session length cannot exceed weekly budget.");
      return;
    }

    // Create an object with only changed fields
    const changedValues: Partial<UserProfileFormValues> = {};

    if (!originalData.current) {
      // If no original data, send everything
      const fullDto = toDto(values);
      return updateProfile(fullDto);
    }

    // Compare each field to find changes
    Object.keys(values).forEach((key) => {
      const typedKey = key as keyof UserProfileFormValues;
      const currentValue = values[typedKey];
      const originalValue = originalData.current?.[typedKey];

      // Add to changedValues only if different
      if (!isEqual(currentValue, originalValue)) {
        (changedValues as Record<string, unknown>)[typedKey] = currentValue;
      }
    });

    // If nothing changed, don't submit
    if (Object.keys(changedValues).length === 0) {
      alert("No changes detected");
      return;
    }

    // Convert partial values to DTO
    const partialDto = toDto(changedValues as UserProfileFormValues);

    updateProfile(partialDto);
  }

  function updateProfile(dto: Partial<UserProfileDto>) {
    userClient
      .updateUserProfile(dto)
      .then(() => {
        alert("Profile updated successfully!");
        // Update the query data with the new values
        queryClient.setQueryData(
          ["userProfile"],
          (oldData: UserProfileDto | undefined) => ({
            ...oldData,
            ...dto,
          })
        );
        // Update our reference to original data
        originalData.current = form.getValues();
      })
      .catch((error) => {
        console.error("Error updating profile:", error);
        alert("Failed to update profile.");
      });
  }

  return { form, submit, patchForm, userProfileQuery };
}
