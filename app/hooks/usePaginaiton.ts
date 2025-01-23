import {
  useFetcher,
  useLocation,
  useNavigation,
  useSearchParams,
} from "react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import type { PaginationMetadata } from "icm-shared";
import { constructKey, useStorageCleared } from "~/lib/cache";

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
  // Hook dependencies and state
  const location = useLocation();
  const { state } = useNavigation();
  const [searchParams, setSearchParams] = useSearchParams();
  const fetcher = useFetcher();
  const storageClearCount = useStorageCleared();

  // Prefetch tracking and throttling
  const [prefetchedKeys, setPrefetchedKeys] = useState<Set<string>>(new Set());
  const isPrefetching = useRef(false);
  const lastKeyPressTime = useRef<number>(0);
  const keyPressThrottle = 200;

  const isLoading = state !== "idle";

  // Cache invalidation and state synchronization
  useEffect(() => {
    /**
     * Handles cache mismatch between URL parameters and server metadata
     * - Invalidates stale cache entries
     * - Synchronizes URL with server state
     */
    const handleCacheState = () => {
      const urlPage = Number(searchParams.get("page") || "1");
      const serverPage = metadata.currentPage;

      if (urlPage === serverPage) return;

      console.warn(
        `Cache mismatch detected (URL: ${urlPage} vs Server: ${serverPage})`,
      );

      try {
        const currentKey = constructKey(location);
        localStorage.removeItem(currentKey);
        console.log("Invalidated cache for:", currentKey);

        // Update URL to match server state without creating history entry
        const newParams = new URLSearchParams(searchParams);
        newParams.set("page", serverPage.toString());
        setSearchParams(newParams, { replace: true });
      } catch (error) {
        console.error("Cache synchronization failed:", error);
      }
    };

    handleCacheState();
  }, [metadata.currentPage, searchParams, location, setSearchParams]);

  // Pagination UI calculations
  const getVisiblePages = useCallback(() => {
    const { currentPage, pageCount } = metadata;
    const pages: PaginationPage[] = [];

    // Always include first page
    pages.push({ number: 1, type: "edge" });

    // Calculate middle pages range
    const start = Math.max(
      2,
      currentPage - Math.floor((maxVisiblePages - 2) / 2),
    );
    const end = Math.min(pageCount - 1, start + maxVisiblePages - 3);

    // Add middle pages
    for (let i = start; i <= end; i++) {
      pages.push({ number: i, type: "middle" });
    }

    // Add last page if applicable
    if (pageCount > 1) {
      pages.push({ number: pageCount, type: "edge" });
    }

    return pages;
  }, [metadata.currentPage, metadata.pageCount, maxVisiblePages]);

  // Prefetch management
  const prefetchPage = useCallback(
    async (page: number) => {
      if (
        page === metadata.currentPage ||
        page < 1 ||
        page > metadata.pageCount ||
        isPrefetching.current
      ) {
        return;
      }

      const newParams = new URLSearchParams(searchParams);
      newParams.set("page", page.toString());
      const prefetchKey = constructKey({
        ...location,
        search: newParams.toString(),
      });

      // Check if this specific key has been prefetched
      if (prefetchedKeys.has(prefetchKey)) {
        return;
      }

      isPrefetching.current = true;

      try {
        console.debug(`Prefetching page: ${page}`);
        await fetcher.load(`?${newParams.toString()}`);

        setPrefetchedKeys((prev) => new Set(prev).add(prefetchKey));
      } finally {
        isPrefetching.current = false;
      }
    },
    [fetcher, searchParams, location, metadata, prefetchedKeys],
  );

  // Strategic prefetching logic
  const prefetchAdjacentPages = useCallback(() => {
    const { currentPage } = metadata;

    // Immediate neighbors
    if (metadata.next) prefetchPage(metadata.next.page);
    if (metadata.previous) prefetchPage(metadata.previous.page);

    // Visual range prefetch
    requestAnimationFrame(() => {
      getVisiblePages().forEach((page) => {
        if (Math.abs(page.number - currentPage) <= 2) {
          prefetchPage(page.number);
        }
      });
    });
  }, [metadata, prefetchPage, getVisiblePages]);

  // Page navigation handler
  const handlePageChange = useCallback(
    (page: number) => {
      if (page === metadata.currentPage || isLoading) return;

      const newParams = new URLSearchParams(searchParams);
      newParams.set("page", page.toString());
      setSearchParams(newParams);
    },
    [metadata.currentPage, isLoading, searchParams, setSearchParams],
  );

  // Keyboard navigation handler
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
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

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [metadata.previous, metadata.next, handlePageChange, isLoading]);

  // Reset prefetch state on cache clearance or key change
  useEffect(() => {
    setPrefetchedKeys(new Set());
  }, [storageClearCount]);

  // Automatic prefetching on idle
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
    prefetchedKeys,
  };
}
