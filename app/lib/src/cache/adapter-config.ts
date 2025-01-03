import type {
  CacheAdapter,
  CacheEntry,
  DecacheConfig,
  RouteClientActionArgs,
} from "../types";
import { getCacheAdapter } from "./adapters";
import { constructKey, dateReviver, invalidateCache } from "../utils";

/**
 * Configures the global cache instance
 * @param newCacheInstance Factory function that returns a cache adapter or Storage object
 */
export const configureGlobalCache = (
  newCacheInstance: () => CacheAdapter<CacheEntry<any>> | Storage,
) => {
  if (typeof document === "undefined") return;
  const newCache = newCacheInstance();

  if (newCache instanceof Storage) {
    getCacheAdapter.cacheAdapter = augmentStorageAdapter(newCache);
    return;
  }
  if (newCache) {
    getCacheAdapter.cacheAdapter = newCache;
  }
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
 * decacheClientLoader(args, { key: '/amin/users' })
 *
 * @example
 * // Invalidate multiple caches
 * decacheClientLoader(args, {
 *   key: ['/admin/dashboard', '/api/settings', '/api/profile']
 * })
 */

/**
 * Creates a storage adapter from a standard Web Storage object
 * @template T The type of data being cached
 * @param storage Web Storage object (localStorage/sessionStorage)
 * @returns Cache adapter for the storage
 */
export function augmentStorageAdapter<T>(
  storage: Storage,
): CacheAdapter<CacheEntry<T>> {
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
    setItem: async (key, value) => storage.setItem(key, JSON.stringify(value)),
    removeItem: async (key) => storage.removeItem(key),
    clear: async () => storage.clear(),
  };
}

/**
 * Creates a new cache adapter instance
 * @param adapter Factory function that returns a cache adapter
 * @returns Object containing the configured adapter
 */
export function createCacheAdapter<T>(
  adapter: () => CacheAdapter<CacheEntry<T>>,
) {
  if (typeof document === "undefined") return { adapter: undefined };
  const adapterInstance = adapter();
  if (adapterInstance instanceof Storage) {
    return {
      adapter: augmentStorageAdapter(adapterInstance),
    };
  }
  return {
    adapter: adapter(),
  };
}

export const decacheClientLoader = async <TData>(
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
