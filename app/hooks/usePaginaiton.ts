// import {
//   useFetcher,
//   useLocation,
//   useNavigation,
//   useSearchParams,
// } from "react-router";
// import { useCallback, useEffect, useRef, useState } from "react";
// import type { PaginationMetadata } from "icm-shared";
// import { constructKey, useStorageCleared } from "~/lib/cache";
//
// interface PaginationPage {
//   number: number;
//   type: "edge" | "middle";
// }
//
// export function usePagination({
//   metadata,
//   maxVisiblePages = 5,
//   maxPrefetchAge = 1000,
// }: {
//   metadata: PaginationMetadata;
//   maxVisiblePages?: number;
//   maxPrefetchAge?: number;
// }) {
//   // Hook dependencies and state
//   const location = useLocation();
//   const { state } = useNavigation();
//   const [searchParams, setSearchParams] = useSearchParams();
//   const fetcher = useFetcher();
//   const storageClearCount = useStorageCleared();
//
//   // Prefetch tracking and throttling
//   const [prefetchedKeys, setPrefetchedKeys] = useState<Map<string, number>>(
//     new Map(),
//   );
//   const isPrefetching = useRef(false);
//   const lastKeyPressTime = useRef<number>(0);
//   const keyPressThrottle = 200;
//
//   const isLoading = state !== "idle";
//
//   // Cache invalidation and state synchronization
//   useEffect(() => {
//     const handleCacheState = () => {
//       const urlPage = Number(searchParams.get("page") || "1");
//       const serverPage = metadata.currentPage;
//
//       if (urlPage === serverPage) return;
//
//       console.warn(
//         `Cache mismatch detected (URL: ${urlPage} vs Server: ${serverPage})`,
//       );
//
//       try {
//         const currentKey = constructKey(location);
//         localStorage.removeItem(currentKey);
//         console.log("Invalidated cache for:", currentKey);
//
//         const newParams = new URLSearchParams(searchParams);
//         newParams.set("page", serverPage.toString());
//         setSearchParams(newParams, {
//           preventScrollReset: false,
//         });
//       } catch (error) {
//         console.error("Cache synchronization failed:", error);
//       }
//     };
//
//     handleCacheState();
//   }, [metadata.currentPage, searchParams, location, setSearchParams]);
//
//   // Pagination UI calculations
//   const getVisiblePages = useCallback(() => {
//     const pages: PaginationPage[] = [];
//
//     pages.push({ number: 1, type: "edge" });
//
//     const start = Math.max(
//       2,
//       metadata.currentPage - Math.floor((maxVisiblePages - 2) / 2),
//     );
//     const end = Math.min(metadata.pageCount - 1, start + maxVisiblePages - 3);
//
//     for (let i = start; i <= end; i++) {
//       pages.push({ number: i, type: "middle" });
//     }
//
//     if (metadata.pageCount > 1) {
//       pages.push({ number: metadata.pageCount, type: "edge" });
//     }
//
//     return pages;
//   }, [metadata.currentPage, metadata.pageCount, maxVisiblePages]);
//
//   // Prefetch management
//   const prefetchPage = useCallback(
//     async (page: number) => {
//       if (
//         page === metadata.currentPage ||
//         page < 1 ||
//         page > metadata.pageCount ||
//         isPrefetching.current
//       ) {
//         return;
//       }
//
//       const newParams = new URLSearchParams(searchParams);
//       newParams.set("page", page.toString());
//       const prefetchKey = constructKey({
//         ...location,
//         search: newParams.toString(),
//       });
//
//       // Check if this specific key has been prefetched and is not stale
//       const prefetchTime = prefetchedKeys.get(prefetchKey);
//       if (prefetchTime && Date.now() - prefetchTime < maxPrefetchAge) {
//         return;
//       }
//
//       isPrefetching.current = true;
//
//       try {
//         console.debug(`Prefetching page: ${page}`);
//         await fetcher.load(`?${newParams.toString()}`);
//
//         setPrefetchedKeys((prev) => new Map(prev).set(prefetchKey, Date.now()));
//       } finally {
//         isPrefetching.current = false;
//       }
//     },
//     [
//       metadata.currentPage,
//       metadata.pageCount,
//       searchParams,
//       location,
//       prefetchedKeys,
//       maxPrefetchAge,
//       fetcher,
//     ],
//   );
//
//   // Strategic prefetching logic
//   const prefetchAdjacentPages = useCallback(() => {
//     const { currentPage } = metadata;
//
//     if (metadata.next) prefetchPage(metadata.next.page);
//     if (metadata.previous) prefetchPage(metadata.previous.page);
//
//     requestAnimationFrame(() => {
//       getVisiblePages().forEach((page) => {
//         if (Math.abs(page.number - currentPage) <= 2) {
//           prefetchPage(page.number);
//         }
//       });
//     });
//   }, [metadata, prefetchPage, getVisiblePages]);
//
//   // Page navigation handler
//   const handlePageChange = useCallback(
//     (page: number) => {
//       if (page === metadata.currentPage || isLoading) return;
//
//       const newParams = new URLSearchParams(searchParams);
//       newParams.set("page", page.toString());
//       setSearchParams(newParams, { preventScrollReset: false });
//     },
//     [metadata.currentPage, isLoading, searchParams, setSearchParams],
//   );
//
//   // Keyboard navigation handler
//   useEffect(() => {
//     const handleKeyPress = (event: KeyboardEvent) => {
//       if (
//         event.target instanceof HTMLInputElement ||
//         event.target instanceof HTMLTextAreaElement ||
//         isLoading
//       ) {
//         return;
//       }
//
//       const now = Date.now();
//       if (now - lastKeyPressTime.current < keyPressThrottle) {
//         event.preventDefault();
//         return;
//       }
//
//       if (event.key === "ArrowLeft" && metadata.previous) {
//         lastKeyPressTime.current = now;
//         handlePageChange(metadata.previous.page);
//       } else if (event.key === "ArrowRight" && metadata.next) {
//         lastKeyPressTime.current = now;
//         handlePageChange(metadata.next.page);
//       }
//     };
//
//     window.addEventListener("keydown", handleKeyPress);
//     return () => window.removeEventListener("keydown", handleKeyPress);
//   }, [metadata.previous, metadata.next, handlePageChange, isLoading]);
//
//   // Reset prefetch state on cache clearance or key change
//   useEffect(() => {
//     setPrefetchedKeys(new Map());
//   }, [storageClearCount]);
//
//   // Automatic prefetching on idle
//   useEffect(() => {
//     if (!isLoading) {
//       prefetchAdjacentPages();
//     }
//   }, [metadata.currentPage, isLoading, prefetchAdjacentPages]);
//
//   return {
//     isLoading,
//     visiblePages: getVisiblePages(),
//     handlePageChange,
//     prefetchPage,
//     prefetchedKeys,
//   };
// }

import {
  useFetcher,
  useLocation,
  useNavigation,
  useSearchParams,
} from "react-router";
import { useCallback, useEffect, useRef } from "react";
import type { PaginationMetadata } from "icm-shared";
import { constructKey } from "~/lib/cache";

interface PaginationPage {
  number: number;
  type: "edge" | "middle";
}

/**
 * A custom hook to manage pagination state, navigation, and prefetching.
 * - Keeps the page number in sync with the URL.
 * - Prefetches adjacent pages.
 * - Supports hover-based prefetching.
 */
export function usePagination({
  metadata,
  maxVisiblePages = 5,
}: {
  metadata: PaginationMetadata;
  maxVisiblePages?: number;
}) {
  const location = useLocation();
  const { state } = useNavigation();
  const [searchParams, setSearchParams] = useSearchParams();
  const fetcher = useFetcher();

  const isLoading = state !== "idle";

  /**
   * Ensures the page number in the URL matches the server-provided current page.
   */
  useEffect(() => {
    const urlPage = Number(searchParams.get("page") || "1");
    const serverPage = metadata.currentPage;
    if (urlPage !== serverPage) {
      console.warn(
        `Cache mismatch detected (URL: ${urlPage} vs Server: ${serverPage})`,
      );
      try {
        const currentKey = constructKey(location);
        localStorage.removeItem(currentKey);
        console.log("Invalidated cache for:", currentKey);
        const newParams = new URLSearchParams(searchParams);
        newParams.set("page", serverPage.toString());
        setSearchParams(newParams, { preventScrollReset: false });
      } catch (error) {
        console.error("Cache synchronization failed:", error);
      }
    }
  }, [metadata.currentPage, searchParams, location, setSearchParams]);

  /**
   * Computes the list of visible pages for pagination controls.
   */
  const getVisiblePages = useCallback((): PaginationPage[] => {
    const pages: PaginationPage[] = [];
    pages.push({ number: 1, type: "edge" });

    const start = Math.max(
      2,
      metadata.currentPage - Math.floor((maxVisiblePages - 2) / 2),
    );
    const end = Math.min(metadata.pageCount - 1, start + maxVisiblePages - 3);

    for (let i = start; i <= end; i++) {
      pages.push({ number: i, type: "middle" });
    }

    if (metadata.pageCount > 1) {
      pages.push({ number: metadata.pageCount, type: "edge" });
    }

    return pages;
  }, [metadata.currentPage, metadata.pageCount, maxVisiblePages]);

  // ─── PREFETCHING ─────────────────────────────────────────────────

  const prefetchLock = useRef(false);
  const queuedPage = useRef<number | null>(null);
  const lastPrefetchedPage = useRef<number | null>(null);

  /**
   * Fetches a specific page in the background.
   * Used for both hover-based and adjacent prefetching.
   */
  const fetchPrefetchPage = useCallback(
    async (page: number) => {
      if (
        page === metadata.currentPage ||
        page < 1 ||
        page > metadata.pageCount
      ) {
        return;
      }
      const newParams = new URLSearchParams(searchParams);
      newParams.set("page", page.toString());
      console.debug(`Prefetching page: ${page}`);
      try {
        await fetcher.load(`?${newParams.toString()}`);
      } catch (error) {
        console.error(`Error prefetching page ${page}:`, error);
      }
    },
    [metadata.currentPage, metadata.pageCount, searchParams, fetcher],
  );

  /**
   * Runs the prefetch chain for adjacent pages (previous first, then next).
   */
  const runPrefetchChain = useCallback(
    async (page: number) => {
      lastPrefetchedPage.current = page;
      if (metadata.previous) {
        await fetchPrefetchPage(metadata.previous.page);
      }
      if (metadata.next) {
        await fetchPrefetchPage(metadata.next.page);
      }
    },
    [metadata, fetchPrefetchPage],
  );

  /**
   * Prefetches adjacent pages when the current page changes.
   */
  const prefetchAdjacentPages = useCallback(() => {
    if (lastPrefetchedPage.current === metadata.currentPage) return;
    if (prefetchLock.current) {
      queuedPage.current = metadata.currentPage;
      return;
    }
    prefetchLock.current = true;
    (async () => {
      await runPrefetchChain(metadata.currentPage);
      prefetchLock.current = false;
      if (
        queuedPage.current !== null &&
        queuedPage.current !== lastPrefetchedPage.current
      ) {
        const nextPage = queuedPage.current;
        queuedPage.current = null;
        prefetchLock.current = true;
        await runPrefetchChain(nextPage);
        prefetchLock.current = false;
      }
    })();
  }, [metadata, runPrefetchChain]);

  /**
   * Automatically prefetches adjacent pages whenever the current page updates.
   */
  useEffect(() => {
    if (!isLoading) {
      prefetchAdjacentPages();
    }
  }, [metadata.currentPage, isLoading, prefetchAdjacentPages]);

  /**
   * Updates the URL to navigate to a specific page.
   */
  const handlePageChange = useCallback(
    (page: number) => {
      if (page === metadata.currentPage || isLoading) return;
      const newParams = new URLSearchParams(searchParams);
      newParams.set("page", page.toString());
      setSearchParams(newParams, { preventScrollReset: false });
    },
    [metadata.currentPage, isLoading, searchParams, setSearchParams],
  );

  /**
   * Allows hover-based prefetching.
   * Call this function when the user hovers over a pagination button.
   */
  const prefetchPage = useCallback(
    (page: number) => {
      if (!isLoading) {
        fetchPrefetchPage(page);
      }
    },
    [isLoading, fetchPrefetchPage],
  );

  /**
   * Enables keyboard navigation with ArrowLeft and ArrowRight.
   */
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
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

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [metadata.previous, metadata.next, handlePageChange, isLoading]);

  return {
    isLoading,
    visiblePages: getVisiblePages(),
    handlePageChange,
    prefetchPage,
  };
}
