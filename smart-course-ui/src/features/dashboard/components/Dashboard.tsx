import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCourses } from "../hooks/useCourses";
import { useUserProfile } from "../hooks/useUserProfile";
import { CourseCard } from "./CourseCard";
import { EmptyState } from "./EmptyState";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export const Dashboard = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [checkedInitialRoute, setCheckedInitialRoute] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    console.log("📦 User from localStorage:", userStr);
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        console.log("👤 Parsed user:", user);
        setUserId(user.id);
      } catch (error) {
        console.error("Failed to parse user:", error);
      }
    }
  }, []);

  const { profileComplete, loading: profileLoading } = useUserProfile(userId);
  const {
    loading: coursesLoading,
    error,
    refetch,
    hasCourses,
    generatingCourses,
    readyCourses,
    failedCourses,
  } = useCourses();

  // Handle initial routing based on profile and course status
  useEffect(() => {
    if (checkedInitialRoute || profileLoading || coursesLoading || !userId) {
      return;
    }

    // Only check once when data is loaded
    if (profileComplete === false) {
      navigate("/profile/setup", { replace: true });
      return;
    }

    if (profileComplete === true && !hasCourses) {
      const hasSeenOnboarding = localStorage.getItem("hasSeenOnboarding");
      if (!hasSeenOnboarding) {
        navigate("/onboarding", { replace: true });
        return;
      }
    }

    setCheckedInitialRoute(true);
  }, [
    profileComplete,
    hasCourses,
    profileLoading,
    coursesLoading,
    userId,
    navigate,
    checkedInitialRoute,
  ]);

  const handleRetry = (courseId: string) => {
    console.log("Retrying course:", courseId);
    // Implement retry logic here
    refetch();
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const loading = profileLoading || coursesLoading;

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center text-destructive">
          <p>{error}</p>
          <Button onClick={refetch} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!hasCourses) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">My Courses</h1>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Courses</h1>
        <div className="flex gap-3">
          <Button onClick={() => navigate("/course/create")}>
            Create New Course
          </Button>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>

      {generatingCourses.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Generating</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {generatingCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </section>
      )}

      {readyCourses.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Continue Learning</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {readyCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </section>
      )}

      {failedCourses.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Failed Courses</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {failedCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onRetry={handleRetry}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
