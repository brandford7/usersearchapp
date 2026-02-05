// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

interface User {
  id: string;
  username: string;
  role: "admin" | "temporary";
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  loginWithToken: (token: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = import.meta.env.VITE_API_URL;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // Add loading state

  // Restore auth state on mount
  useEffect(() => {
    const initAuth = () => {
      try {
        const storedToken = localStorage.getItem("auth_token");
        const storedUser = localStorage.getItem("auth_user");

        if (storedToken && storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setToken(storedToken);
          setUser(parsedUser);
          // Set default axios header
          axios.defaults.headers.common["Authorization"] =
            `Bearer ${storedToken}`;
          console.log("Auth restored from localStorage:", parsedUser);
        }
      } catch (error) {
        console.error("Error restoring auth:", error);
        // Clear corrupted data
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (username: string, password: string) => {
    console.log("Login attempt to:", `${API_URL}/admin/login`);

    try {
      const response = await axios.post(`${API_URL}/admin/login`, {
        username,
        password,
      });

      console.log("Login response:", response.data);

      const { access_token, user: userData } = response.data;

      setToken(access_token);
      setUser(userData);
      localStorage.setItem("auth_token", access_token);
      localStorage.setItem("auth_user", JSON.stringify(userData));
      axios.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;

      console.log("Login successful, token saved");
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const loginWithToken = async (tempToken: string) => {
    try {
      const response = await axios.post(`${API_URL}/temporary/login`, {
        token: tempToken,
      });

      const { access_token, user: userData } = response.data;

      setToken(access_token);
      setUser(userData);
      localStorage.setItem("auth_token", access_token);
      localStorage.setItem("auth_user", JSON.stringify(userData));
      axios.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;
    } catch (error) {
      console.error("Token login failed:", error);
      throw error;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    delete axios.defaults.headers.common["Authorization"];
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        loginWithToken,
        logout,
        isAuthenticated: !!token,
        isAdmin: user?.role === "admin",
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
