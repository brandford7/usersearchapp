import { useState, type FormEvent } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

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
  pageSize?: number;
  onPageChange: (page: number) => void;
}

type PageItem = number | "left-gap" | "right-gap";

// How far a click on a "…" gap jumps.
const GAP_JUMP = 5;

// Windowed page list: first, last, current ± siblingCount, with gaps.
// Keeps the button bar short even when totalPages is huge; the gaps are
// clickable, so a long run of pages is still crossable a chunk at a time.
function getPageNumbers(
  current: number,
  total: number,
  siblingCount = 1,
): PageItem[] {
  const totalSlots = siblingCount * 2 + 5; // first + last + current + 2*siblings + 2 possible gaps
  if (total <= totalSlots) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const left = Math.max(current - siblingCount, 1);
  const right = Math.min(current + siblingCount, total);
  const showLeftGap = left > 2;
  const showRightGap = right < total - 1;

  const pages: PageItem[] = [1];
  if (showLeftGap) pages.push("left-gap");
  for (let i = left; i <= right; i++) {
    if (i !== 1 && i !== total) pages.push(i);
  }
  if (showRightGap) pages.push("right-gap");
  if (total > 1) pages.push(total);
  return pages;
}

const iconButton =
  "flex items-center justify-center w-8 h-8 rounded bg-gray-800 text-gray-300 transition-colors disabled:opacity-30 disabled:cursor-not-allowed enabled:hover:bg-gray-700";

export default function Pagination({
  currentPage,
  totalItems,
  totalPages,
  totalCapped,
  hasMore,
  hasPrevious,
  isLoading,
  pageSize = 100,
  onPageChange,
}: PaginationProps) {
  const [jumpValue, setJumpValue] = useState("");

  const plus = totalCapped ? "+" : "";
  // Desktop gets a wider window than mobile, so fewer clicks are needed to
  // land on a nearby page without the bar overflowing on a phone.
  const desktopPages = totalPages ? getPageNumbers(currentPage, totalPages, 2) : [];
  const mobilePages = totalPages ? getPageNumbers(currentPage, totalPages, 0) : [];
  // Only worth offering a jump box once the window actually hides pages.
  const showJump = totalPages != null && totalPages > 7;

  const goTo = (page: number) => {
    const lowerBounded = Math.max(page, 1);
    // Only clamp to totalPages when it's an exact total. When totalCapped,
    // totalPages is just where the count query stopped counting (see
    // people.service.ts's COUNT_CAP) — the real last page is unknown, so
    // don't block navigation past it; hasMore (from the real data fetch)
    // is what actually gates whether a further page exists.
    const clamped =
      totalPages != null && !totalCapped
        ? Math.min(lowerBounded, totalPages)
        : lowerBounded;
    if (clamped !== currentPage) onPageChange(clamped);
  };

  const handleJump = (e: FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(jumpValue, 10);
    if (Number.isNaN(parsed)) return;
    goTo(parsed);
    setJumpValue("");
  };

  const firstItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const lastItem = Math.min(currentPage * pageSize, totalItems);

  const renderPages = (pages: PageItem[]) =>
    pages.map((p) => {
      if (p === "left-gap" || p === "right-gap") {
        const target =
          p === "left-gap" ? currentPage - GAP_JUMP : currentPage + GAP_JUMP;
        return (
          <button
            key={p}
            type="button"
            onClick={() => goTo(target)}
            disabled={isLoading}
            className="group flex items-center justify-center w-8 h-8 rounded text-xs text-gray-500 transition-colors hover:bg-gray-700 hover:text-gray-200 disabled:cursor-not-allowed"
            title={`Jump ${p === "left-gap" ? "back" : "forward"} ${GAP_JUMP} pages`}
            aria-label={`Jump ${p === "left-gap" ? "back" : "forward"} ${GAP_JUMP} pages`}
          >
            <span className="group-hover:hidden">…</span>
            {p === "left-gap" ? (
              <ChevronsLeft className="hidden w-4 h-4 group-hover:block" />
            ) : (
              <ChevronsRight className="hidden w-4 h-4 group-hover:block" />
            )}
          </button>
        );
      }

      const isCurrent = p === currentPage;
      return (
        <button
          key={p}
          type="button"
          onClick={() => goTo(p)}
          disabled={isLoading}
          aria-current={isCurrent ? "page" : undefined}
          aria-label={`Page ${p}`}
          className={cn(
            "min-w-8 h-8 px-2 rounded text-sm font-bold transition-colors disabled:cursor-not-allowed",
            isCurrent
              ? "bg-indigo-600 text-white"
              : "bg-gray-800 text-gray-300 hover:bg-gray-700",
          )}
        >
          {p === totalPages && totalCapped ? `${p}+` : p}
        </button>
      );
    });

  return (
    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 mb-4">
      <div className="flex flex-col">
        <span className="text-sm text-gray-400">
          {isLoading
            ? "Searching..."
            : totalItems === 0
              ? "No results"
              : `Showing ${firstItem.toLocaleString()}–${lastItem.toLocaleString()} of ${totalItems.toLocaleString()}${plus} results`}
        </span>
        <span className="text-xs text-gray-500">
          Page {currentPage.toLocaleString()}
          {totalPages != null ? ` of ${totalPages.toLocaleString()}${plus}` : ""}
        </span>
        {totalCapped && (
          <span className="text-xs text-amber-500 mt-0.5">
            Narrow your search for more precise results
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <nav
          className="flex items-center gap-1"
          aria-label="Pagination"
          onKeyDown={(e) => {
            if (isLoading) return;
            if (e.key === "ArrowLeft" && hasPrevious) goTo(currentPage - 1);
            if (e.key === "ArrowRight" && hasMore) goTo(currentPage + 1);
          }}
        >
          <button
            type="button"
            onClick={() => goTo(1)}
            disabled={!hasPrevious || isLoading}
            className={iconButton}
            aria-label="First page"
            title="First page"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => goTo(currentPage - 1)}
            disabled={!hasPrevious || isLoading}
            className={iconButton}
            aria-label="Previous page"
            title="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="hidden sm:flex items-center gap-1">
            {renderPages(desktopPages)}
          </div>
          <div className="flex sm:hidden items-center gap-1">
            {renderPages(mobilePages)}
          </div>

          <button
            type="button"
            onClick={() => goTo(currentPage + 1)}
            disabled={!hasMore || isLoading}
            className={iconButton}
            aria-label="Next page"
            title="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => totalPages && goTo(totalPages)}
            disabled={
              !hasMore ||
              isLoading ||
              totalPages == null ||
              // Once past a capped total, "last known page" is behind us —
              // jumping there would move backward, not forward.
              (totalCapped && currentPage >= totalPages)
            }
            className={iconButton}
            aria-label="Last page"
            title={totalCapped ? "Last known page" : "Last page"}
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </nav>

        {showJump && (
          <form onSubmit={handleJump} className="flex items-center gap-1">
            <label htmlFor="jump-to-page" className="text-xs text-gray-500">
              Go to
            </label>
            <input
              id="jump-to-page"
              type="number"
              inputMode="numeric"
              min={1}
              max={totalCapped ? undefined : (totalPages ?? undefined)}
              value={jumpValue}
              onChange={(e) => setJumpValue(e.target.value)}
              placeholder={String(currentPage)}
              disabled={isLoading}
              className="w-16 h-8 px-2 rounded bg-gray-800 border border-gray-700 text-sm text-gray-200 text-center focus:outline-none focus:border-indigo-500 disabled:opacity-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              aria-label={
                totalCapped
                  ? `Go to page, starting from 1`
                  : `Go to page, 1 to ${totalPages}`
              }
            />
            <button
              type="submit"
              disabled={isLoading || jumpValue.trim() === ""}
              className="h-8 px-3 rounded bg-gray-800 text-sm text-gray-300 transition-colors enabled:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Go
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
