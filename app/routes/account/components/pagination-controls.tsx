import type { PaginationMetadata } from "icm-shared";
import { useNavigation, useSearchParams } from "react-router";
import { useCallback, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const PaginationControls = ({
  metadata,
  maxVisiblePages = 5,
}: {
  metadata: PaginationMetadata;
  maxVisiblePages?: number;
}) => {
  const { state } = useNavigation();
  const [searchParams, setSearchParams] = useSearchParams();

  const isLoading = state !== "idle";
  const getVisiblePages = () => {
    const currentPage = metadata.currentPage;
    const totalPages = metadata.pageCount;
    const pages = [];

    // Always include first page
    pages.push({ number: 1, type: "edge" });

    // Calculate the range of pages to show
    const start = Math.max(
      2,
      currentPage - Math.floor((maxVisiblePages - 2) / 2),
    );
    const end = Math.min(totalPages - 1, start + maxVisiblePages - 3);

    // Add middle pages
    for (let i = start; i <= end; i++) {
      pages.push({ number: i, type: "middle" });
    }

    // Add last page if there is more than one page
    if (totalPages > 1) {
      pages.push({ number: totalPages, type: "edge" });
    }

    return pages;
  };

  const handlePageChange = useCallback(
    (page: number) => {
      const newParams = new URLSearchParams(searchParams);
      newParams.set("page", String(page));
      setSearchParams(newParams);
    },
    [searchParams, setSearchParams],
  );

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return; // Don't handle if user is typing in an input
      }

      if (event.key === "ArrowLeft" && metadata.previous) {
        handlePageChange(metadata.previous.page);
      } else if (event.key === "ArrowRight" && metadata.next) {
        handlePageChange(metadata.next.page);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [metadata.previous, metadata.next, handlePageChange]);

  return (
    <div className="flex items-center space-x-1">
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        disabled={!metadata.previous || isLoading}
        onClick={() =>
          metadata.previous && handlePageChange(metadata.previous.page)
        }
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {getVisiblePages().map((page, index) => (
        <Button
          key={index}
          disabled={isLoading}
          variant={metadata.currentPage === page.number ? "default" : "ghost"}
          size="sm"
          className={`h-8 px-3 text-sm font-medium tabular-nums ${
            page.type === "edge"
              ? "border-2 border-transparent hover:border-gray-200"
              : ""
          }`}
          onClick={() => handlePageChange(page.number)}
        >
          {page.number}
        </Button>
      ))}

      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        disabled={!metadata.next || isLoading}
        onClick={() => metadata.next && handlePageChange(metadata.next.page)}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};
