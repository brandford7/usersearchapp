import React from "react";
import { User, Database } from "lucide-react";
import { useStats } from "../../hooks/useStats";

export function Header() {
  const { data: stats } = useStats();

  return (
    <header className="bg-white rounded-lg shadow-md mb-4 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <User className="text-blue-600" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              People Database Search
            </h1>
            <p className="text-sm text-gray-600">
              Search through millions of records instantly
            </p>
          </div>
        </div>

        {stats && (
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg">
              <Database size={18} className="text-gray-600" />
              <div className="text-sm">
                <p className="text-gray-500">Total Records</p>
                <p className="font-semibold text-gray-900">
                  {stats.totalRecords?.toLocaleString() || "0"}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
