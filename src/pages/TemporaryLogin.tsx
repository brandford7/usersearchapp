import React, { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { Key, Loader2, AlertCircle, Lock } from "lucide-react";

export default function TemporaryLogin() {
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [usageInfo, setUsageInfo] = useState<any>(null);
  const { loginWithToken } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      console.log("🎫 Attempting temporary login with token");
      const response = await loginWithToken(token.trim());
      console.log("✅ Login successful!", response);

      if (response?.usageInfo) {
        setUsageInfo(response.usageInfo);
      }

      // Small delay to show success state
      setTimeout(() => {
        navigate("/search");
      }, 1500);
    } catch (err: any) {
      console.error("❌ Temporary login error:", err);

      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Invalid or expired token";

      if (errorMessage.includes("already been used")) {
        setError(
          "This token has reached its maximum number of uses (2). Please request a new token from your administrator.",
        );
      } else if (errorMessage.includes("expired")) {
        setError(
          "This token has expired. Please request a new token from your administrator.",
        );
      } else if (errorMessage.includes("Invalid token")) {
        setError(
          "Invalid access token. Please check the token or request a new one.",
        );
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-linear-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md">
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-indigo-600 rounded-full mb-4">
            <Key className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">
            Temporary Access
          </h1>
          <p className="text-sm sm:text-base text-gray-400">
            Enter your access token to continue
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

          {usageInfo && (
            <div className="mb-6 p-3 sm:p-4 bg-green-900/30 border border-green-800 text-green-200 rounded-lg">
              <p className="text-xs sm:text-sm font-semibold mb-1">
                ✅ Access Granted!
              </p>
              <p className="text-xs text-green-300">{usageInfo.message}</p>
              <p className="text-xs text-green-400 mt-1">
                Redirecting to dashboard...
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                Access Token
              </label>
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Enter your access token"
                disabled={loading}
                className="w-full px-4 py-3 sm:py-3.5 bg-gray-800/50 border border-gray-700 rounded-lg text-white text-sm sm:text-base placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed font-mono"
                required
                autoFocus
              />
              <p className="mt-2 text-xs text-gray-500">
                Enter the token provided by your administrator
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !token.trim()}
              className="w-full py-3 sm:py-4 bg-indigo-600 hover:bg-indigo-700 text-white active:bg-indigo-800 disabled:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50 font-semibold rounded-lg transition-all duration-200 text-sm sm:text-base shadow-lg hover:shadow-indigo-500/50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <Key className="w-5 h-5" />
                  <span>Access System</span>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-gray-900 text-gray-500">OR</span>
            </div>
          </div>

          {/* Admin Login Link */}
          <div className="text-center">
            <a
              href="/login"
              className="inline-flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              <Lock className="w-4 h-4" />
              <span>Login as Administrator</span>
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 sm:mt-8 text-center space-y-2">
          <p className="text-xs text-gray-500">
            Need help? Contact your system administrator
          </p>
          <p className="text-xs text-gray-600">
            Tokens expire after use or time limit
          </p>
        </div>
      </div>
    </div>
  );
}
