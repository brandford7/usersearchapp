// src/components/AdminPanel.tsx
import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { UserPlus, Copy, Clock, CheckCircle } from "lucide-react";
import axios from "axios";

const API_URL = "https://usersearchapp.onrender.com/api/auth";

export default function AdminPanel() {
  const { isAdmin, token } = useAuth();
  const [username, setUsername] = useState("");
  const [expiresInHours, setExpiresInHours] = useState(24);
  const [generatedLink, setGeneratedLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  if (!isAdmin) {
    return null;
  }

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setGeneratedLink("");
    setLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/temporary/generate`,
        {
          username,
          expiresInHours: parseInt(expiresInHours.toString()),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // Build URL on frontend instead of using backend's loginUrl
      const temporaryToken = response.data.token;
      const frontendUrl = window.location.origin;
      const loginUrl = `${frontendUrl}/${username}/temporary-login?token=${temporaryToken}`;

      setGeneratedLink(loginUrl);
      setUsername(""); // Clear form
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
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-gray-900 p-4 sm:p-6 rounded-xl border border-gray-800 shadow-lg mb-6">
      <div className="flex items-center gap-2 mb-4 sm:mb-6">
        <UserPlus className="w-5 h-5 text-indigo-500 shrink-0" />
        <h2 className="text-base sm:text-lg font-semibold text-white">
          Generate Temporary Access
        </h2>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-900/30 border border-red-800 text-red-200 rounded-lg text-xs sm:text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleGenerate} className="space-y-4">
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

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 sm:py-3 text-indigo-600 hover:bg-indigo-700 disabled:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50 font-medium rounded-lg transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
        >
          <Clock className="w-4 h-4 shrink-0" />
          <span>
            {loading ? "Generating..." : "Generate Temporary Access Link"}
          </span>
        </button>
      </form>

      {generatedLink && (
        <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-green-900/20 border border-green-800 rounded-lg">
          <div className="flex items-center gap-2 mb-2 sm:mb-3">
            <CheckCircle className="w-4 sm:w-5 h-4 sm:h-5 text-green-400 shrink-0" />
            <h3 className="font-semibold text-green-400 text-sm sm:text-base">
              Link Generated!
            </h3>
          </div>

          <div className="space-y-2">
            {/* Link display - mobile friendly */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                type="text"
                value={generatedLink}
                readOnly
                className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-xs sm:text-sm text-blue-400 font-mono overflow-x-auto"
              />
              <button
                onClick={handleCopy}
                className="px-4 py-2 text-indigo-600 hover:bg-indigo-70 rounded-lg transition-colors flex items-center justify-center gap-2 whitespace-nowrap text-sm"
              >
                {copied ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            {/* Test link button */}
            <a
              href={generatedLink}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-xs sm:text-sm"
            >
              🔗 Test Link (Open in New Tab)
            </a>
          </div>

          <div className="mt-3 space-y-1">
            <p className="text-xs text-gray-400">
              ⏱️ This link will expire in {expiresInHours} hour
              {expiresInHours !== 1 ? "s" : ""} and can only be used once.
            </p>
            <p className="text-xs text-gray-400">
              📧 Send this link to the user via email or messaging app.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
