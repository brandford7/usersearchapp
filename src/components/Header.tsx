import  { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { LogOut, User, Search, Shield, Loader2 } from "lucide-react";
import { useNavigate } from "react-router";

export default function Header() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return; // Prevent multiple clicks

    setIsLoggingOut(true);

    try {
      console.log("Logging out user:", user?.username, "Role:", user?.role);

      await logout();

      // Redirect based on user role
      const redirectPath = isAdmin ? "/login" : "/temporary-login";
      console.log("Redirecting to:", redirectPath);

      navigate(redirectPath);
    } catch (error) {
      console.error("Logout error:", error);
      // Still navigate even if logout API fails
      const redirectPath = isAdmin ? "/login" : "/temporary-login";
      navigate(redirectPath);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-2 text-xl font-semibold text-white">
        <Search className="w-5 h-5 text-indigo-500" />
        <h1>Lookup SSN</h1>
      </div>

      <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
        <div className="flex items-center gap-2 text-sm flex-1 sm:flex-initial">
          <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <span className="text-gray-300 truncate">{user?.username}</span>
          {isAdmin ? (
            <span className="px-2 py-1 bg-indigo-600 text-white text-xs rounded flex items-center gap-1 flex-shrink-0">
              <Shield className="w-3 h-3" />
              Admin
            </span>
          ) : (
            <span className="px-2 py-1 bg-yellow-600 text-white text-xs rounded flex-shrink-0">
              Temporary
            </span>
          )}
        </div>

        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.5rem 1rem",
            backgroundColor: isLoggingOut ? "#4b5563" : "#1f2937",
            color: "#d1d5db",
            borderRadius: "0.5rem",
            border: "none",
            cursor: isLoggingOut ? "not-allowed" : "pointer",
            fontSize: "0.875rem",
            whiteSpace: "nowrap",
            opacity: isLoggingOut ? 0.6 : 1,
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            if (!isLoggingOut) {
              e.currentTarget.style.backgroundColor = "#374151";
            }
          }}
          onMouseLeave={(e) => {
            if (!isLoggingOut) {
              e.currentTarget.style.backgroundColor = "#1f2937";
            }
          }}
        >
          {isLoggingOut ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="hidden sm:inline">Logging out...</span>
            </>
          ) : (
            <>
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
