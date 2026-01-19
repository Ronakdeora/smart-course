import App from "@/App";
import { AuthForm } from "@/components/authentication/auth-form";
import { LoginForm } from "@/components/authentication/login-form";
import { GoogleCallback } from "@/components/authentication/GoogleCallback";
import UserProfileForm from "@/features/user-profile/components/user-profile-form";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Dashboard } from "@/features/dashboard/components/Dashboard";
import { Onboarding } from "@/features/onboarding/components/Onboarding";
import { ProfileSetup } from "@/features/profile-setup/components/ProfileSetup";
import { CourseCreationForm } from "@/features/course-creation/components/CourseCreationForm";
import { CourseView } from "@/features/course-view/components/CourseView";
import { LessonView } from "@/features/lesson-view/components/LessonView";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <Navigate to="/login" replace />,
      },
      {
        path: "/login",
        element: <LoginForm />,
      },
      {
        path: "/login/google",
        element: <GoogleCallback />,
      },
      {
        path: "/register",
        element: <AuthForm />,
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: "/profile/setup",
            element: <ProfileSetup />,
          },
          {
            path: "/onboarding",
            element: <Onboarding />,
          },
          {
            path: "/dashboard",
            element: <Dashboard />,
          },
          {
            path: "/user",
            element: <UserProfileForm />,
          },
          {
            path: "/course/create",
            element: <CourseCreationForm />,
          },
          {
            path: "/course/:courseId",
            element: <CourseView />,
          },
          {
            path: "/course/:courseId/lesson/:lessonId",
            element: <LessonView />,
          },
        ],
      },
    ],
  },
]);

export default router;
