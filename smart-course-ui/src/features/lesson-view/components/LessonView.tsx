import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import CourseClient, { type LessonContent, type CourseContent } from "@/lib/api-client/course-client";

export const LessonView = () => {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [lesson, setLesson] = useState<LessonContent | null>(null);
  const [allLessons, setAllLessons] = useState<LessonContent[]>([]);

  // Get course data from location state (passed from CourseView)
  const courseFromState = location.state?.course as CourseContent | undefined;

  // Use React Query to fetch course data (will use cache if available)
  const courseClient = new CourseClient();
  const { data: courseData, isLoading, error } = useQuery<CourseContent>({
    queryKey: ["course", courseId],
    queryFn: async () => {
      if (!courseId) throw new Error("Course ID is required");
      console.log("🌐 Fetching course data from API");
      return await courseClient.getCourseById(courseId);
    },
    enabled: !!courseId && !courseFromState,
    staleTime: 5 * 60 * 1000, // Data stays fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Cache persists for 10 minutes
    initialData: courseFromState, // Use state data if available
  });

  useEffect(() => {
    if (!courseId || !lessonId) return;

    const loadLesson = () => {
      try {
        let course: CourseContent | undefined;
        
        // Use course data from state, query cache, or fetched data
        if (courseFromState && courseFromState.id === courseId) {
          console.log("✅ Using cached course data from navigation state");
          course = courseFromState;
        } else if (courseData) {
          console.log("✅ Using course data from React Query");
          course = courseData;
        }

        if (!course) return;
        
        const lessonData = course.lessons.find(l => l.id === lessonId);
        
        if (!lessonData) {
          throw new Error("Lesson not found in course");
        }
        
        setLesson(lessonData);
        setAllLessons(course.lessons);
      } catch (err) {
        console.error("Failed to load lesson:", err);
      }
    };

    loadLesson();
  }, [courseId, lessonId, courseFromState, courseData]);

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-destructive">{error ? "Failed to load lesson" : "Lesson not found"}</p>
            <Button className="mt-4" onClick={() => navigate(`/course/${courseId}`)}>
              Back to Course
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Badge variant="secondary">Lesson {lesson.lessonNumber}</Badge>
            <h1 className="text-3xl font-bold">{lesson.title}</h1>
          </div>
          <p className="text-muted-foreground">{lesson.description}</p>
        </div>
        <Button variant="outline" onClick={() => navigate(`/course/${courseId}`)}>
          Back to Course
        </Button>
      </div>

      {lesson.keyConcepts && lesson.keyConcepts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Key Concepts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {lesson.keyConcepts.map((concept, idx) => (
                <Badge key={idx} variant="secondary">
                  {concept}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {lesson.learningObjectives && lesson.learningObjectives.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Learning Objectives</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2">
              {lesson.learningObjectives.map((objective, idx) => (
                <li key={idx}>{objective}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Lesson Content</CardTitle>
        </CardHeader>
        <CardContent className="prose max-w-none">
          {lesson.contentMd ? (
            <div className="whitespace-pre-wrap">{lesson.contentMd}</div>
          ) : (
            <>
              <p className="text-muted-foreground">
                Lesson content will be displayed here. This can include text,
                images, videos, interactive exercises, and more.
              </p>
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <p className="text-sm">
                  📝 Content rendering will be implemented based on your backend
                  content format (Markdown or JSON).
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {lesson.sources && lesson.sources.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Sources & References</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {lesson.sources.map((source, idx) => (
                <li key={idx} className="text-sm">
                  <a
                    href={source}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {source}
                  </a>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between items-center pt-4">
        <Button 
          variant="outline" 
          onClick={() => {
            const currentIndex = allLessons.findIndex(l => l.id === lessonId);
            if (currentIndex > 0) {
              const prevLesson = allLessons[currentIndex - 1];
              navigate(`/course/${courseId}/lesson/${prevLesson.id}`, {
                state: { course: { id: courseId, lessons: allLessons } }
              });
            }
          }}
          disabled={lesson.lessonNumber <= 1}
        >
          ← Previous Lesson
        </Button>
        <Button 
          onClick={() => {
            const currentIndex = allLessons.findIndex(l => l.id === lessonId);
            if (currentIndex < allLessons.length - 1) {
              const nextLesson = allLessons[currentIndex + 1];
              navigate(`/course/${courseId}/lesson/${nextLesson.id}`, {
                state: { course: { id: courseId, lessons: allLessons } }
              });
            }
          }}
          disabled={lesson.lessonNumber >= allLessons.length}
        >
          Next Lesson →
        </Button>
      </div>
    </div>
  );
};
