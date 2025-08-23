// features/user-profile/hooks/useUserProfileForm.ts
import { useForm, useFieldArray } from "react-hook-form";
import { toDto } from "../utils/dto";
import type { UserProfileFormValues } from "@/features/user-profile/utils/types";
import UserClient from "../api-client/user-client";

export function useUserProfileForm() {
  const userClient = new UserClient();

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

  // expose field arrays hooks creators for sections that need them
  const langArray = useFieldArray({
    control: form.control,
    name: "language_proficiencies",
  });
  const customPrefArray = useFieldArray({
    control: form.control,
    name: "ai_profile.custom",
  });

  function loadDemo() {
    const demo: UserProfileFormValues = {
      full_name: "Anish Kumar",
      email: "anish@example.com",
      standard_level: "UG",
      bio: "Backend dev learning React.",
      timezone: "Asia/Kolkata",
      locale: "en-IN",
      weekly_time_budget_min: 360,
      preferred_session_min: 45,
      learning_style: "Mixed",
      accessibility_notes: "",
      goals: "Finish React + DSA in 12 weeks.",
      prior_knowledge_tags: ["algebra", "git", "javascript"],
      ai_profile: {
        pace: "fast",
        tone: "casual",
        custom: [
          { key: "content_density", value: "balanced" },
          { key: "prefers_quizzes", value: "true" },
        ],
      },
      language_proficiencies: [
        {
          language_code: "en",
          level: "Native",
          last_assessed_at: "2024-06-01",
        },
        { language_code: "hi", level: "B2", last_assessed_at: "2023-12-15" },
      ],
    };
    form.reset(demo);
  }

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
      })
      .catch((error) => {
        console.error("Error updating profile:", error);
        alert("Failed to update profile.");
      });
  }

  return { form, langArray, customPrefArray, loadDemo, submit };
}
