"use client";

import { PAGE_SIZE } from "@/constants";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/use-translation";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

type TablePaginationProps = {
  currentPage: number;
  totalPages: number;
  totalCount?: number;
  onPageChange: (page: number) => void;
  entityLabel?: string;
};

export function TablePagination({
  currentPage,
  totalPages,
  totalCount,
  onPageChange,
  entityLabel,
}: TablePaginationProps) {
  const t = useTranslation();
  const p = t.pagination;

  const label = entityLabel ?? "records";

  const isEmpty = totalCount === 0;
  const from = isEmpty ? 0 : Math.min((currentPage - 1) * PAGE_SIZE + 1, totalCount ?? 1);
  const to   = isEmpty ? 0 : Math.min(currentPage * PAGE_SIZE, totalCount ?? PAGE_SIZE);

  const isFirst = currentPage === 1;
  const isLast  = currentPage >= totalPages;
  const showNav = !isEmpty && totalPages > 1;

  const pages = showNav ? getPageNumbers(currentPage, totalPages) : [];

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-2 py-3 border-t border-border/60 bg-card/40 rounded-b-xl">
      {/* Count info */}
      <p className="text-xs text-muted-foreground shrink-0">
        {isEmpty ? (
          <span className="italic">{p.noMatch.replace("{label}", label)}</span>
        ) : totalCount != null ? (
          <>
            {p.showing}{" "}
            <span className="font-semibold text-foreground tabular-nums">{from}</span>
            {" – "}
            <span className="font-semibold text-foreground tabular-nums">{to}</span>
            {" "}{p.of}{" "}
            <span className="font-semibold text-foreground tabular-nums">{totalCount}</span>
            {" "}{label}
          </>
        ) : (
          <>
            {p.page}{" "}
            <span className="font-semibold text-foreground">{currentPage}</span>
            {" "}{p.of}{" "}
            <span className="font-semibold text-foreground">{totalPages}</span>
          </>
        )}
      </p>

      {/* Navigation */}
      {showNav && (
        <nav className="flex items-center gap-1" aria-label="Pagination">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={isFirst}
            aria-label="Go to previous page"
            className={cn(
              "flex items-center gap-1 h-8 px-3 rounded-lg text-xs font-medium transition-all border",
              isFirst
                ? "opacity-40 cursor-not-allowed bg-muted text-muted-foreground border-border"
                : "bg-card text-foreground border-border hover:bg-muted hover:border-brand-blue/50 cursor-pointer",
            )}
          >
            <ChevronLeft className="size-3.5" />
            <span className="hidden sm:inline">{p.prev}</span>
          </button>

          <div className="flex items-center gap-1">
            {pages.map((page, i) =>
              page === "..." ? (
                <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-muted-foreground">
                  <MoreHorizontal className="size-3.5" />
                </span>
              ) : (
                <button
                  key={page}
                  onClick={() => onPageChange(page as number)}
                  aria-label={`Page ${page}`}
                  aria-current={currentPage === page ? "page" : undefined}
                  className={cn(
                    "w-8 h-8 rounded-lg text-xs font-semibold transition-all border cursor-pointer",
                    currentPage === page
                      ? "bg-gradient-primary text-white border-transparent shadow-sm"
                      : "bg-card text-foreground border-border hover:bg-muted hover:border-brand-blue/40",
                  )}
                >
                  {page}
                </button>
              ),
            )}
          </div>

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={isLast}
            aria-label="Go to next page"
            className={cn(
              "flex items-center gap-1 h-8 px-3 rounded-lg text-xs font-medium transition-all border",
              isLast
                ? "opacity-40 cursor-not-allowed bg-muted text-muted-foreground border-border"
                : "bg-card text-foreground border-border hover:bg-muted hover:border-brand-blue/50 cursor-pointer",
            )}
          >
            <span className="hidden sm:inline">{p.next}</span>
            <ChevronRight className="size-3.5" />
          </button>
        </nav>
      )}

      {!isEmpty && totalPages === 1 && (
        <span className="text-xs text-muted-foreground/60 italic">
          {p.allOnOnePage.replace("{label}", label)}
        </span>
      )}
    </div>
  );
}

function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "...")[] = [1];
  if (current > 3) pages.push("...");
  const start = Math.max(2, current - 1);
  const end   = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);
  if (current < total - 2) pages.push("...");
  pages.push(total);
  return pages;
}
