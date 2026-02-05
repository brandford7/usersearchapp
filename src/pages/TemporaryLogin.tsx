// src/pages/TemporaryLogin.tsx
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, useParams } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { Clock, User, CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function TemporaryLogin() {
  const [searchParams] = useSearchParams();
  const { username } = useParams();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const { loginWithToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setError("No token provided");
      setLoading(false);
      return;
    }

    const login = async () => {
      try {
        await loginWithToken(token);
        // Small delay to show success state
        setTimeout(() => {
          navigate("/search");
        }, 1000);
      } catch (err: any) {
        setError(err.response?.data?.message || "Invalid or expired token");
      } finally {
        setLoading(false);
      }
    };

    login();
  }, [searchParams, loginWithToken, navigate]);

  return (
    <div className="min-h-screen w-full bg-linear-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md">
        <div className="bg-gray-900/80 backdrop-blur-sm p-6 sm:p-8 lg:p-10 rounded-2xl border border-gray-800 shadow-2xl text-center">
          {loading ? (
            <>
              {/* Loading State */}
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-indigo-600/20 rounded-full mb-4 sm:mb-6">
                <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-500 animate-spin" />
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-3 sm:mb-4">
                Verifying Access
              </h1>
              {username && (
                <div className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-800/50 rounded-lg mb-4">
                  <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  <span className="text-sm sm:text-base text-gray-300">
                    {decodeURIComponent(username)}
                  </span>
                </div>
              )}
              <p className="text-sm sm:text-base text-gray-400">
                Please wait while we verify your credentials...
              </p>

              {/* Progress indicator */}
              <div className="mt-6 sm:mt-8">
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full animate-pulse"
                    style={{ width: "60%" }}
                  ></div>
                </div>
              </div>
            </>
          ) : error ? (
            <>
              {/* Error State */}
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-red-600/20 rounded-full mb-4 sm:mb-6">
                <XCircle className="w-8 h-8 sm:w-10 sm:h-10 text-red-500" />
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-red-400 mb-3 sm:mb-4">
                Access Denied
              </h1>
              <p className="text-sm sm:text-base text-gray-400 mb-6 sm:mb-8 px-4">
                {error}
              </p>
              <div className="space-y-3">
                <a
                  href="/login"
                  className="block px-6 py-3 sm:py-4 text-indigo-600 hover:bg-indigo-700 font-semibold rounded-lg transition-all text-sm sm:text-base shadow-lg hover:shadow-indigo-500/50"
                >
                  Go to Admin Login
                </a>
                <p className="text-xs sm:text-sm text-gray-500">
                  Need help? Contact your administrator
                </p>
              </div>
            </>
          ) : (
            <>
              {/* Success State */}
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-green-600/20 rounded-full mb-4 sm:mb-6">
                <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-green-500" />
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-400 mb-3 sm:mb-4">
                Access Granted!
              </h1>
              <p className="text-sm sm:text-base text-gray-400">
                Redirecting you to the dashboard...
              </p>
            </>
          )}
        </div>

        {/* Footer info */}
        <div className="mt-6 sm:mt-8 text-center space-y-2">
          <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>Temporary access link</span>
          </div>
          <p className="text-xs text-gray-600">
            This link can only be used once and will expire after use
          </p>
        </div>
      </div>
    </div>
  );
}
