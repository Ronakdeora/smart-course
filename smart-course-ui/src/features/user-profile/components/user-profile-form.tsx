// features/user-profile/components/UserProfilePage.tsx
import { FormProvider } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { useUserProfileForm } from "../hooks/useUserProfileForm";
import { PreferencesSection } from "./sections/preferences";
import AiProfileSection from "./sections/ai-profile";
import { IdentitySection } from "./sections/profile";
import LanguageProficiencySection from "./sections/language-proficiency";
import PriorKnowledgeSection from "./sections/prior-knowledge";
import { useEffect } from "react";

export default function UserProfileForm() {
  const {
    form,
    submit,
    patchForm,
    userProfileQuery: { data: userProfileData },
  } = useUserProfileForm();

  useEffect(() => {
    patchForm(userProfileData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userProfileData]);

  const {
    handleSubmit,
    formState: { isSubmitting, isDirty },
  } = form;

  return (
    <div className="mx-auto max-w-4xl p-4 md:p-6 space-y-6">
      <header className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            User Profile
          </h1>
          {/* <p className="text-sm text-muted-foreground">
            Keep your learning preferences up to date.
          </p> */}
        </div>
      </header>

      <FormProvider {...form}>
        {/* give us the useFormContext hook */}
        <form className="space-y-6" onSubmit={handleSubmit(submit)} noValidate>
          <IdentitySection />
          <PreferencesSection />
          <AiProfileSection />
          <LanguageProficiencySection />
          <PriorKnowledgeSection />

          <div className="flex items-center justify-end gap-3">
            <Button
              type="reset"
              variant="outline"
              className="rounded-xl"
              onClick={() => form.reset()}
            >
              Reset
            </Button>
            <Button
              type="submit"
              className="rounded-xl"
              disabled={isSubmitting || !isDirty}
            >
              {isSubmitting ? "Submitting…" : "Submit"}
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
