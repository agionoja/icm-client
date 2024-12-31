import { z } from "zod";
import { type Location, useLocation, useNavigate } from "react-router";
import React, { useEffect, useState } from "react";
import { dateReviver } from "~/utils/date-reviver";

/**
 *
 * Default maximum age for cache entries in seconds (5 minutes)
 */
const DEFAULT_MAX_AGE = 60 * 5;

const DEFAULT_MEMORY_CACHE = new Map();

/**
 * Represents a single entry in the cache
 * @template T The type of data being cached
 */

interface CacheEntry<T> {
  /** The cached data */
  data: T;
  /** Timestamp when the entry was created */
  timestamp: number;
  /** Maximum age of the cache entry in seconds */
  maxAge: number;
}

/**
 * Creates a Zod schema for validating cache entries
 * @template T The type of data being cached
 * @returns Zod schema for cache entry validation
 */
const createCacheEntrySchema = <T extends object>() =>
  z.object({
    data: z.record(z.any()).refine((obj) => Object.keys(obj).length > 0, {
      message: "Data object cannot be empty",
    }) as unknown as z.ZodType<T>,
    timestamp: z.number().positive(),
    maxAge: z.number().positive(),
  });
/**
 * Validates if a value is a valid cache entry
 * @template T The type of data being cached
 * @param value Value to validate
 * @returns Type predicate indicating if the value is a valid cache entry
 */
function validateCacheEntry<T extends object>(
  value: unknown,
): value is CacheEntry<T> {
  const schema = createCacheEntrySchema<T>();
  return schema.safeParse(value).success;
}

/**
 * Interface for implementing custom cache storage adapters
 * @template T The type of data being stored
 */
export interface CacheAdapter<T> {
  /**
   * Retrieves an item from the cache
   * @param key Cache key
   * @returns Cached value or undefined/null if not found
   */
  getItem: (key: string) => T | undefined | Promise<T | null>;

  /**
   * Stores an item in the cache
   * @param key Cache key
   * @param value Value to store
   */
  setItem: (key: string, value: T) => Promise<any> | any;

  /**
   * Removes an item from the cache
   * @param key Cache key
   */
  removeItem: (key: string) => Promise<any> | any;
}

/**
 * Arguments for client-side loader function
 * @template TServerData The type of data returned by the server
 */
export interface RouteClientLoaderArgs<TServerData> {
  /** Current request object */
  request: Request;
  /** Function that loads data from the server */
  serverLoader: () => Promise<TServerData>;
}

/**
 * Arguments for client-side action function
 * @template TServerData The type of data returned by the server
 */
export interface RouteClientActionArgs<TServerData> {
  /** Current request object */
  request: Request;
  /** Function that performs the server action */
  serverAction: () => Promise<TServerData>;
}

/**
 * Configuration options for cache behavior
 * @template T The type of data being cached
 */
export interface CacheConfig<T> {
  /** Cache strategy - 'swr' (Stale-While-Revalidate) or 'normal' */
  type?: "swr" | "normal";
  /** Time in seconds before cache entry expires */
  maxAge?: number;
  /** Custom cache key */
  key?: string;
  /** Custom cache storage adapter */
  adapter?: CacheAdapter<T>;
}

/**
 * Extended data type including cache metadata
 * @template TData The type of data being cached
 */
export interface CachedData<TData> {
  /** Original server data */
  serverData: TData;
  /** Promise for background data revalidation */
  deferredServerData?: Promise<TData>;
  /** Cache key */
  key: string;
  /** Maximum age of the cache entry */
  maxAge: number;
}

export let cacheAdapter: CacheAdapter<CacheEntry<any>> = {
  getItem: async (key) => DEFAULT_MEMORY_CACHE.get(key),
  setItem: async (key, value) => DEFAULT_MEMORY_CACHE.set(key, value),
  removeItem: async (key) => DEFAULT_MEMORY_CACHE.delete(key),
};

type AugmentStorageAdapterOption<T> = {
  useHybrid?: boolean;
  cacheAdapter?: CacheAdapter<CacheEntry<T>>;
};

/**
 * Creates a storage adapter from a standard Web Storage object
 * @template T The type of data being cached
 * @param storage Web Storage object (localStorage/sessionStorage)
 * @param options Options to configure the adapter
 * @returns Cache adapter for the storage
 */
function augmentStorageAdapter<T>(
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

/**
 * Configuration for cache invalidation
 * @template T The type of data being cached
 */
type DecacheConfig<T> = Pick<CacheConfig<CacheEntry<T>>, "adapter"> & {
  key?: string | string[];
};

/**
 * Removes cached data after performing a server action
 * @template TData The type of data being cached
 * @param args Action arguments containing request and server action
 * @param config Cache configuration with optional key(s) to invalidate
 * @returns Result of the server action
 *
 * @example
 * // Invalidate single cache
 * decacheClientLoader(args, { key: '/api/user' })
 *
 * @example
 * // Invalidate multiple caches
 * decacheClientLoader(args, {
 *   key: ['/api/user', '/api/settings', '/api/profile']
 * })
 */
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
    maxAge = DEFAULT_MAX_AGE,
  } = config;

  const cacheEntry = await adapter.getItem(key);

  const isValidCacheEntry = validateCacheEntry<TData>(cacheEntry);

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
  const isCacheExpired = isMaxAgeExpired(timestamp, storedMaxAge, type);

  if (type === "normal" && !isCacheExpired) {
    return {
      ...cacheData,
      key,
      deferredServerData: undefined,
      serverData: cacheData,
      maxAge: storedMaxAge,
    };
  }

  if (isCacheExpired) {
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
      deferredServerData: type === "swr" ? serverLoader() : undefined,
      key,
      maxAge,
    };
  }

  return {
    ...cacheData,
    serverData: cacheData,
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
  loaderData: TData & CachedData<TData>,
  {
    adapter = cacheAdapter,
  }: { adapter?: CacheAdapter<CacheEntry<TData>> } = {},
) {
  const navigate = useNavigate();
  const [freshData, setFreshData] = useState<TData>(loaderData.serverData);

  useEffect(() => {
    if (!loaderData.deferredServerData) return;

    let isMounted = true;
    loaderData.deferredServerData
      .then((newData) => {
        if (!isMounted) return;
        adapter.setItem(loaderData.key, {
          data: newData,
          timestamp: Date.now(),
          maxAge: loaderData.maxAge,
        });
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
  }, [
    loaderData.deferredServerData,
    loaderData.key,
    adapter,
    navigate,
    loaderData.maxAge,
  ]);

  useEffect(() => {
    setFreshData(loaderData.serverData);
  }, [loaderData.serverData]);
  //
  // useEffect(() => {
  //   if (!isDataChanged(loaderData.serverData, freshData)) return;
  //   setFreshData(loaderData.serverData);
  // }, [loaderData.serverData, freshData]);

  return {
    ...freshData,
    cacheKey: loaderData.key,
    maxAge: loaderData.maxAge,
    invalidate: () => invalidateCache(loaderData.key),
  } as const;
}

// Helper function to check data changes
function isDataChanged<T>(newData: T, oldData: T): boolean {
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

/**
 * Hook providing cache invalidation functionality
 * @returns Object containing invalidateCache function
 */
export const useCacheInvalidator = () => ({
  invalidateCache,
});

function isMaxAgeExpired(
  timestamp: number,
  maxAge: number,
  type?: "swr" | "normal",
): boolean {
  // If it's SWR type, never expire
  if (type === "swr") return false;

  const maxAgeInMs = maxAge * 1000;
  const currentTime = Date.now();
  return currentTime - timestamp > maxAgeInMs;
}
