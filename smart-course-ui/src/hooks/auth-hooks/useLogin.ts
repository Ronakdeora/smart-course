import AuthClient from "@/lib/api-client/auth-client";
import { useState } from "react";

export interface loginRequest {
  email: string;
  password: string;
}

const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const authClient = new AuthClient();

  async function login(request: loginRequest) {
    setLoading(true);
    try {
      const response = await authClient.login(request);
      return response.data;
    } catch (error) {
      setError("Login failed");
      throw error;
    } finally {
      setLoading(false);
    }
  }

  return { login, loading, error };
};

export default useLogin;
