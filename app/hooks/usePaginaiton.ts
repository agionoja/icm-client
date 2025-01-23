import { useFetcher, useNavigation, useSearchParams } from "react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import type { PaginationMetadata } from "icm-shared";
import { useStorageCleared } from "~/lib/cache";

interface PaginationPage {
  number: number;
  type: "edge" | "middle";
}

export function usePagination({
  metadata,
  maxVisiblePages = 5,
}: {
  metadata: PaginationMetadata;
  maxVisiblePages?: number;
}) {
  const storageClearCount = useStorageCleared();
  const { state } = useNavigation();
  const [searchParams, setSearchParams] = useSearchParams();
  const fetcher = useFetcher();
  const [prefetchedPages, setPrefetchedPages] = useState<Set<number>>(
    new Set(),
  );
  const lastKeyPressTime = useRef<number>(0);
  const keyPressThrottle = 200;
  const isPrefetching = useRef(false);

  const isLoading = state !== "idle";

  useEffect(() => {
    setPrefetchedPages(new Set());
  }, [storageClearCount]); // Reset when storage clears

  const getVisiblePages = useCallback(() => {
    const currentPage = metadata.currentPage;
    const totalPages = metadata.pageCount;
    const pages: PaginationPage[] = [];

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

  const prefetchPage = useCallback(
    (page: number) => {
      if (
        page === metadata.currentPage ||
        prefetchedPages.has(page) ||
        page < 1 ||
        page > metadata.pageCount ||
        isPrefetching.current
      ) {
        return;
      }

      isPrefetching.current = true;

      const newParams = new URLSearchParams(searchParams);
      newParams.set("page", String(page));

      console.log(`Prefetching page: ${page}`); // Debugging

      fetcher.load(`?${newParams.toString()}`).finally(() => {
        isPrefetching.current = false;
      });

      setPrefetchedPages((prev) => new Set(prev).add(page));
    },
    [
      fetcher,
      searchParams,
      metadata.currentPage,
      metadata.pageCount,
      prefetchedPages,
    ],
  );

  const prefetchAdjacentPages = useCallback(() => {
    const currentPage = metadata.currentPage;

    // Prefetch next and previous pages
    if (metadata.next) {
      prefetchPage(metadata.next.page);
    }
    if (metadata.previous) {
      prefetchPage(metadata.previous.page);
    }

    // Prefetch visible pages within 2 steps of current page
    requestAnimationFrame(() => {
      getVisiblePages().forEach((page) => {
        if (Math.abs(page.number - currentPage) <= 2) {
          prefetchPage(page.number);
        }
      });
    });
  }, [metadata, prefetchPage, getVisiblePages]);

  const handlePageChange = useCallback(
    (page: number) => {
      if (page === metadata.currentPage || isLoading) {
        return;
      }

      const newParams = new URLSearchParams(searchParams);
      newParams.set("page", String(page));
      setSearchParams(newParams);

      // Do not clear prefetched pages on navigation
      // setPrefetchedPages(new Set());
    },
    [metadata.currentPage, isLoading, searchParams, setSearchParams],
  );

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        isLoading
      ) {
        return;
      }

      const now = Date.now();
      if (now - lastKeyPressTime.current < keyPressThrottle) {
        event.preventDefault();
        return;
      }

      if (event.key === "ArrowLeft" && metadata.previous) {
        lastKeyPressTime.current = now;
        handlePageChange(metadata.previous.page);
      } else if (event.key === "ArrowRight" && metadata.next) {
        lastKeyPressTime.current = now;
        handlePageChange(metadata.next.page);
      }
    };

    const handleKeyUp = () => {
      lastKeyPressTime.current = 0;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [metadata.previous, metadata.next, handlePageChange, isLoading]);

  // Prefetch adjacent pages whenever the current page changes or navigation state becomes idle
  useEffect(() => {
    if (!isLoading) {
      prefetchAdjacentPages();
    }
  }, [metadata.currentPage, isLoading, prefetchAdjacentPages]);

  return {
    isLoading,
    visiblePages: getVisiblePages(),
    handlePageChange,
    prefetchPage,
    prefetchedPages,
  };
}
