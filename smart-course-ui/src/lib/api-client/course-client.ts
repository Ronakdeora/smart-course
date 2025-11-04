import apiClient from "./general-api-client";

export interface CourseGenerationRequest {
  request_id: string;
  user_id: string;
  topic: string;
  grade_level: string;
  num_lessons: number;
  source_filter: string;
}

export interface CourseGenerationResponse {
  userId: string;
  courseId: string;
  status: "SUCCESS" | "FAILED";
  message: string;
}

export interface LessonContent {
  id: string;
  title: string;
  description: string;
  lessonNumber: number;
  keyConcepts: string[];
  learningObjectives: string[];
  sources: string[];
  contentMd: string;
  contentJson: string;
}

export interface CourseContent {
  id: string;
  title: string;
  topic: string;
  gradeLevel: string;
  sourceFilter: string;
  totalLessons: number;
  outlineJson: string;
  status: "GENERATING" | "READY" | "FAILED";
  errorMessage?: string;
  lessons: LessonContent[];
}

export interface Course {
  id: string;
  userId: string;
  topic: string;
  title: string;
  gradeLevel: string;
  totalLessons: number;
  status: "GENERATING" | "READY" | "FAILED";
  createdAt: string;
  updatedAt: string;
}

class CourseClient {
  async getCoursesForUser(): Promise<Course[]> {
    const response = await apiClient.get(`/learning-service/courses/user`);
    return response.data;
  }

  async getCourseById(courseId: string): Promise<CourseContent> {
    const response = await apiClient.get(`/learning-service/courses/${courseId}`);
    return response.data;
  }

  async createCourse(
    request: CourseGenerationRequest
  ): Promise<CourseGenerationResponse> {
    const response = await apiClient.post("/learning-service/courses", request);
    return response.data;
  }
}

export default CourseClient;
