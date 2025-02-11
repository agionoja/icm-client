import {
  useFetcher,
  useLocation,
  useNavigation,
  useSearchParams,
} from "react-router";
import { useCallback, useEffect, useMemo, useRef } from "react";
import type { PaginationMetadata } from "icm-shared";
import { constructKey } from "~/lib/cache";

const KEY_THROTTLE_DELAY = 200;

interface PaginationPage {
  number: number;
  type: "edge" | "middle";
}

// ─── Hook: URL Synchronization ────────────────────────────────────
function useSyncUrlWithServerPage({
  currentPage,
  searchParams,
  location,
  setSearchParams,
}: {
  currentPage: number;
  searchParams: URLSearchParams;
  location: ReturnType<typeof useLocation>;
  setSearchParams: ReturnType<typeof useSearchParams>[1];
}) {
  useEffect(() => {
    const urlPage = Number(searchParams.get("page") || "1");
    if (urlPage !== currentPage) {
      console.warn(
        `Cache mismatch (URL: ${urlPage} vs Server: ${currentPage})`,
      );
      try {
        const currentKey = constructKey(location);
        localStorage.removeItem(currentKey);
        const newParams = new URLSearchParams(searchParams);
        newParams.set("page", currentPage.toString());
        setSearchParams(newParams, { preventScrollReset: false });
      } catch (error) {
        console.error("Cache sync failed:", error);
      }
    }
  }, [currentPage, searchParams, location, setSearchParams]);
}

// ─── Hook: Visible Pages Calculation ──────────────────────────────
function useVisiblePages(
  currentPage: number,
  pageCount: number,
  maxVisiblePages: number,
): PaginationPage[] {
  return useMemo(() => {
    const pages: PaginationPage[] = [{ number: 1, type: "edge" }];
    const start = Math.max(
      2,
      currentPage - Math.floor((maxVisiblePages - 2) / 2),
    );
    const end = Math.min(pageCount - 1, start + maxVisiblePages - 3);

    for (let i = start; i <= end; i++)
      pages.push({ number: i, type: "middle" });
    if (pageCount > 1) pages.push({ number: pageCount, type: "edge" });

    return pages;
  }, [currentPage, pageCount, maxVisiblePages]);
}

// ─── Hook: Prefetching Logic ──────────────────────────────────────
function usePrefetching({
  currentPage,
  pageCount,
  previousPage,
  nextPage,
  searchParams,
  fetcher,
  isLoading,
}: {
  currentPage: number;
  pageCount: number;
  previousPage?: number;
  nextPage?: number;
  searchParams: URLSearchParams;
  fetcher: ReturnType<typeof useFetcher>;
  isLoading: boolean;
}) {
  const prefetchLock = useRef(false);
  const queuedPage = useRef<number | null>(null);
  const lastPrefetched = useRef<number | null>(null);

  const prefetchPage = useCallback(
    async (page: number) => {
      if (page === currentPage || page < 1 || page > pageCount) return;
      const params = new URLSearchParams(searchParams);
      params.set("page", page.toString());
      try {
        await fetcher.load(`?${params}`);
      } catch (error) {
        console.error("Prefetch failed:", error);
      }
    },
    [currentPage, pageCount, searchParams, fetcher],
  );

  const runPrefetchChain = useCallback(
    async (page: number) => {
      lastPrefetched.current = page;
      if (previousPage) await prefetchPage(previousPage);
      if (nextPage) await prefetchPage(nextPage);
    },
    [previousPage, nextPage, prefetchPage],
  );

  const prefetchAdjacent = useCallback(() => {
    if (lastPrefetched.current === currentPage) return;
    if (prefetchLock.current) {
      queuedPage.current = currentPage;
      return;
    }

    prefetchLock.current = true;
    (async () => {
      await runPrefetchChain(currentPage);
      prefetchLock.current = false;

      if (queuedPage.current && queuedPage.current !== lastPrefetched.current) {
        const next = queuedPage.current;
        queuedPage.current = null;
        prefetchLock.current = true;
        await runPrefetchChain(next);
        prefetchLock.current = false;
      }
    })();
  }, [currentPage, runPrefetchChain]);

  useEffect(() => {
    if (!isLoading) prefetchAdjacent();
  }, [currentPage, isLoading, prefetchAdjacent]);

  return { prefetchPage };
}

// ─── Hook: Keyboard Navigation ────────────────────────────────────
function useKeyboardNavigation({
  previousPage,
  nextPage,
  handlePageChange,
  isLoading,
}: {
  previousPage?: number;
  nextPage?: number;
  handlePageChange: (page: number) => void;
  isLoading: boolean;
}) {
  const lastKeyPress = useRef(0);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLElement &&
        ["INPUT", "TEXTAREA"].includes(e.target.tagName)
      )
        return;
      if (isLoading || Date.now() - lastKeyPress.current < KEY_THROTTLE_DELAY)
        return;

      lastKeyPress.current = Date.now();

      if (e.key === "ArrowLeft" && previousPage) {
        handlePageChange(previousPage);
      } else if (e.key === "ArrowRight" && nextPage) {
        handlePageChange(nextPage);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [previousPage, nextPage, handlePageChange, isLoading]);
}

// ─── Main Hook ────────────────────────────────────────────────────
export function usePagination({
  metadata,
  maxVisiblePages = 5,
}: {
  metadata: PaginationMetadata;
  maxVisiblePages?: number;
}) {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { state } = useNavigation();
  const fetcher = useFetcher();

  const isLoading = state !== "idle";

  useSyncUrlWithServerPage({
    currentPage: metadata.currentPage,
    searchParams,
    location,
    setSearchParams,
  });

  const visiblePages = useVisiblePages(
    metadata.currentPage,
    metadata.pageCount,
    maxVisiblePages,
  );

  const { prefetchPage } = usePrefetching({
    currentPage: metadata.currentPage,
    pageCount: metadata.pageCount,
    previousPage: metadata.previous?.page,
    nextPage: metadata.next?.page,
    searchParams,
    fetcher,
    isLoading,
  });

  const handlePageChange = useCallback(
    (page: number) => {
      if (page === metadata.currentPage || isLoading) return;
      const params = new URLSearchParams(searchParams);
      params.set("page", page.toString());
      setSearchParams(params, { preventScrollReset: false });
    },
    [metadata.currentPage, isLoading, searchParams, setSearchParams],
  );

  useKeyboardNavigation({
    previousPage: metadata.previous?.page,
    nextPage: metadata.next?.page,
    handlePageChange,
    isLoading,
  });

  return {
    isLoading,
    visiblePages,
    handlePageChange,
    prefetchPage,
  };
}
