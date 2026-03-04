// src/components/AdminPanel.tsx
import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Copy, Clock, CheckCircle, Key } from "lucide-react";
import api from "../api/axios";

export default function AdminPanel() {
  const { isAdmin } = useAuth();
  const [username, setUsername] = useState("");
  const [expiresInHours, setExpiresInHours] = useState(24);
  const [generatedToken, setGeneratedToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  if (!isAdmin) {
    return null;
  }

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setGeneratedToken("");
    setLoading(true);

    try {
      const response = await api.post("/auth/temporary/generate", {
        username,
        expiresInHours: parseInt(expiresInHours.toString()),
      });

      // Just get the token - no URL building
      const accessToken = response.data.token;

      setGeneratedToken(accessToken);
      setUsername("");
    } catch (err: any) {
      console.error("Generate error:", err);
      setError(
        err.response?.data?.message || "Failed to generate temporary access",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-gray-900 p-4 sm:p-6 rounded-xl border border-gray-800 shadow-lg mb-6">
      <div className="flex items-center gap-2 mb-4 sm:mb-6">
        <Key className="w-5 h-5 text-indigo-500 shrink-0" />
        <h2 className="text-base sm:text-lg font-semibold text-white">
          Generate Access Token
        </h2>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-900/30 border border-red-800 text-red-200 rounded-lg text-xs sm:text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleGenerate} className="space-y-4">
        {/* Inputs Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
              Username/Email
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="user@example.com"
              disabled={loading}
              className="w-full px-3 sm:px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              required
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
              Valid for (hours)
            </label>
            <input
              type="number"
              value={expiresInHours}
              onChange={(e) => setExpiresInHours(parseInt(e.target.value))}
              min="1"
              max="168"
              disabled={loading}
              className="w-full px-3 sm:px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              required
            />
          </div>
        </div>

        {/* Button & Generated Token Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 sm:py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <Clock className="w-4 h-4 shrink-0" />
            <span>{loading ? "Generating..." : "Generate Access Token"}</span>
          </button>

          {generatedToken && (
            <div className="p-3 sm:p-4 bg-green-900/20 border border-green-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2 sm:mb-3">
                <CheckCircle className="w-4 sm:w-5 h-4 sm:h-5 text-green-400 shrink-0" />
                <h3 className="font-semibold text-green-400 text-sm sm:text-base">
                  Token Generated!
                </h3>
              </div>

              <div className="space-y-3">
                {/* Token Display */}
                <div className="bg-gray-950 p-3 rounded-lg border border-gray-700">
                  <p className="text-xs text-gray-400 mb-2">Access Token:</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-sm sm:text-base text-indigo-300 font-mono break-all">
                      {generatedToken}
                    </code>
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap shrink-0"
                    >
                      {copied ? (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-sm">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span className="text-sm">Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Instructions */}
                <div className="bg-gray-800/50 rounded-lg p-3 space-y-2">
                  <p className="text-xs sm:text-sm text-gray-300 font-semibold">
                    📋 Instructions for User:
                  </p>
                  <ol className="text-xs text-gray-400 space-y-1 list-decimal list-inside">
                    <li>Go to the temporary login page</li>
                    <li>Enter this token</li>
                    <li>Click "Access System"</li>
                  </ol>
                </div>
              </div>

              <div className="mt-3 space-y-1">
                <p className="text-xs text-gray-400">
                  ⏱️ This token will expire in {expiresInHours} hour
                  {expiresInHours !== 1 ? "s" : ""} and can be used up to 2
                  times.
                </p>
                <p className="text-xs text-yellow-400">
                  ⚠️ Share this token securely with the user (email, message,
                  etc.)
                </p>
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
