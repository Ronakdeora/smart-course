import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

interface User {
  id: string;
  email: string;
  full_name: string;
}

export const useAuthGuard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const checkAuth = useCallback(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (!token) {
      setLoading(false);
      navigate("/login");
      return;
    }

    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        setUser(userData);
      } catch (error) {
        console.error("Failed to parse user data:", error);
        localStorage.removeItem("user");
      }
    }

    setLoading(false);
  }, [navigate]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  return { user, loading, isAuthenticated: !!user, logout };
};
