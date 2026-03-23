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
  getLoginPath: () => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Storage keys
const STORAGE_KEYS = {
  TOKEN: "auth_token",
  USER: "auth_user",
  SESSION_ID: "session_id",
  TIMESTAMP: "auth_timestamp",
  LAST_LOGIN_TYPE: "last_login_type",
} as const;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Save auth data to localStorage with login type
   */
  const saveAuthData = useCallback(
    (authToken: string, userData: User, sessionIdValue: string) => {
      try {
        localStorage.setItem(STORAGE_KEYS.TOKEN, authToken);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
        localStorage.setItem(STORAGE_KEYS.SESSION_ID, sessionIdValue);
        localStorage.setItem(STORAGE_KEYS.TIMESTAMP, Date.now().toString());
        localStorage.setItem(STORAGE_KEYS.LAST_LOGIN_TYPE, userData.role); // Store login type for smart redirects

        console.log("💾 Auth data saved:", {
          username: userData.username,
          role: userData.role,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.error("❌ Failed to save auth data:", error);
      }
    },
    [],
  );

  /**
   * Clear auth data but preserve last login type for smart redirects
   */
  const clearAuthData = useCallback(() => {
    try {
      const lastLoginType = localStorage.getItem(STORAGE_KEYS.LAST_LOGIN_TYPE);

      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem(STORAGE_KEYS.SESSION_ID);
      localStorage.removeItem(STORAGE_KEYS.TIMESTAMP);
      // DON'T remove LAST_LOGIN_TYPE - we need it for smart redirects

      delete api.defaults.headers.common["Authorization"];
      console.log(
        "🗑️ Auth data cleared, last login type preserved:",
        lastLoginType,
      );
    } catch (error) {
      console.error("❌ Failed to clear auth data:", error);
    }
  }, []);

  /**
   * Handle logout - clear state
   */
  const handleLogout = useCallback(() => {
    setToken(null);
    setUser(null);
    setSessionId(null);
    clearAuthData();
  }, [clearAuthData]);

  /**
   * Get the appropriate login path based on user role
   */
  const getLoginPath = useCallback(() => {
    // First check if user is currently logged in
    if (user?.role) {
      return user.role === "admin" ? "/login" : "/temporary-login";
    }

    // If not logged in, check last login type from localStorage
    const lastLoginType = localStorage.getItem(STORAGE_KEYS.LAST_LOGIN_TYPE);
    return lastLoginType === "admin" ? "/login" : "/temporary-login";
  }, [user]);

  /**
   * Restore authentication state from localStorage on mount
   */
  useEffect(() => {
    const initAuth = async () => {
      try {
        console.log("🔍 Checking for stored auth data...");

        const storedToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
        const storedUserStr = localStorage.getItem(STORAGE_KEYS.USER);
        const storedSessionId = localStorage.getItem(STORAGE_KEYS.SESSION_ID);
        const storedTimestamp = localStorage.getItem(STORAGE_KEYS.TIMESTAMP);

        console.log("📊 Storage check:", {
          hasToken: !!storedToken,
          hasUser: !!storedUserStr,
          hasSessionId: !!storedSessionId,
          timestamp: storedTimestamp,
        });

        if (storedToken && storedUserStr) {
          const parsedUser = JSON.parse(storedUserStr);

          console.log("✅ Found stored auth data:", {
            username: parsedUser.username,
            role: parsedUser.role,
            hasSessionId: !!storedSessionId,
            savedAt: storedTimestamp
              ? new Date(parseInt(storedTimestamp)).toISOString()
              : "unknown",
          });

          // Set token in axios for verification request
          api.defaults.headers.common["Authorization"] =
            `Bearer ${storedToken}`;

          try {
            // Verify token is still valid
            await api.get("/auth/profile");
            console.log("✅ Token validated successfully");

            // Token is valid, restore auth state
            setToken(storedToken);
            setUser(parsedUser);
            setSessionId(storedSessionId);
          } catch (verifyError) {
            console.warn(
              "⚠️ Stored token is invalid or expired, clearing auth data",
            );
            clearAuthData();
          }
        } else {
          console.log(" No stored auth data found");
        }
      } catch (error) {
        console.error(" Error restoring auth:", error);
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
    console.log(" Admin login attempt");

    try {
      const response = await api.post(`/auth/admin/login`, {
        username,
        password,
      });

      console.log(" Login response received");

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

      // Persist to storage
      saveAuthData(access_token, userData, newSessionId);

      // Set axios default header
      api.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;

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
   */
  const loginWithToken = async (
    tempToken: string,
  ): Promise<{ usageInfo?: UsageInfo }> => {
    console.log("🎫 Temporary login attempt with token");

    try {
      const response = await api.post(`/auth/temporary/login`, {
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

      // Persist to storage
      saveAuthData(access_token, userData, newSessionId);

      // Set axios default header
      api.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;

      console.log("✅ Temporary login successful:", {
        username: userData.username,
        role: userData.role,
        usageInfo: usageInfo || "No usage info",
      });

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
    console.log("🚪 Logging out...");

    try {
      if (sessionId && token) {
        await api.post(`/auth/logout`).catch((err) => {
          console.warn(
            "⚠️ Logout API call failed:",
            err.response?.data || err.message,
          );
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
        getLoginPath,
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
