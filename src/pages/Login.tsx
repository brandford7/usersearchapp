// src/pages/Login.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { Lock, AlertCircle } from "lucide-react";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      console.log("Attempting login...");
      await login(username, password);
      console.log("Login successful!");
      navigate("/search");
    } catch (err: any) {
      console.error("Login error:", err);
      console.error("Error response:", err.response);

      if (err.response) {
        setError(
          err.response.data?.message ||
            "Login failed. Please check your credentials.",
        );
      } else if (err.request) {
        setError(
          "Cannot connect to server. Please check if the backend is running.",
        );
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md">
        {/* Logo/Brand Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-indigo-600 rounded-full mb-4">
            <Lock className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">
            Admin Login
          </h1>
          <p className="text-sm sm:text-base text-gray-400">
            Sign in to access the dashboard
          </p>
        </div>

        {/* Login Form Card */}
        <div className="bg-gray-900/80 backdrop-blur-sm p-6 sm:p-8 rounded-2xl border border-gray-800 shadow-2xl">
          {error && (
            <div className="mb-6 p-3 sm:p-4 bg-red-900/30 border border-red-800 text-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span className="text-xs sm:text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                disabled={loading}
                className="w-full px-4 py-3 sm:py-3.5 bg-gray-800/50 border border-gray-700 rounded-lg text-white text-sm sm:text-base placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                required
                autoComplete="username"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                disabled={loading}
                className="w-full px-4 py-3 sm:py-3.5 bg-gray-800/50 border border-gray-700 rounded-lg text-white text-sm sm:text-base placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                required
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 sm:py-4 text-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50 font-semibold rounded-lg transition-all duration-200 text-sm sm:text-base shadow-lg hover:shadow-indigo-500/50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Logging in...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs sm:text-sm text-gray-500 mt-6 sm:mt-8">
          Protected by enterprise-grade security
        </p>
      </div>
    </div>
  );
}
