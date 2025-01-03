import { invalidateCache } from "../utils";
import type { CacheAdapter, CachedData, CacheEntry } from "../types";
import { cacheAdapter } from "../cache";
import { useNavigate } from "react-router";
import { useCallback, useEffect, useState } from "react";
import { cacheStateManager } from "../cache/cache-state";

/**
 * Creates a wrapper component that provides server data to children.
 *
 * @template TData The type of the server data being handled
 * @returns A functional React component to use server data
 *
 * @example
 * ```tsx
 * const SWR = useSerData({
 *   serverData: { name: "Alice" },
 *   deferredServerData: fetchData(),
 *   maxAge: 60,
 *   key: "user-data",
 * });
 *
 * return (
 *   <SWR>
 *     {(data) => <div>Name: {data.name}</div>}
 *   </SWR>
 * );
 * ```
 * @param loaderData
 */

/**
 * React hook for managing cached loader data
 * @template TData The type of cached data
 * @param loaderData Initial loader data with cache metadata
 * @param options Configuration options
 * @returns Updated data with cache management functions
 */
export function useCachedLoaderData<TData extends object>(
  loaderData: TData | (TData & CachedData<TData>), // Supports both raw data and CachedData
  {
    adapter = cacheAdapter,
  }: { adapter?: CacheAdapter<CacheEntry<TData>> } = {},
) {
  const navigate = useNavigate();

  // Type guard to check if loaderData is CachedData
  const isCachedData = useCallback(
    (
      data: TData | (TData & CachedData<TData>),
    ): data is TData & CachedData<TData> => {
      return "deferredServerData" in data && "serverData" in data;
    },
    [],
  );

  // If loaderData is CachedData, extract serverData; otherwise use loaderData directly
  const initialData = isCachedData(loaderData)
    ? loaderData.serverData
    : loaderData;
  const [freshData, setFreshData] = useState<TData>(initialData);

  useEffect(() => {
    if (!isCachedData(loaderData) || !loaderData.deferredServerData) return;

    let isMounted = true;
    loaderData.deferredServerData
      .then((newData) => {
        if (!isMounted) return;

        if (isCachedData(loaderData)) {
          adapter.setItem(loaderData.key, {
            data: newData,
            timestamp: Date.now(),
            maxAge: loaderData.maxAge,
          });
        }

        cacheStateManager.setState(loaderData.key, {
          state: "success",
          key: loaderData.key,
        });
        setFreshData(newData);
      })
      .catch((e) => {
        if (e instanceof Response && e.status === 302) {
          const to = e.headers.get("Location");
          to && navigate(to);
          return;
        }
        if (isCachedData(loaderData)) {
          cacheStateManager.setState(loaderData.key, {
            state: "error",
            key: loaderData.key,
          });
        }
        throw e;
      });

    return () => {
      isMounted = false;
    };
  }, [loaderData, adapter, navigate, isCachedData]);

  // Update the cache if the data changes
  useEffect(() => {
    if (
      isCachedData(loaderData) &&
      loaderData.serverData &&
      JSON.stringify(loaderData.serverData) !== JSON.stringify(freshData)
    ) {
      setFreshData(loaderData.serverData);
    }
  }, [freshData, isCachedData, loaderData]);

  return {
    ...freshData,
    ...loaderData,
    cacheKey: isCachedData(loaderData) ? loaderData.key : undefined,
    maxAge: isCachedData(loaderData) ? loaderData.maxAge : null,
    invalidate: isCachedData(loaderData)
      ? () => invalidateCache(loaderData.key)
      : async () => {},
  } as const;
}
