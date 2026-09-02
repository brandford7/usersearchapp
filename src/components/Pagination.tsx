import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  totalPages: number | null; // null only while the very first request is loading
  // true when totalItems/totalPages hit the backend's count cap — the real
  // total is at least this many, possibly far more. Render both as "N+".
  totalCapped: boolean;
  hasMore: boolean;
  hasPrevious: boolean;
  isLoading: boolean;
  onPageChange: (page: number) => void;
}

// Windowed page list: first, last, current ± siblingCount, with "…" gaps.
// Keeps the button bar short even when totalPages is huge, so a click never
// jumps further than a couple of pages from where the user already is.
function getPageNumbers(
  current: number,
  total: number,
  siblingCount = 1,
): (number | "…")[] {
  const totalSlots = siblingCount * 2 + 5; // first + last + current + 2*siblings + 2 possible ellipses
  if (total <= totalSlots) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const left = Math.max(current - siblingCount, 1);
  const right = Math.min(current + siblingCount, total);
  const showLeftEllipsis = left > 2;
  const showRightEllipsis = right < total - 1;

  const pages: (number | "…")[] = [1];
  if (showLeftEllipsis) pages.push("…");
  for (let i = left; i <= right; i++) {
    if (i !== 1 && i !== total) pages.push(i);
  }
  if (showRightEllipsis) pages.push("…");
  if (total > 1) pages.push(total);
  return pages;
}

export default function Pagination({
  currentPage,
  totalItems,
  totalPages,
  totalCapped,
  hasMore,
  hasPrevious,
  isLoading,
  onPageChange,
}: PaginationProps) {
  const pageNumbers = totalPages ? getPageNumbers(currentPage, totalPages) : [];
  const plus = totalCapped ? "+" : "";

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
      <div className="flex flex-col">
        <span className="text-sm text-gray-400">
          {isLoading ? "Searching..." : `Showing ${totalItems}${plus} results`}
        </span>
        <span className="text-xs text-gray-500">
          Page {currentPage}
          {totalPages != null ? ` of ${totalPages}${plus}` : ""}
        </span>
        {totalCapped && (
          <span className="text-xs text-amber-500 mt-0.5">
            Narrow your search for more precise results
          </span>
        )}
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPrevious || isLoading}
          className={`p-1 bg-gray-800 rounded ${!hasPrevious ? "opacity-30" : "hover:bg-gray-700"}`}
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {pageNumbers.map((p, i) =>
          p === "…" ? (
            <span
              key={`ellipsis-${i}`}
              className="px-2 text-xs text-gray-600 select-none"
            >
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              disabled={isLoading}
              className={`min-w-[28px] px-2 py-1 rounded text-sm font-bold transition-colors ${
                p === currentPage
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              {p}
            </button>
          ),
        )}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasMore || isLoading}
          className={`p-1 bg-gray-800 rounded ${!hasMore ? "opacity-30" : "hover:bg-gray-700"}`}
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
