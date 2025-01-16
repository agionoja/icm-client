import type {
  CacheConfig,
  CachedData,
  CacheEntry,
  RouteClientLoaderArgs,
} from "../types";
import {
  constructKey,
  handleResponse,
  isExpired,
  validateCacheEntry,
} from "../utils";
import { getCacheAdapter } from "./adapters";
import { cacheStateManager } from "./cache-state";

const DEFAULT_MAX_AGE = 60; // 1 minute

/**
 * Creates a wrapped server loader that handles state management and caching
 */
function createWrappedLoader<TData>(
  serverLoader: () => Promise<TData>,
  options: {
    key: string;
    adapter: CacheConfig<CacheEntry<TData>>["adapter"];
    maxAge: number | null;
  },
) {
  const { key, adapter = getCacheAdapter.cacheAdapter, maxAge } = options;

  return async () => {
    try {
      const data = await serverLoader();
      const validData = await handleResponse(data);

      await adapter.setItem(key, {
        data: validData,
        maxAge,
        timestamp: Date.now(),
      });

      cacheStateManager.setState(key, { state: "success", key });
      return validData;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.dir({ cacheError: error }, { depth: null });
      }
      cacheStateManager.setState(key, { state: "error", key });
      throw error;
    }
  };
}

/**
 * Handles fresh data fetching and caching
 */
async function handleFreshFetch<TData extends object>(
  wrappedLoader: () => Promise<TData>,
  options: { key: string; maxAge: number | null },
): Promise<TData & CachedData<TData>> {
  const data = await wrappedLoader();

  return {
    ...data,
    serverData: data,
    deferredServerData: undefined,
    key: options.key,
    maxAge: options.maxAge,
  };
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
    adapter = getCacheAdapter.cacheAdapter, // issues: when wrapped in the root route only memory adapter does swr
    maxAge = type === "swr" ? null : DEFAULT_MAX_AGE,
    revalidate = false,
  } = config;

  cacheStateManager.setState(key, { state: "loading", key });

  const wrappedLoader = createWrappedLoader(serverLoader, {
    key,
    adapter,
    maxAge,
  });

  try {
    const cacheEntry = await adapter.getItem(key);
    const isValidCacheEntry = validateCacheEntry<TData>(cacheEntry);

    // No cache or invalid cache – fetch fresh
    if (!isValidCacheEntry) {
      return handleFreshFetch(wrappedLoader, { key, maxAge });
    }

    const { timestamp, maxAge: storedMaxAge, data: cacheData } = cacheEntry;
    const cacheExpired = isExpired(timestamp, storedMaxAge);
    const shouldRevalidate = cacheExpired || revalidate;

    if (import.meta.env.DEV) {
      console.log({
        isValidCacheEntry,
        cacheExpired,
        revalidate,
        shouldRevalidate,
        type,
        key,
      });
    }
    // Handle SWR background revalidation
    if (type === "swr" && shouldRevalidate) {
      return {
        ...cacheData,
        serverData: cacheData,
        deferredServerData: wrappedLoader(),
        key,
        maxAge: revalidate ? maxAge : storedMaxAge,
      };
    }

    // Handle normal cache revalidation
    if (type === "normal" && shouldRevalidate) {
      return handleFreshFetch(wrappedLoader, {
        key,
        maxAge: revalidate ? maxAge : storedMaxAge,
      });
    }

    // Return valid cache
    cacheStateManager.setState(key, { state: "success", key });
    return {
      ...cacheData,
      serverData: cacheData,
      revalidated: false,
      deferredServerData: type === "swr" ? wrappedLoader() : undefined,
      key,
      maxAge: revalidate ? maxAge : storedMaxAge,
    };
  } catch (error) {
    if (import.meta.env.DEV) {
      console.dir({ cacheError: error }, { depth: null });
    }
    cacheStateManager.setState(key, { state: "error", key });
    throw error;
  }
}
