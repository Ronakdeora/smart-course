import AuthClient from "@/lib/api-client/auth-client";
import { useState } from "react";

export interface registerRequest {
  email: string;
  full_name: string;
  password: string;
}

const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const authClient = new AuthClient();

  async function register(request: registerRequest) {
    setLoading(true);
    try {
      const response = await authClient.register(request);
      return response.data;
    } catch (error) {
      setError("Registration failed");
      throw error;
    } finally {
      setLoading(false);
    }
  }

  return { register, loading, error };
};

export default useAuth;
