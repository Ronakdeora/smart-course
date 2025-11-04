import { FormProvider } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { useUserProfileForm } from "@/features/user-profile/hooks/useUserProfileForm";
import { PreferencesSection } from "@/features/user-profile/components/sections/preferences";
import AiProfileSection from "@/features/user-profile/components/sections/ai-profile";
import { IdentitySection } from "@/features/user-profile/components/sections/profile";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type UserProfileFormValues } from "@/features/user-profile/utils/types";

export const ProfileSetup = () => {
  const navigate = useNavigate();
  const {
    form,
    submit,
    patchForm,
    userProfileQuery: { data: userProfileData },
  } = useUserProfileForm();

  useEffect(() => {
    if (userProfileData) {
      patchForm(userProfileData);
    }
  }, [userProfileData, patchForm]);

  const {
    handleSubmit,
    formState: { isSubmitting, isDirty },
  } = form;

  const handleSkip = () => {
    navigate("/onboarding");
  };

  const handleSubmitAndContinue = async (data: UserProfileFormValues) => {
    await submit(data);
    navigate("/onboarding");
  };

  return (
    <div className="container mx-auto max-w-4xl p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-2xl">
            Complete Your Profile
          </CardTitle>
          <p className="text-center text-muted-foreground">
            Help us personalize your learning experience by completing your
            profile.
          </p>
        </CardHeader>
        <CardContent>
          <FormProvider {...form}>
            <form
              className="space-y-6"
              onSubmit={handleSubmit(handleSubmitAndContinue)}
              noValidate
            >
              <IdentitySection />
              <PreferencesSection />
              <AiProfileSection />

              <div className="flex items-center justify-between gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSkip}
                  className="rounded-xl"
                >
                  Skip for Now
                </Button>
                <div className="flex gap-3">
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
                    {isSubmitting ? "Saving..." : "Save & Continue"}
                  </Button>
                </div>
              </div>
            </form>
          </FormProvider>
        </CardContent>
      </Card>
    </div>
  );
};
