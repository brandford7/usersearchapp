
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  isLoading: boolean;
}

export default function Pagination({
  currentPage,
  totalItems,
  isLoading,
}: PaginationProps) {
  return (
    <div className="flex justify-between items-center mb-4">
      <span className="text-sm text-gray-400">
        {isLoading
          ? "Searching..."
          : totalItems > 0
            ? `Showing 1 of ${totalItems}`
            : "Ready to search"}
      </span>

      <div className="flex items-center gap-2">
        <button
          title="left button"
          disabled
          className="p-1 bg-gray-800 rounded text-gray-600 cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="px-3 py-1 bg-indigo-600 text-white rounded text-sm font-bold shadow-md shadow-indigo-900/20">
          {currentPage}
        </span>
        <button
          title="right button"
          className="p-1 bg-gray-800 rounded text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
