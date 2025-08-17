import App from "@/App";
import AuthForm from "@/components/authentication/auth-form";
import { LoginForm } from "@/components/login-form";
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
    ],
  },
]);

export default router;
