import React from "react";
import type { CachedData } from "../types";
import {
  useRevalidateOnFocus,
  useRevalidateOnInterval,
  useRevalidateOnReconnect,
  useSwrData,
  useCachedLoaderData,
} from "../hooks";

export type MutableRevalidate = {
  revalidate: boolean;
};

type RevalidationOptions = {
  mutableRevalidate?: MutableRevalidate;
  focusEnabled?: boolean;
  intervalEnabled?: boolean;
  reconnectEnabled?: boolean;
  interval?: number;
};

function useRevalidation({
  mutableRevalidate = { revalidate: false },
  focusEnabled = true,
  intervalEnabled = true,
  reconnectEnabled = true,
  interval = 50_000,
}: RevalidationOptions = {}) {
  const handleRevalidate = () => {
    mutableRevalidate.revalidate = true;
  };

  const handleRevalidateCleanup = () => {
    mutableRevalidate.revalidate = false;
  };

  useRevalidateOnFocus({
    enabled: focusEnabled,
    onRevalidate: handleRevalidate,
    onCleanup: handleRevalidateCleanup,
  });

  useRevalidateOnInterval({
    enabled: intervalEnabled,
    interval,
    onRevalidate: handleRevalidate,
    onCleanup: handleRevalidateCleanup,
  });

  useRevalidateOnReconnect({
    enabled: reconnectEnabled,
    onRevalidate: handleRevalidate,
    onCleanup: handleRevalidateCleanup,
  });
}

type ClientCacheProviderProps<TData> = RevalidationOptions & {
  children: (cachedData: TData) => React.ReactNode;
  loaderData: TData | (TData & CachedData<TData>);
};

export function CacheProvider<TData extends object>({
  children,
  loaderData,
  ...revalidationOptions
}: ClientCacheProviderProps<TData>) {
  useRevalidation(revalidationOptions);

  const cachedData = useCachedLoaderData(loaderData);
  return <>{children(cachedData)}</>;
}

/**
 * A client cache component that uses Suspense for data loading.
 *
 * @warning Known Issues with Cache State Tracking in Layout Routes
 *
 * When using this component with useClientCacheState() in layout routes, you may experience
 * issues with cache state tracking (loading/success/error states). The cache data itself
 * works correctly, but the state tracking can become unreliable due to:
 *
 * 1. Suspense boundaries unmounting components during route transitions
 * 2. Parent/child component lifecycle conflicts
 * 3. Multiple components trying to track the same cache state
 *
 * You might notice:
 * - Loading states flickering or not updating correctly
 * - State inconsistencies between parent and child components
 * - Console logs showing repeated state tracking registration/cleanup
 *
 * Recommended Solutions:
 * 1. Use {@link CacheProvider} (non-Suspense version) for layout routes if you need state tracking
 * 2. Keep CacheProviderWithSuspense in leaf routes (routes without <Outlet />)
 * 3. If you must use state tracking in layouts, use CacheProvider instead
 *
 * Note: The actual cached data works correctly in all cases - these issues only
 * affect components that need to track loading/success/error states.
 *
 * @example Safe Usage in Leaf Routes (with state tracking)
 * ```tsx
 * function LeafRoute() {
 *   // State tracking works reliably here
 *   const cacheState = useClientCacheState('users');
 *
 *   return (
 *     <CacheProviderWithSuspense loaderData={data}>
 *       {(cached) => <div>{cached.value}</div>}
 *     </CacheProviderWithSuspense>
 *   );
 * }
 * ```
 *
 * @example Recommended Layout Route Pattern
 * ```tsx
 * function LayoutRoute() {
 *   // State tracking works reliably with regular CacheProvider
 *   const cacheState = useClientCacheState('users');
 *
 *   return (
 *     <CacheProvider loaderData={data}> // Non-Suspense version
 *       {(cached) => (
 *         <>
 *           <div>{cached.value}</div>
 *           <Outlet />
 *         </>
 *       )}
 *     </CacheProvider>
 *   );
 * }
 * ```
 *
 * @example Problematic Pattern to Avoid
 * ```tsx
 * function LayoutRoute() {
 *   // State tracking will be unreliable in this pattern
 *   const cacheState = useClientCacheState('users');
 *
 *   return (
 *     <CacheProviderWithSuspense loaderData={data}>
 *       {(cached) => (
 *         <>
 *           <div>{cached.value}</div>
 *           <Outlet />
 *          // Note: State tracking becomes unreliable with nested routes
 *         </>
 *       )}
 *     </CacheProviderWithSuspense>
 *   );
 * }
 * ```
 */
export function CacheProviderWithSuspense<TData extends object>({
  children,
  loaderData,
  ...revalidationOptions
}: ClientCacheProviderProps<TData>) {
  useRevalidation(revalidationOptions);
  const SWR = useSwrData(loaderData);
  return <SWR>{(cachedData) => <>{children(cachedData)}</>}</SWR>;
}
