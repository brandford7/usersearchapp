// src/components/Header.tsx
import { useAuth } from "../contexts/AuthContext";
import { LogOut, User, Search } from "lucide-react";

export default function Header() {
  const { user, logout, isAdmin } = useAuth();

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-2 text-xl font-semibold text-white">
        <Search className="w-5 h-5 text-indigo-500" />
        <h1>Lookup SSN</h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm">
          <User className="w-4 h-4 text-gray-400" />
          <span className="text-gray-300">{user?.username}</span>
          {isAdmin && (
            <span className="px-2 py-1 bg-indigo-600 text-white text-xs rounded">
              Admin
            </span>
          )}
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </div>
  );
}
