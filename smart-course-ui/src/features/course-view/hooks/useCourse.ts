import { useQuery } from "@tanstack/react-query";
import CourseClient, { type CourseContent } from "@/lib/api-client/course-client";

export const useCourse = (courseId: string | undefined) => {
  const courseClient = new CourseClient();

  const courseQuery = useQuery<CourseContent>({
    queryKey: ["course", courseId],
    queryFn: async () => {
      if (!courseId) throw new Error("Course ID is required");
      console.log(`🔍 useCourse: Fetching course ${courseId}...`);
      const data = await courseClient.getCourseById(courseId);
      console.log("✅ Course fetched successfully:", data);
      return data;
    },
    enabled: !!courseId && !!localStorage.getItem("token"),
    staleTime: 5 * 60 * 1000, // Data stays fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Cache persists for 10 minutes
  });

  return {
    course: courseQuery.data,
    loading: courseQuery.isLoading,
    error: courseQuery.error ? "Failed to load course" : null,
    refetch: courseQuery.refetch,
  };
};
