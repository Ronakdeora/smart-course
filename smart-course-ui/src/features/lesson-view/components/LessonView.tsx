import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import CourseClient, { type LessonContent, type CourseContent } from "@/lib/api-client/course-client";
import { CollapsibleMarkdown } from "./CollapsibleMarkdown";
import { BookOpen, Target, Lightbulb, ExternalLink, Menu, X, ChevronDown, ChevronUp } from "lucide-react";

export const LessonView = () => {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [lesson, setLesson] = useState<LessonContent | null>(null);
  const [allLessons, setAllLessons] = useState<LessonContent[]>([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    concepts: false,
    objectives: false,
    sources: false,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };


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
    <div className="min-h-screen bg-slate-50">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate(`/course/${courseId}`)}
            >
              ← Back
            </Button>
            <div className="hidden md:flex items-center gap-3">
              <Badge variant="secondary" className="text-xs">
                {lesson.lessonNumber}/{allLessons.length}
              </Badge>
              <span className="text-sm font-medium text-slate-700 truncate max-w-md">
                {lesson.title}
              </span>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSidebar(!showSidebar)}
            className="md:hidden"
          >
            {showSidebar ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 lg:py-8 flex gap-6 max-w-7xl">
        {/* Main Content Area */}
        <main className="flex-1 min-w-0">
          {/* Main Content with Collapsible Sections */}
          {lesson.contentMd ? (
            <div className="mb-6">
              <CollapsibleMarkdown content={lesson.contentMd} />
            </div>
          ) : null}

          {!lesson.contentMd && (
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 md:p-8 mb-6">
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">No content available</p>
              </div>
            </div>
          )}



          {/* Navigation Buttons */}
          <div className="flex justify-between items-center gap-4 mt-8">
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
              className="flex-1"
            >
              ← Previous
            </Button>
            
            <div className="hidden sm:block text-center px-4 flex-shrink-0">
              <div className="text-xs text-slate-500 mb-1">
                {lesson.lessonNumber} of {allLessons.length}
              </div>
              <div className="w-32 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600 rounded-full transition-all"
                  style={{ width: `${(lesson.lessonNumber / allLessons.length) * 100}%` }}
                />
              </div>
            </div>

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
              className="flex-1"
            >
              Next →
            </Button>
          </div>
        </main>

        {/* Sticky Sidebar - Collapsible Metadata */}
        <aside className={`${
          showSidebar ? 'fixed inset-0 z-50 bg-black/20 md:relative md:bg-transparent' : 'hidden'
        } md:block md:w-80 lg:w-96`}>
          <div className={`${
            showSidebar ? 'absolute right-0 top-0 bottom-0 w-80 bg-white shadow-2xl overflow-y-auto' : ''
          } md:sticky md:top-20 md:max-h-[calc(100vh-6rem)] md:overflow-y-auto md:bg-white md:rounded-lg md:border md:border-slate-200 md:shadow-sm`}>
            {/* Mobile Close Button */}
            {showSidebar && (
              <div className="md:hidden p-4 border-b border-slate-200 flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">Lesson Info</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSidebar(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}

            <div className="p-4 space-y-3">
              {/* Key Concepts - Collapsible */}
              {lesson.keyConcepts && lesson.keyConcepts.length > 0 && (
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleSection('concepts')}
                    className="w-full flex items-center justify-between p-3 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-semibold text-slate-900">Key Concepts</span>
                      <Badge variant="secondary" className="text-xs">{lesson.keyConcepts.length}</Badge>
                    </div>
                    {expandedSections.concepts ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {expandedSections.concepts && (
                    <div className="p-3 pt-0 border-t border-slate-100">
                      <div className="flex flex-wrap gap-1.5">
                        {lesson.keyConcepts.map((concept, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                            {concept}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Learning Objectives - Collapsible */}
              {lesson.learningObjectives && lesson.learningObjectives.length > 0 && (
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleSection('objectives')}
                    className="w-full flex items-center justify-between p-3 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-semibold text-slate-900">Objectives</span>
                      <Badge variant="secondary" className="text-xs">{lesson.learningObjectives.length}</Badge>
                    </div>
                    {expandedSections.objectives ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {expandedSections.objectives && (
                    <div className="p-3 pt-0 border-t border-slate-100">
                      <ul className="space-y-2">
                        {lesson.learningObjectives.map((objective, idx) => (
                          <li key={idx} className="text-xs text-slate-700 flex items-start gap-2">
                            <span className="text-blue-600 font-bold mt-0.5 flex-shrink-0">•</span>
                            <span>{objective}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Sources - Collapsible */}
              {lesson.sources && lesson.sources.length > 0 && (
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleSection('sources')}
                    className="w-full flex items-center justify-between p-3 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <ExternalLink className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-semibold text-slate-900">Sources</span>
                      <Badge variant="secondary" className="text-xs">{lesson.sources.length}</Badge>
                    </div>
                    {expandedSections.sources ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {expandedSections.sources && (
                    <div className="p-3 pt-0 border-t border-slate-100">
                      <ul className="space-y-2">
                        {lesson.sources.map((source, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-green-600 font-semibold text-xs mt-0.5 flex-shrink-0">{idx + 1}.</span>
                            <a
                              href={source}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:text-blue-800 underline break-all"
                            >
                              {source}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
