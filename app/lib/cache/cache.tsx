import type { Location } from "react-router";
import { useLocation, useNavigate } from "react-router";
import React, { useCallback, useEffect, useState } from "react";
import type {
  AugmentStorageAdapterOption,
  CacheAdapter,
  CacheConfig,
  CachedData,
  CacheEntry,
  DecacheConfig,
  RouteClientActionArgs,
  RouteClientLoaderArgs,
} from "~/lib/cache/types";
import { z } from "zod";
import { dateReviver } from "~/utils/date-reviver";

/**
 *
 * Default maximum age for cache entries in seconds (5 minutes)
 */
const DEFAULT_MAX_AGE = 60 * 5;

/**
 * Removes cached data after performing a server action
 * @template TData The type of data being cached
 * @param args Action arguments containing request and server action
 * @param config Cache configuration with optional key(s) to invalidate
 * @returns Result of the server action
 *
 * @example
 * // Invalidate single cache
 * decacheClientLoader(args, { key: '/amin/users' })
 *
 * @example
 * // Invalidate multiple caches
 * decacheClientLoader(args, {
 *   key: ['/admin/dashboard', '/api/settings', '/api/profile']
 * })
 */

const DEFAULT_MEMORY_CACHE = new Map();

export let cacheAdapter: CacheAdapter<CacheEntry<any>> = {
  getItem: async (key) => DEFAULT_MEMORY_CACHE.get(key),
  setItem: async (key, value) => DEFAULT_MEMORY_CACHE.set(key, value),
  removeItem: async (key) => DEFAULT_MEMORY_CACHE.delete(key),
};

/**
 * Creates a storage adapter from a standard Web Storage object
 * @template T The type of data being cached
 * @param storage Web Storage object (localStorage/sessionStorage)
 * @param options Options to configure the adapter
 * @returns Cache adapter for the storage
 */
export function augmentStorageAdapter<T>(
  storage: Storage,
  options: AugmentStorageAdapterOption<T> = { useHybrid: false },
): CacheAdapter<CacheEntry<T>> {
  if (!options.useHybrid) {
    // Default behavior: Persistent storage only
    return {
      getItem: async (key) => {
        const storedItem = storage.getItem(key);
        if (!storedItem) return null;
        try {
          return JSON.parse(storedItem, dateReviver);
        } catch (e) {
          console.warn(`Error parsing cache for key: ${key}`, e);
          return null;
        }
      },
      setItem: async (key, value) =>
        storage.setItem(key, JSON.stringify(value)),
      removeItem: async (key) => storage.removeItem(key),
    };
  }
  // Hybrid caching: Use provided memory adapter and persistent storage

  return {
    getItem: async (key) => {
      const memoryEntry = await DEFAULT_MEMORY_CACHE.get(key);
      if (memoryEntry) return memoryEntry;

      const storedItem = storage.getItem(key);
      if (!storedItem) return null;

      try {
        const parsed = JSON.parse(storedItem, dateReviver);
        DEFAULT_MEMORY_CACHE.set(key, parsed); // Populate memory cache
        return parsed;
      } catch (e) {
        console.warn(`Error parsing cache for key: ${key}`, e);
        return null;
      }
    },
    setItem: async (key, value) => {
      DEFAULT_MEMORY_CACHE.set(key, value);
      storage.setItem(key, JSON.stringify(value));
    },
    removeItem: async (key) => {
      DEFAULT_MEMORY_CACHE.delete(key);
      storage.removeItem(key);
    },
  };
}

/**
 * Creates a new cache adapter instance
 * @param adapter Factory function that returns a cache adapter
 * @param useHybrid
 * @returns Object containing the configured adapter
 */
export const createCacheAdapter = (
  adapter: () => CacheAdapter<CacheEntry<any>>,
  {
    useHybrid = false,
  }: Pick<AugmentStorageAdapterOption<any>, "useHybrid"> = {},
) => {
  if (typeof document === "undefined") return { adapter: undefined };
  const adapterInstance = adapter();
  if (adapterInstance instanceof Storage) {
    return {
      adapter: augmentStorageAdapter(adapterInstance, { useHybrid }),
    };
  }
  return {
    adapter: adapter(),
  };
};

/**
 * Configures the global cache instance
 * @param newCacheInstance Factory function that returns a cache adapter or Storage object
 * @param useHybrid Whether to enable hybrid caching (default: false)
 */
export const configureGlobalCache = (
  newCacheInstance: () => CacheAdapter<CacheEntry<any>> | Storage,
  {
    useHybrid = false,
  }: Pick<AugmentStorageAdapterOption<any>, "useHybrid"> = {},
) => {
  if (typeof document === "undefined") return;
  const newCache = newCacheInstance();

  if (newCache instanceof Storage) {
    cacheAdapter = augmentStorageAdapter(newCache, { useHybrid });
    return;
  }
  if (newCache) {
    cacheAdapter = newCache;
  }
};

export const decacheClientLoader = async <TData,>(
  { request, serverAction }: RouteClientActionArgs<TData>,
  {
    key = constructKey(request),
    adapter = cacheAdapter,
  }: DecacheConfig<TData> = {},
): Promise<TData> => {
  // Execute the server action first to ensure data is updated
  const data = await serverAction();
  // Invalidate all specified cache keys

  await invalidateCache(key, adapter);
  return data;
};

function isRedirect(response: Response): boolean {
  return response.status >= 300 && response.status < 400;
}

function isRouteError(response: Response): boolean {
  return response.status >= 400 && response.status < 600;
}

function isResponse(value: unknown): value is Response {
  return value instanceof Response;
}

async function handleResponse<T>(data: T | Response) {
  if (isResponse(data)) {
    if (isRedirect(data) || isRouteError(data)) {
      throw data;
    }
  }
  return data as T;
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
    adapter = cacheAdapter,
    maxAge = type === "swr" ? null : DEFAULT_MAX_AGE,
  } = config;
  const cacheEntry = await adapter.getItem(key);

  const isValidCacheEntry = validateCacheEntry<TData>(cacheEntry);

  console.log({ isValidCacheEntry });

  if (!isValidCacheEntry || cacheEntry.revalidated) {
    const data = await serverLoader();
    const validData = await handleResponse(data);
    await adapter.setItem(key, {
      data: validData,
      maxAge,
      timestamp: Date.now(),
      revalidated: false,
    });
    return {
      ...validData,
      revalidated: false,
      serverData: validData,
      deferredServerData: undefined,
      key,
      maxAge,
    };
  }
  const {
    timestamp,
    maxAge: storedMaxAge,
    data: cacheData,
    revalidated,
  } = cacheEntry;

  const cacheExpired = isCacheExpired(timestamp, storedMaxAge, type);
  if (type === "normal" && !cacheExpired) {
    return {
      ...cacheData,
      key,
      revalidated,
      deferredServerData: undefined,
      serverData: cacheData,
      maxAge: storedMaxAge,
    };
  }
  if (cacheExpired) {
    const data = await serverLoader();
    const validData = await handleResponse(data);
    await adapter.setItem(key, {
      data: validData,
      maxAge,
      timestamp: Date.now(),
      revalidated: false,
    });

    return {
      ...validData,
      revalidated,
      serverData: validData,
      deferredServerData: type === "swr" ? serverLoader() : undefined,
      key,
      maxAge,
    };
  }
  return {
    ...cacheData,
    serverData: cacheData,
    revalidated,
    deferredServerData: type === "swr" ? serverLoader() : undefined,
    key,
    maxAge: storedMaxAge,
  };
}

type ClientCacheContext = {};

const ClientCacheContext = React.createContext<ClientCacheContext | null>(null);
const useClientCache = () => {
  const context = React.useContext(ClientCacheContext);
  if (!context) {
    throw new Error(
      "useClientCache must be used within the ClientCacheProvider",
    );
  }
  return context;
};

export function ClientCacheProvider() {}

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
      return "serverData" in data && "key" in data && "maxAge" in data;
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

        // Update cache if `key` is available
        if (loaderData.key) {
          adapter.setItem(loaderData.key, {
            data: newData,
            timestamp: Date.now(),
            maxAge: loaderData.maxAge,
            revalidated: false,
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

  // useEffect(() => {
  //   if (isCachedData(loaderData) && loaderData.serverData !== freshData) {
  //     setFreshData(loaderData.serverData);
  //   }
  // }, [loaderData, freshData, isCachedData]);

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
    cacheKey: isCachedData(loaderData) ? loaderData.key : undefined,
    maxAge: isCachedData(loaderData) ? loaderData.maxAge : null,
    invalidate: isCachedData(loaderData)
      ? () => invalidateCache(loaderData.key)
      : async () => {}, // No-op if no cache key
  } as const;
}

/**
 * Hook to manually invalidate cache keys.
 * @returns A function to invalidate cache keys.
 */
export function useRevalidatedCache<T = unknown>(
  adapter: CacheAdapter<CacheEntry<T>> = cacheAdapter,
) {
  return async function invalidate(key: string | string[]) {
    const keys = Array.isArray(key) ? key : [key];

    // Mark cache entries as invalidated
    await Promise.all(
      keys.map(async (k) => {
        const cacheEntry = await adapter.getItem(k);
        if (cacheEntry) {
          cacheEntry.revalidated = true; // Add invalidated flag
          await adapter.setItem(k, cacheEntry); // Update cache with invalidation
        }
      }),
    );
  };
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
    revalidated: z.boolean(),
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
// Helper function to check data changes
export function isDataChanged<T>(newData: T, oldData: T): boolean {
  return JSON.stringify(newData) !== JSON.stringify(oldData);
}

/**
 * Constructs a cache key from either a Request object or React Router Location
 * @param source Request or Location object to generate key from
 * @returns Cache key string representing the current route/URL
 *
 * @example
 * // Using with Request
 * const key = constructKey(request);
 *
 * @example
 * // Using with React Router Location
 * const location = useLocation();
 * const key = constructKey(location);
 */
export function constructKey(source: Request | Location): string {
  if (source instanceof Request) {
    const url = new URL(source.url);
    return url.pathname + url.search + url.hash;
  }
  // Handle Location object

  return source.pathname + source.search + source.hash;
}

/**
 * Invalidates cache entries in parallel
 * @param key Single key or array of keys to invalidate
 * @param adapter
 */
export const invalidateCache = async (
  key: string | string[],
  adapter = cacheAdapter,
) => {
  const keys = Array.isArray(key) ? key : [key];
  await Promise.all(keys.map((k) => adapter.removeItem(k)));
};
