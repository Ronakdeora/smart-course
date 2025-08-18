import App from "@/App";
import { AuthForm } from "@/components/authentication/auth-form";
import { LoginForm } from "@/components/authentication/login-form";
import UserProfile from "@/components/user-profile";
import { createBrowserRouter } from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <LoginForm />,
      },
      {
        path: "/register",
        element: <AuthForm />,
      },
      {
        path: "/user",
        element: <UserProfile />,
      },
    ],
  },
]);

export default router;
