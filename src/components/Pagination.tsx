import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  totalPages: number; // Added this
  itemsPerPage: number;
  isLoading: boolean;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalItems,
  totalPages,
  isLoading,
  onPageChange,
}: PaginationProps) {
  // Logic is now much simpler and more accurate
  const canGoBack = currentPage > 1;
  const canGoForward = currentPage < totalPages;

  return (
    <div className="flex justify-between items-center mb-4">
      <div className="flex flex-col">
        <span className="text-sm text-gray-400">
          {isLoading
            ? "Searching..."
            : `Showing ${totalItems} results`}
        </span>
        <span className="text-xs text-gray-500">
          Page {currentPage} of {totalPages}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!canGoBack || isLoading}
          className={`p-1 bg-gray-800 rounded ${!canGoBack ? "opacity-30" : "hover:bg-gray-700"}`}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <span className="px-3 py-1 bg-indigo-600 text-white rounded text-sm font-bold">
          {currentPage}
        </span>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!canGoForward || isLoading}
          className={`p-1 bg-gray-800 rounded ${!canGoForward ? "opacity-30" : "hover:bg-gray-700"}`}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
