import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  totalPages: number | null; // null until the first page's count is known
  hasMore: boolean;
  hasPrevious: boolean;
  isLoading: boolean;
  onNext: () => void;
  onPrev: () => void;
}

export default function Pagination({
  currentPage,
  totalItems,
  totalPages,
  hasMore,
  hasPrevious,
  isLoading,
  onNext,
  onPrev,
}: PaginationProps) {
  return (
    <div className="flex justify-between items-center mb-4">
      <div className="flex flex-col">
        <span className="text-sm text-gray-400">
          {isLoading ? "Searching..." : `Showing ${totalItems} results`}
        </span>
        <span className="text-xs text-gray-500">
          Page {currentPage}
          {totalPages != null ? ` of ${totalPages}` : ""}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onPrev}
          disabled={!hasPrevious || isLoading}
          className={`p-1 bg-gray-800 rounded ${!hasPrevious ? "opacity-30" : "hover:bg-gray-700"}`}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <span className="px-3 py-1 bg-indigo-600 text-white rounded text-sm font-bold">
          {currentPage}
        </span>

        <button
          onClick={onNext}
          disabled={!hasMore || isLoading}
          className={`p-1 bg-gray-800 rounded ${!hasMore ? "opacity-30" : "hover:bg-gray-700"}`}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
