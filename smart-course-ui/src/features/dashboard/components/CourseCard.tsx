import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { type Course } from "@/lib/api-client/course-client";
import { useNavigate } from "react-router-dom";

interface CourseCardProps {
  course: Course;
  onRetry?: (courseId: string) => void;
}

export const CourseCard = ({ course, onRetry }: CourseCardProps) => {
  const navigate = useNavigate();

  const getStatusBadge = () => {
    switch (course.status) {
      case "GENERATING":
        return <Badge variant="secondary">Generating...</Badge>;
      case "READY":
        return <Badge variant="default">Ready</Badge>;
      case "FAILED":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return null;
    }
  };

  const handleClick = () => {
    if (course.status === "READY") {
      navigate(`/course/${course.id}`);
    }
  };

  return (
    <Card
      className={`${
        course.status === "READY" ? "cursor-pointer hover:shadow-lg" : ""
      } transition-shadow`}
      onClick={handleClick}
    >
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div className="flex-1">
          <CardTitle className="text-xl">{course.title}</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">{course.topic}</p>
        </div>
        {getStatusBadge()}
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Grade Level:</span>
            <span className="font-medium">{course.gradeLevel}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total Lessons:</span>
            <span className="font-medium">{course.totalLessons}</span>
          </div>

          {course.status === "GENERATING" && (
            <div className="mt-4">
              <div className="w-full bg-secondary rounded-full h-2">
                <div className="bg-primary h-2 rounded-full animate-pulse w-2/3"></div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Your course is being generated...
              </p>
            </div>
          )}

          {course.status === "READY" && (
            <Button className="mt-4 w-full">Continue Learning</Button>
          )}

          {course.status === "FAILED" && (
            <div className="mt-4 space-y-2">
              <p className="text-sm text-destructive">
                Failed to generate course. Please try again.
              </p>
              {onRetry && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRetry(course.id);
                  }}
                >
                  Retry
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
