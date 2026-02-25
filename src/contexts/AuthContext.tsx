// src/contexts/AuthContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import api from "../api/axios";

interface User {
  id: string;
  username: string;
  role: "admin" | "temporary";
}

interface UsageInfo {
  usageCount: number;
  maxUsages: number;
  remainingUsages: number;
  message: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  sessionId: string | null;
  login: (username: string, password: string) => Promise<void>;
  loginWithToken: (token: string) => Promise<{ usageInfo?: UsageInfo }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_AUTH_URL = "/auth";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Clear all authentication data from state and localStorage
   */
  const clearAuthData = useCallback(() => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    localStorage.removeItem("session_id");
  }, []);

  /**
   * Handle logout - clear state only
   */
  const handleLogout = useCallback(() => {
    setToken(null);
    setUser(null);
    setSessionId(null);
    clearAuthData();
  }, [clearAuthData]);

  /**
   * Restore authentication state from localStorage on mount
   */
  useEffect(() => {
    const initAuth = () => {
      try {
        const storedToken = localStorage.getItem("auth_token");
        const storedUser = localStorage.getItem("auth_user");
        const storedSessionId = localStorage.getItem("session_id");

        if (storedToken && storedUser) {
          const parsedUser = JSON.parse(storedUser);

          setToken(storedToken);
          setUser(parsedUser);
          setSessionId(storedSessionId);

          console.log("✅ Auth restored from localStorage:", {
            username: parsedUser.username,
            role: parsedUser.role,
            hasSessionId: !!storedSessionId,
          });
        } else {
          console.log("ℹ️ No stored auth data found");
        }
      } catch (error) {
        console.error("❌ Error restoring auth:", error);
        // Clear corrupted data
        clearAuthData();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [clearAuthData]);

  /**
   * Admin login with username and password
   */
  const login = async (username: string, password: string): Promise<void> => {
    console.log("🔐 Login attempt");

    try {
      const response = await api.post(`${API_AUTH_URL}/admin/login`, {
        username,
        password,
      });

      console.log("✅ Login response received");

      const {
        access_token,
        user: userData,
        sessionId: newSessionId,
      } = response.data;

      if (!access_token || !userData) {
        throw new Error("Invalid response from server");
      }

      // Update state
      setToken(access_token);
      setUser(userData);
      setSessionId(newSessionId);

      // Persist to localStorage
      localStorage.setItem("auth_token", access_token);
      localStorage.setItem("auth_user", JSON.stringify(userData));
      localStorage.setItem("session_id", newSessionId);

      console.log("✅ Login successful:", {
        username: userData.username,
        role: userData.role,
      });
    } catch (error: any) {
      console.error("❌ Login failed:", error.response?.data || error.message);
      throw error;
    }
  };

  /**
   * Temporary token login
   * Returns usage info so component can display it
   */
  const loginWithToken = async (
    tempToken: string,
  ): Promise<{ usageInfo?: UsageInfo }> => {
    console.log("🎫 Temporary login attempt with token");

    try {
      const response = await api.post(`${API_AUTH_URL}/temporary/login`, {
        token: tempToken,
      });

      console.log("✅ Temporary login response received");

      const {
        access_token,
        user: userData,
        sessionId: newSessionId,
        usageInfo,
      } = response.data;

      if (!access_token || !userData) {
        throw new Error("Invalid response from server");
      }

      // Update state
      setToken(access_token);
      setUser(userData);
      setSessionId(newSessionId);

      // Persist to localStorage
      localStorage.setItem("auth_token", access_token);
      localStorage.setItem("auth_user", JSON.stringify(userData));
      localStorage.setItem("session_id", newSessionId);

      console.log("✅ Temporary login successful:", {
        username: userData.username,
        role: userData.role,
        usageInfo: usageInfo || "No usage info",
      });

      // Return usage info to component
      return { usageInfo };
    } catch (error: any) {
      console.error(
        "❌ Temporary login failed:",
        error.response?.data || error.message,
      );
      throw error;
    }
  };

  /**
   * Logout - invalidate session on backend and clear local state
   */
  const logout = async (): Promise<void> => {
    console.log("Logging out...");

    try {
      // Call backend logout endpoint if session exists
      if (sessionId && token) {
        await api.post(`${API_AUTH_URL}/logout`).catch((err) => {
          console.warn(
            "Logout API call failed:",
            err.response?.data || err.message,
          );
          // Continue with local logout even if API call fails
        });
      }
    } finally {
      handleLogout();
      console.log("✅ Logged out successfully");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        sessionId,
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
