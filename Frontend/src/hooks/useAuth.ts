import { useState, useEffect, createContext, useContext } from "react";
import { User } from "../types";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  authFetch: (url: string, options?: RequestInit) => Promise<Response>;
}

// Create context
export const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoading: false,
  login: async () => {},
  logout: () => {},
  authFetch: async () => new Response(),
});

// Hook
export function useAuth() {
  return useContext(AuthContext);
}

// Provider logic
export const useAuthProvider = () => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Load saved auth
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (savedToken) setToken(savedToken);
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  // -------------------------
  // LOGIN
  // -------------------------
  const login = async (username: string, password: string) => {
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:8000/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Login failed");
      }

      // Save token
      setToken(data.access_token);
      localStorage.setItem("token", data.access_token);

      // Backend sends user object
      const newUser: User = {
        id: data.user.id,
        role: data.user.role,
        name: data.user.username,
        email: data.user.username,
      };

      setUser(newUser);
      localStorage.setItem("user", JSON.stringify(newUser));

      // Redirect
      if (data.redirect_url) {
        window.location.href = data.redirect_url;
      }
    } catch (error) {
      console.error(error);
      alert((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  // -------------------------
  // LOGOUT
  // -------------------------
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "/";
  };

  // -------------------------
  // AUTH FETCH
  // -------------------------
  const authFetch = async (
    url: string,
    options: RequestInit = {}
  ): Promise<Response> => {
    const authToken = token || localStorage.getItem("token");

    if (!authToken) {
      throw new Error("Not authenticated");
    }

    return fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
        ...(options.headers || {}),
      },
    });
  };

  return {
    user,
    token,
    isLoading,
    login,
    logout,
    authFetch,
  };
};