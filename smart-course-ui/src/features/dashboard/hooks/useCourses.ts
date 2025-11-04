import { useQuery } from "@tanstack/react-query";
import CourseClient, { type Course } from "@/lib/api-client/course-client";

export const useCourses = () => {
  const courseClient = new CourseClient();

  const coursesQuery = useQuery<Course[]>({
    queryKey: ["courses"],
    queryFn: async () => {
      console.log("🔍 useCourses: Calling getCoursesForUser API...");
      const data = await courseClient.getCoursesForUser();
      console.log("✅ Courses fetched successfully:", data);
      return data;
    },
    enabled: !!localStorage.getItem("token"),
    staleTime: 5 * 60 * 1000, // Data stays fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Cache persists for 10 minutes (formerly cacheTime)
  });

  const courses = coursesQuery.data ?? [];

  return {
    courses,
    loading: coursesQuery.isLoading,
    error: coursesQuery.error ? "Failed to load courses" : null,
    refetch: coursesQuery.refetch,
    hasCourses: courses.length > 0,
    generatingCourses: courses.filter((c) => c.status === "GENERATING"),
    readyCourses: courses.filter((c) => c.status === "READY"),
    failedCourses: courses.filter((c) => c.status === "FAILED"),
  };
};
