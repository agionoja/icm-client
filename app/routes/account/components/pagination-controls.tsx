import { Button } from "~/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PaginationMetadata } from "icm-shared";
import { usePagination } from "~/hooks/usePaginaiton";
import { useEffect } from "react";
import { cn } from "~/lib/utils";

export const PaginationControls = ({
  metadata,
  maxVisiblePages = 5,
}: {
  metadata: PaginationMetadata;
  maxVisiblePages?: number;
}) => {
  const { isLoading, visiblePages, handlePageChange, prefetchPage } =
    usePagination({
      metadata,
      maxVisiblePages,
    });

  // Focus management for better keyboard navigation
  useEffect(() => {
    const currentPageButton = document.querySelector(
      '[aria-current="page"]',
    ) as HTMLButtonElement | null;
    if (currentPageButton) {
      currentPageButton.focus({ preventScroll: true });
    }
  }, [metadata.currentPage]);

  return (
    <nav aria-label="Pagination" className="flex items-center space-x-1">
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8"
        disabled={!metadata.previous || isLoading}
        onClick={() =>
          metadata.previous && handlePageChange(metadata.previous.page)
        }
        onMouseEnter={() =>
          metadata.previous && prefetchPage(metadata.previous.page)
        }
        onFocus={() =>
          metadata.previous && prefetchPage(metadata.previous.page)
        }
        aria-label="Previous page"
        tabIndex={!metadata.previous ? -1 : 0}
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="sr-only">Previous page</span>
      </Button>

      {visiblePages.map((page, index) => (
        <Button
          key={index}
          disabled={isLoading}
          // disabled={isLoading || metadata.currentPage === page.number}
          variant={metadata.currentPage === page.number ? "default" : "ghost"}
          size="sm"
          className={cn(
            `h-8 px-3 text-sm font-medium tabular-nums disabled:opacity-100 md:px-3 ${
              page.type === "edge"
                ? "border-2 border-transparent hover:border-gray-200"
                : ""
            }`,
            `${metadata.currentPage === page.number ? "bg-sidebar" : ""}`,
          )}
          onClick={() => handlePageChange(page.number)}
          onMouseEnter={() => prefetchPage(page.number)}
          onFocus={() => prefetchPage(page.number)}
          aria-label={
            metadata.currentPage === page.number
              ? `Current page, page ${page.number}`
              : `Go to page ${page.number}`
          }
          aria-current={
            metadata.currentPage === page.number ? "page" : undefined
          }
          tabIndex={metadata.currentPage === page.number ? -1 : 0}
        >
          {page.number}
        </Button>
      ))}

      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8"
        disabled={!metadata.next || isLoading}
        onClick={() => metadata.next && handlePageChange(metadata.next.page)}
        onMouseEnter={() => metadata.next && prefetchPage(metadata.next.page)}
        onFocus={() => metadata.next && prefetchPage(metadata.next.page)}
        aria-label="Next page"
        tabIndex={!metadata.next ? -1 : 0}
      >
        <ChevronRight className="h-4 w-4" />
        <span className="sr-only">Next page</span>
      </Button>
    </nav>
  );
};
