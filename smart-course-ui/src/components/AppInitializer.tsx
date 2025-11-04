import { useEffect, useState } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useUserProfile } from "@/features/dashboard/hooks/useUserProfile";
import { useCourses } from "@/features/dashboard/hooks/useCourses";
import { Skeleton } from "./ui/skeleton";

export const AppInitializer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userId, setUserId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const { profileComplete, loading: profileLoading } = useUserProfile(userId);
  const { hasCourses, loading: coursesLoading } = useCourses();

  useEffect(() => {
    // Get user from localStorage
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserId(user.id);
      } catch (error) {
        console.error("Failed to parse user:", error);
      }
    }
  }, []);

  useEffect(() => {
    // Only run routing logic after we have the user and data is loaded
    if (!userId || profileLoading || coursesLoading) {
      return;
    }

    // Don't redirect if we're already on the target path
    const currentPath = location.pathname;

    // Profile incomplete -> /profile/setup
    if (profileComplete === false && currentPath !== "/profile/setup") {
      navigate("/profile/setup", { replace: true });
      setIsInitialized(true);
      return;
    }

    // Profile complete but no courses -> /onboarding
    if (
      profileComplete === true &&
      !hasCourses &&
      currentPath !== "/onboarding" &&
      currentPath !== "/dashboard"
    ) {
      navigate("/onboarding", { replace: true });
      setIsInitialized(true);
      return;
    }

    // Profile complete and has courses -> /dashboard
    if (
      profileComplete === true &&
      hasCourses &&
      currentPath !== "/dashboard" &&
      !currentPath.startsWith("/course/")
    ) {
      navigate("/dashboard", { replace: true });
      setIsInitialized(true);
      return;
    }

    setIsInitialized(true);
  }, [userId, profileComplete, hasCourses, profileLoading, coursesLoading, navigate, location]);

  if (!isInitialized || profileLoading || coursesLoading) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center p-6">
        <div className="w-full max-w-4xl space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return <Outlet />;
};
