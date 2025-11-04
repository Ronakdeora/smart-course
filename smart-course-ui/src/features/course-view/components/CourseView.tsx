import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useCourse } from "../hooks/useCourse";

export const CourseView = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { course, loading, error } = useCourse(courseId);

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-destructive">{error || "Course not found"}</p>
            <Button className="mt-4" onClick={() => navigate("/dashboard")}>
              Back to Dashboard
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
          <h1 className="text-3xl font-bold">{course.title}</h1>
          <p className="text-muted-foreground mt-1">{course.topic}</p>
        </div>
        <div className="flex gap-3">
          <Badge variant={course.status === "READY" ? "default" : "secondary"}>
            {course.status}
          </Badge>
          <Button variant="outline" onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Course Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Grade Level:</span>
            <span className="font-medium">{course.gradeLevel}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Lessons:</span>
            <span className="font-medium">{course.totalLessons}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Source Filter:</span>
            <span className="font-medium">{course.sourceFilter}</span>
          </div>
        </CardContent>
      </Card>

      {course.lessons && course.lessons.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Lessons</h2>
          <div className="space-y-4">
            {course.lessons.map((lesson) => (
              <Card key={lesson.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        Lesson {lesson.lessonNumber}: {lesson.title}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {lesson.description}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {lesson.keyConcepts && lesson.keyConcepts.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Key Concepts:</h4>
                      <div className="flex flex-wrap gap-2">
                        {lesson.keyConcepts.map((concept, idx) => (
                          <Badge key={idx} variant="secondary">
                            {concept}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {lesson.learningObjectives &&
                    lesson.learningObjectives.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">
                          Learning Objectives:
                        </h4>
                        <ul className="list-disc list-inside space-y-1">
                          {lesson.learningObjectives.map((objective, idx) => (
                            <li key={idx} className="text-sm">
                              {objective}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                  <Button
                    className="w-full"
                    onClick={() => navigate(`/course/${course.id}/lesson/${lesson.id}`, {
                      state: { course }
                    })}
                  >
                    Start Lesson
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {course.status === "FAILED" && course.errorMessage && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">{course.errorMessage}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
