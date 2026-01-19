import { useState, useEffect, useCallback } from "react";
import UserClient from "@/features/user-profile/api-client/user-client";

export const useUserProfile = (userId: string | null) => {
  const [profileComplete, setProfileComplete] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  const checkProfile = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    console.log("🔍 Checking user profile for userId:", userId);
    try {
      setLoading(true);
      const userClient = new UserClient();
      const response = await userClient.getUserProfile();
      const profile = response.data;
      console.log("✅ Profile fetched successfully:", profile);
      
      // Check if essential profile fields are filled
      const isComplete = !!(
        profile?.fullName &&
        profile?.gradeLevel
      );
      
      console.log("📋 Profile complete:", isComplete);
      setProfileComplete(isComplete);
    } catch (err) {
      console.error("❌ Failed to fetch profile:", err);
      setProfileComplete(false);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    checkProfile();
  }, [checkProfile]);

  return { profileComplete, loading, refetch: checkProfile };
};
