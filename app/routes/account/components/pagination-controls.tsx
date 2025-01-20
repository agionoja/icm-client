// import type { PaginationMetadata } from "icm-shared";
// import { useFetcher, useNavigation, useSearchParams } from "react-router";
// import { useCallback, useEffect } from "react";
// import { Button } from "~/components/ui/button";
// import { ChevronLeft, ChevronRight } from "lucide-react";
//
// export const PaginationControls = ({
//   metadata,
//   maxVisiblePages = 5,
// }: {
//   metadata: PaginationMetadata;
//   maxVisiblePages?: number;
// }) => {
//   const fetcher = useFetcher();
//   const { state } = useNavigation();
//   const [searchParams, setSearchParams] = useSearchParams();
//
//   const isLoading = state !== "idle";
//   const getVisiblePages = () => {
//     const currentPage = metadata.currentPage;
//     const totalPages = metadata.pageCount;
//     const pages = [];
//
//     // Always include first page
//     pages.push({ number: 1, type: "edge" });
//
//     // Calculate the range of pages to show
//     const start = Math.max(
//       2,
//       currentPage - Math.floor((maxVisiblePages - 2) / 2),
//     );
//     const end = Math.min(totalPages - 1, start + maxVisiblePages - 3);
//
//     // Add middle pages
//     for (let i = start; i <= end; i++) {
//       pages.push({ number: i, type: "middle" });
//     }
//
//     // Add last page if there is more than one page
//     if (totalPages > 1) {
//       pages.push({ number: totalPages, type: "edge" });
//     }
//
//     return pages;
//   };
//
//   const handlePageChange = useCallback(
//     (page: number) => {
//       const newParams = new URLSearchParams(searchParams);
//       newParams.set("page", String(page));
//       setSearchParams(newParams);
//     },
//     [searchParams, setSearchParams],
//   );
//
//
//
//   // Handle keyboard navigation
//   useEffect(() => {
//     const handleKeyDown = (event: KeyboardEvent) => {
//       if (
//         event.target instanceof HTMLInputElement ||
//         event.target instanceof HTMLTextAreaElement ||
//         isLoading
//       ) {
//         return; // Don't handle if user is typing in an input
//       }
//
//       if (event.key === "ArrowLeft" && metadata.previous) {
//         handlePageChange(metadata.previous.page);
//       } else if (event.key === "ArrowRight" && metadata.next) {
//         handlePageChange(metadata.next.page);
//       }
//     };
//
//     window.addEventListener("keydown", handleKeyDown);
//     return () => window.removeEventListener("keydown", handleKeyDown);
//   }, [metadata.previous, metadata.next, handlePageChange, isLoading]);
//
//   return (
//     <div className="flex items-center space-x-1">
//       <Button
//         variant="ghost"
//         size="sm"
//         className="h-8 w-8 p-0"
//         disabled={!metadata.previous || isLoading}
//         onClick={() =>
//           metadata.previous && handlePageChange(metadata.previous.page)
//         }
//       >
//         <ChevronLeft className="h-4 w-4" />
//       </Button>
//
//       {getVisiblePages().map((page, index) => (
//         <Button
//           key={index}
//           disabled={isLoading}
//           variant={metadata.currentPage === page.number ? "default" : "ghost"}
//           size="sm"
//           className={`h-8 px-3 text-sm font-medium tabular-nums ${
//             page.type === "edge"
//               ? "border-2 border-transparent hover:border-gray-200"
//               : ""
//           }`}
//           onClick={() => handlePageChange(page.number)}
//         >
//           {page.number}
//         </Button>
//       ))}
//
//       <Button
//         variant="ghost"
//         size="sm"
//         className="h-8 w-8 p-0"
//         disabled={!metadata.next || isLoading}
//         onClick={() => metadata.next && handlePageChange(metadata.next.page)}
//       >
//         <ChevronRight className="h-4 w-4" />
//       </Button>
//     </div>
//   );
// };

import { useNavigation, useSearchParams, useFetcher } from "react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "~/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PaginationMetadata } from "icm-shared";

export const PaginationControls = ({
  metadata,
  maxVisiblePages = 5,
}: {
  metadata: PaginationMetadata;
  maxVisiblePages?: number;
}) => {
  const { state } = useNavigation();
  const [searchParams, setSearchParams] = useSearchParams();
  const fetcher = useFetcher();
  const activeRequestsRef = useRef(new Map<number, AbortController>());
  const [prefetchedPages, setPrefetchedPages] = useState<Set<number>>(
    new Set(),
  );
  const currentPrefetchTimeout = useRef<NodeJS.Timeout>();

  const isLoading = state !== "idle";

  const getVisiblePages = useCallback(() => {
    const currentPage = metadata.currentPage;
    const totalPages = metadata.pageCount;
    const pages: Array<{ number: number; type: "edge" | "middle" }> = [];

    pages.push({ number: 1, type: "edge" });

    const start = Math.max(
      2,
      currentPage - Math.floor((maxVisiblePages - 2) / 2),
    );
    const end = Math.min(totalPages - 1, start + maxVisiblePages - 3);

    for (let i = start; i <= end; i++) {
      pages.push({ number: i, type: "middle" });
    }

    if (totalPages > 1) {
      pages.push({ number: totalPages, type: "edge" });
    }

    return pages;
  }, [metadata.currentPage, metadata.pageCount, maxVisiblePages]);

  const cleanupRequests = useCallback(() => {
    activeRequestsRef.current.forEach((controller) => {
      controller.abort();
    });
    activeRequestsRef.current.clear();

    if (currentPrefetchTimeout.current) {
      clearTimeout(currentPrefetchTimeout.current);
    }
  }, []);

  const prefetchPage = useCallback(
    (page: number) => {
      if (page === metadata.currentPage || prefetchedPages.has(page)) {
        return;
      }

      if (currentPrefetchTimeout.current) {
        clearTimeout(currentPrefetchTimeout.current);
      }

      currentPrefetchTimeout.current = setTimeout(() => {
        const controller = new AbortController();
        activeRequestsRef.current.set(page, controller);

        const newParams = new URLSearchParams(searchParams);
        newParams.set("page", String(page));

        // Instead of using signal directly, we'll handle the abortion manually
        const fetchPromise = fetcher.load(`?${newParams.toString()}`);

        // Set up abort handling
        controller.signal.addEventListener("abort", () => {
          // The fetch will be automatically aborted when the controller is aborted
          activeRequestsRef.current.delete(page);
        });

        // Handle successful fetch
        Promise.resolve(fetchPromise).then(() => {
          if (!controller.signal.aborted) {
            setPrefetchedPages((prev) => new Set(prev).add(page));
            activeRequestsRef.current.delete(page);
          }
        });
      }, 100);
    },
    [fetcher, searchParams, metadata.currentPage, prefetchedPages],
  );

  const prefetchAdjacentPages = useCallback(() => {
    if (metadata.next) {
      prefetchPage(metadata.next.page);
    }
    if (metadata.previous) {
      prefetchPage(metadata.previous.page);
    }

    // Use requestAnimationFrame for the rest
    requestAnimationFrame(() => {
      getVisiblePages().forEach((page) => {
        if (Math.abs(page.number - metadata.currentPage) <= 2) {
          prefetchPage(page.number);
        }
      });
    });
  }, [metadata, prefetchPage, getVisiblePages]);

  const handlePageChange = useCallback(
    (page: number) => {
      cleanupRequests();

      const newParams = new URLSearchParams(searchParams);
      newParams.set("page", String(page));
      setSearchParams(newParams);

      setPrefetchedPages(new Set());

      setTimeout(() => {
        prefetchAdjacentPages();
      }, 150);
    },
    [searchParams, setSearchParams, cleanupRequests, prefetchAdjacentPages],
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        isLoading
      ) {
        return;
      }

      if (event.key === "ArrowLeft" && metadata.previous) {
        handlePageChange(metadata.previous.page);
      } else if (event.key === "ArrowRight" && metadata.next) {
        handlePageChange(metadata.next.page);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      cleanupRequests();
    };
  }, [
    metadata.previous,
    metadata.next,
    handlePageChange,
    isLoading,
    cleanupRequests,
  ]);

  useEffect(() => {
    const initTimeout = setTimeout(prefetchAdjacentPages, 200);
    return () => {
      clearTimeout(initTimeout);
      cleanupRequests();
    };
  }, [prefetchAdjacentPages, cleanupRequests]);

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
        onMouseEnter={() =>
          metadata.previous && prefetchPage(metadata.previous.page)
        }
        onFocus={() =>
          metadata.previous && prefetchPage(metadata.previous.page)
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
          onMouseEnter={() => prefetchPage(page.number)}
          onFocus={() => prefetchPage(page.number)}
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
        onMouseEnter={() => metadata.next && prefetchPage(metadata.next.page)}
        onFocus={() => metadata.next && prefetchPage(metadata.next.page)}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};
