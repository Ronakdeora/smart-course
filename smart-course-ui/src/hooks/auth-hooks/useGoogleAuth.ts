import { useState } from "react";
import { useNavigate } from "react-router";
import AuthClient from "@/lib/api-client/auth-client";
import { useGoogleLogin, type CodeResponse } from "@react-oauth/google";

interface GoogleAuthResponse {
  accessToken: string;
  user?: {
    id: string;
    email: string;
    full_name?: string;
    profile_completed?: boolean;
    onboarding_completed?: boolean;
  };
}

export const useGoogleAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const authClient = new AuthClient();

  // Use redirect flow with authorization code
  const googleLogin = useGoogleLogin({
    flow: "auth-code",
    redirect_uri: import.meta.env.VITE_GOOGLE_REDIRECT_URI,
    onSuccess: async (codeResponse: CodeResponse) => {
      setIsLoading(true);
      setError(null);

      try {
        // Send the authorization code to your backend for token exchange
        const response = await authClient.googleTokenExchange(codeResponse.code);

        const data: GoogleAuthResponse = response.data;

        // Store the token and user data
        localStorage.setItem("token", data.accessToken);
        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
        }

        // Navigate to dashboard - AppInitializer will handle routing based on profile status
        navigate("/dashboard");
      } catch (err: any) {
        console.error("Google login failed:", err);
        setError(
          err.response?.data?.message || "Google login failed. Please try again."
        );
      } finally {
        setIsLoading(false);
      }
    },
    onError: (error) => {
      console.error("Google login error:", error);
      setError("Google login was cancelled or failed");
    },
  });

  return {
    googleLogin,
    isLoading,
    error,
  };
};
