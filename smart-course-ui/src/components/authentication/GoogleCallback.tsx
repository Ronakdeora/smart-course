import { useEffect } from "react";
import { useNavigate } from "react-router";

export function GoogleCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // The @react-oauth/google library handles the callback automatically
    // when using the auth-code flow with redirect.
    // This component just shows a loading state while the redirect completes.
    
    // If there's an error in the URL, handle it
    const params = new URLSearchParams(window.location.search);
    const error = params.get("error");
    
    if (error) {
      console.error("Google OAuth error:", error);
      // Redirect back to login with error
      navigate("/login?error=google_auth_failed");
    }
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mb-4">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
        </div>
        <p className="text-lg">Completing Google sign-in...</p>
      </div>
    </div>
  );
}
