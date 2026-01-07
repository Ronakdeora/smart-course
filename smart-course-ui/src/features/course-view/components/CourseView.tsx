import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useCourse } from "../hooks/useCourse";
import { BookOpen, Target, Lightbulb, ArrowRight, CheckCircle2 } from "lucide-react";

export const CourseView = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { course, loading, error } = useCourse(courseId);
  const [hoveredLesson, setHoveredLesson] = useState<string | null>(null);

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
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Course Lessons</h2>
            <Badge variant="outline" className="text-sm">
              {course.lessons.length} {course.lessons.length === 1 ? 'Lesson' : 'Lessons'}
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {course.lessons.map((lesson) => (
              <div
                key={lesson.id}
                className="group relative"
                onMouseEnter={() => setHoveredLesson(lesson.id)}
                onMouseLeave={() => setHoveredLesson(null)}
              >
                <Card 
                  className="h-full cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-2 hover:border-blue-400 overflow-hidden"
                  onClick={() => navigate(`/course/${course.id}/lesson/${lesson.id}`, {
                    state: { course }
                  })}
                >
                  {/* Lesson Number Badge */}
                  <div className="absolute top-4 right-4 z-10">
                    <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold shadow-lg">
                      {lesson.lessonNumber}
                    </div>
                  </div>

                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-3 pr-12">
                      <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0 mt-1">
                        <BookOpen className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg font-bold leading-tight mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                          {lesson.title}
                        </CardTitle>
                        <p className="text-sm text-slate-600 line-clamp-2">
                          {lesson.description}
                        </p>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Key Concepts Preview */}
                    {lesson.keyConcepts && lesson.keyConcepts.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Lightbulb className="w-4 h-4 text-amber-600" />
                          <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                            Key Concepts
                          </h4>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {lesson.keyConcepts.slice(0, 3).map((concept, idx) => (
                            <Badge 
                              key={idx} 
                              variant="secondary" 
                              className="text-xs bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200 transition-colors"
                            >
                              {concept}
                            </Badge>
                          ))}
                          {lesson.keyConcepts.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{lesson.keyConcepts.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Learning Objectives - Show on Hover */}
                    <div 
                      className={`transition-all duration-300 ease-in-out ${
                        hoveredLesson === lesson.id 
                          ? 'max-h-[300px] opacity-100' 
                          : 'max-h-0 opacity-0 overflow-hidden'
                      }`}
                    >
                      {lesson.learningObjectives && lesson.learningObjectives.length > 0 && (
                        <div className="space-y-2 pt-2 border-t border-slate-200">
                          <div className="flex items-center gap-2">
                            <Target className="w-4 h-4 text-green-600" />
                            <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                              Learning Objectives
                            </h4>
                          </div>
                          <ul className="space-y-1.5">
                            {lesson.learningObjectives.slice(0, 3).map((objective, idx) => (
                              <li key={idx} className="text-xs text-slate-600 flex items-start gap-2">
                                <CheckCircle2 className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                                <span className="line-clamp-2">{objective}</span>
                              </li>
                            ))}
                            {lesson.learningObjectives.length > 3 && (
                              <li className="text-xs text-slate-500 italic">
                                +{lesson.learningObjectives.length - 3} more objectives
                              </li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Start Lesson Button */}
                    <Button 
                      className="w-full mt-4 group-hover:bg-blue-600 group-hover:shadow-lg transition-all duration-300"
                      size="sm"
                    >
                      <span>Start Lesson</span>
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              </div>
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
