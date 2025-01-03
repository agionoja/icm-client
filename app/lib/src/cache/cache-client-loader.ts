import type {
  CacheConfig,
  CachedData,
  CacheEntry,
  RouteClientLoaderArgs,
} from "../types";
import {
  constructKey,
  handleResponse,
  isState,
  validateCacheEntry,
} from "../utils";
import { getCacheAdapter } from "./adapters";
import { cacheStateManager } from "./cache-state";

/**
 *
 * Default maximum age for cache entries in seconds (5 minutes)
 */
const DEFAULT_MAX_AGE = 60; // 1 minute;

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

  // Set initial loading state
  cacheStateManager.setState(key, { state: "loading", key });
  try {
    // Try to get from cache first
    const cacheEntry = await adapter.getItem(key);
    const isValidCacheEntry = validateCacheEntry<TData>(cacheEntry);

    // No cache or invalid cache - need to fetch fresh
    if (!isValidCacheEntry) {
      const data = await serverLoader();
      const validData = await handleResponse(data);

      await adapter.setItem(key, {
        data: validData,
        maxAge,
        timestamp: Date.now(),
      });

      // Set success state
      cacheStateManager.setState(key, { state: "success", key });

      return {
        ...validData,
        serverData: validData,
        deferredServerData: undefined,
        key,
        maxAge,
      };
    }

    const { timestamp, maxAge: storedMaxAge, data: cacheData } = cacheEntry;
    const cacheExpired = isState(timestamp, storedMaxAge, type);
    const shouldRevalidate = cacheExpired || revalidate;

    console.log({ revalidate, cacheExpired, shouldRevalidate, key });

    // For SWR - return cache immediately but revalidate in background
    if (type === "swr" && shouldRevalidate) {
      return {
        ...cacheData,
        serverData: cacheData,
        deferredServerData: serverLoader(), // Background fetch
        key,
        maxAge: storedMaxAge,
      };
    }

    // For normal caching - wait for fresh data if needed
    if (type === "normal" && shouldRevalidate) {
      const data = await serverLoader();
      const validData = await handleResponse(data);

      await adapter.setItem(key, {
        data: validData,
        maxAge,
        timestamp: Date.now(),
      });

      cacheStateManager.setState(key, { state: "success", key });

      return {
        ...validData,
        serverData: validData,
        deferredServerData: undefined,
        key,
        maxAge,
      };
    }

    // Cache is still valid - return it
    cacheStateManager.setState(key, { state: "success", key });

    return {
      ...cacheData,
      serverData: cacheData,
      revalidated: false,
      deferredServerData: type === "swr" ? serverLoader() : undefined,
      key,
      maxAge: storedMaxAge,
    };
  } catch (error) {
    // Set error state if anything fails
    cacheStateManager.setState(key, { state: "error", key });
    throw error;
  }
}
