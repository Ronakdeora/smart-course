import App from "@/App";
import { AuthForm } from "@/components/authentication/auth-form";
import { LoginForm } from "@/components/authentication/login-form";
import UserProfileForm from "@/components/user/user-profile";
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
        element: <UserProfileForm />,
      },
    ],
  },
]);

export default router;
