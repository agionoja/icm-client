import { Await, useLocation, useNavigate } from "react-router";
import React, { useCallback, useEffect, useState } from "react";
import type {
  CacheAdapter,
  CacheConfig,
  CachedData,
  CacheEntry,
  DecacheConfig,
  RouteClientActionArgs,
  RouteClientLoaderArgs,
} from "~/lib/cache/types";
import { z } from "zod";
import {
  useRevalidateOnFocus,
  useRevalidateOnInterval,
  useRevalidateOnReconnect,
} from "~/hooks/revalidate";
import { cacheAdapter, getCacheAdapter } from "~/lib/cache/adapters";
import {
  constructKey,
  handleResponse,
  invalidateCache,
} from "~/lib/cache/utils";

/**
 *
 * Default maximum age for cache entries in seconds (5 minutes)
 */
const DEFAULT_MAX_AGE = 60; // 1 minute;

export const decacheClientLoader = async <TData,>(
  { request, serverAction }: RouteClientActionArgs<TData>,
  {
    key = constructKey(request),
    adapter = getCacheAdapter.cacheAdapter,
  }: DecacheConfig<TData> = {},
): Promise<TData> => {
  const data = await serverAction();
  await invalidateCache(key, adapter);
  return data;
};

export async function clearStorageAdapters<TData>(
  { serverAction }: RouteClientActionArgs<TData>,
  {
    adapters = [getCacheAdapter.cacheAdapter],
  }: { adapters: Array<CacheAdapter<CacheEntry<TData>> | Storage> },
) {
  // Execute the server action
  const data = await serverAction();

  // Iterate through the array of adapters and clear each one
  for (const adapter of adapters) {
    if (typeof adapter.clear === "function") {
      await adapter.clear();
    }
  }

  // Return the server action result
  return data;
}

/**
 * Main caching function for client-side loaders
 * @template TData The type of data being cached
 * @param args Loader arguments containing request and server loader
 * @param config Cache configuration
 * @returns Cached data with additional metadata
 */
export async function cacheClientLoader<TData extends object>(
  { request, serverLoader }: RouteClientLoaderArgs<TData>,
  config: CacheConfig<CacheEntry<TData>> = {},
): Promise<TData & CachedData<TData>> {
  const {
    type = "swr",
    key = constructKey(request),
    adapter = getCacheAdapter.cacheAdapter,
    maxAge = type === "swr" ? null : DEFAULT_MAX_AGE,
    revalidate = false,
  } = config;
  const cacheEntry = await adapter.getItem(key);

  const isValidCacheEntry = validateCacheEntry<TData>(cacheEntry);

  // If no cache or invalid cache, fetch fresh data
  if (!isValidCacheEntry) {
    const data = await serverLoader();
    const validData = await handleResponse(data);
    await adapter.setItem(key, {
      data: validData,
      maxAge,
      timestamp: Date.now(),
    });
    return {
      ...validData,
      serverData: validData,
      deferredServerData: undefined,
      key,
      maxAge,
    };
  }

  const { timestamp, maxAge: storedMaxAge, data: cacheData } = cacheEntry;

  const cacheExpired = isCacheExpired(timestamp, storedMaxAge, type);
  const shouldRevalidate = cacheExpired || revalidate;

  if (import.meta.env.DEV) {
    console.log({ type, revalidate, cacheExpired, shouldRevalidate });
  }

  // For SWR, if the cache is marked for revalidation or expired, trigger background fetch
  // but still return cached data immediately
  if (type === "swr" && shouldRevalidate) {
    // Mark cache as stale but still valid

    await adapter.setItem(key, {
      ...cacheEntry,
    });
    return {
      ...cacheData,

      serverData: cacheData,
      deferredServerData: serverLoader(), // Background fetch
      key,
      maxAge: storedMaxAge,
    };
  }
  // For normal caching, if expired or revalidated, wait for fresh data
  if (type === "normal" && shouldRevalidate) {
    const data = await serverLoader();
    const validData = await handleResponse(data);
    await adapter.setItem(key, {
      data: validData,
      maxAge,
      timestamp: Date.now(),
    });

    return {
      ...validData,
      revalidated: false,
      stale: false,
      serverData: validData,
      deferredServerData: undefined,
      key,
      maxAge,
    };
  }

  // Cache is still valid
  return {
    ...cacheData,
    serverData: cacheData,
    revalidated: false,
    deferredServerData: type === "swr" ? serverLoader() : undefined,
    key,
    maxAge: storedMaxAge,
  };
}

type MutableRevalidate = {
  revalidate: boolean;
};
type ClientCacheProviderProps<TData> = {
  children: (data: TData) => React.ReactNode;
  enabled?: boolean;
  mutableRevalidate: MutableRevalidate;
  interval?: number;
  loaderData: TData | (TData & CachedData<TData>);
};

export function ClientCacheProvider<TData extends object>({
  children,
  mutableRevalidate,
  enabled = true,
  interval = 50_000,
  loaderData,
}: ClientCacheProviderProps<TData>) {
  const handleRevalidate = () => {
    mutableRevalidate.revalidate = true;
    if (import.meta.env.DEV) {
      console.log("revalidating", {
        revalidate: mutableRevalidate.revalidate,
      });
    }
  };

  const handleRevalidateCleanup = () => {
    mutableRevalidate.revalidate = false;
    if (import.meta.env.DEV) {
      console.log("cleanup", { revalidate: mutableRevalidate.revalidate });
    }
  };

  useRevalidateOnFocus({
    enabled,
    onRevalidate: () => handleRevalidate(),
    onCleanup: () => handleRevalidateCleanup(),
  });

  useRevalidateOnInterval({
    enabled,
    interval,
    onRevalidate: () => handleRevalidate(),
    onCleanup: () => handleRevalidateCleanup(),
  });

  useRevalidateOnReconnect({
    enabled,
    onRevalidate: () => handleRevalidate(),
    onCleanup: () => handleRevalidateCleanup(),
  });

  const SWR = useSwrData(loaderData);

  return <SWR>{(data) => <>{children(data)}</>}</SWR>;
}
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

export function useSwrData<TData extends object>(
  loaderData: TData | (TData & CachedData<TData>),
) {
  return function SWR({
    children,
  }: {
    children: (data: TData) => React.ReactElement;
  }) {
    // Type guard to narrow down the type
    const isCachedData = (value: any): value is CachedData<TData> => {
      return "deferredServerData" in value && "serverData" in value;
    };

    if (isCachedData(loaderData)) {
      const { deferredServerData, serverData } = loaderData;

      return (
        <>
          {deferredServerData ? (
            <React.Suspense fallback={children(serverData)}>
              <Await resolve={deferredServerData}>
                {(resolvedData) => children(resolvedData)}
              </Await>
            </React.Suspense>
          ) : (
            children(serverData)
          )}
        </>
      );
    }

    // Fallback for plain TData
    return <>{children(loaderData)}</>;
  };
}

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
        setFreshData(newData);
      })
      .catch((e) => {
        if (e instanceof Response && e.status === 302) {
          const to = e.headers.get("Location");
          to && navigate(to);
          return;
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

/**
 * Hook that provides the current route's cache key using React Router location
 * @returns Current route's cache key
 *
 * @example
 * function MyComponent() {
 *   const cacheKey = useRouteKey();
 *   const invalidateCurrentRoute = () => invalidateCache(cacheKey);
 *   return <button onClick={invalidateCurrentRoute}>Refresh</button>;
 * }
 */
export function useRouteKey(): string {
  const location = useLocation();
  return constructKey(location);
}

/**
 * Hook providing cache invalidation functionality
 * @returns Object containing invalidateCache function
 */
export const useCacheInvalidator = () => ({
  invalidateCache,
});

export function isCacheExpired(
  timestamp: number,
  maxAge: number | null,
  type: CacheConfig<any>["type"],
): boolean {
  if (!maxAge && type === "swr") return false;
  if (!maxAge) return true;
  const maxAgeInMs = maxAge * 1000;

  const currentTime = Date.now();
  return currentTime - timestamp > maxAgeInMs;
}

/**
 * Creates a Zod schema for validating cache entries
 * @template T The type of data being cached
 * @returns Zod schema for cache entry validation
 */
export const createCacheEntrySchema = <T extends object>() =>
  z.object({
    data: z.record(z.any()).refine((obj) => Object.keys(obj).length > 0, {
      message: "Data object cannot be empty",
    }) as unknown as z.ZodType<T>,
    timestamp: z.number().positive(),
    maxAge: z.number().positive().nullable(),
    // revalidated: z.boolean(),
    // stale: z.boolean(),
  });
/**
 * Validates if a value is a valid cache entry
 * @template T The type of data being cached
 * @param value Value to validate
 * @returns Type predicate indicating if the value is a valid cache entry
 */
export function validateCacheEntry<T extends object>(
  value: unknown,
): value is CacheEntry<T> {
  const schema = createCacheEntrySchema<T>();
  return schema.safeParse(value).success;
}
