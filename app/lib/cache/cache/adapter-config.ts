import type {
  CacheAdapter,
  CacheEntry,
  DecacheConfig,
  RouteClientActionArgs,
} from "../types";
import { getCacheAdapter } from "./adapters";
import { constructKey, dateReviver, invalidateCache } from "../utils";
import { useEffect, useState } from "react";

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

const storageClearListeners = new Set<() => void>();
let storageClearCount = 0;

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
    setItem: async (key, value) => {
      try {
        storage.setItem(key, JSON.stringify(value));
      } catch (error) {
        // Handle both localStorage/sessionStorage and IndexedDB quota errors
        if (
          error instanceof Error &&
          (error.name === "QuotaExceededError" || // localStorage/sessionStorage
            error.name === "DatabaseFullError") // IndexedDB
        ) {
          storage.clear();
          storageClearCount++;
          storageClearListeners.forEach((listener) => listener());
          try {
            storage.setItem(key, JSON.stringify(value));
          } catch (retryError) {
            console.warn("Storage failed even after cleanup:", retryError);
            throw retryError;
          }
        } else {
          throw error;
        }
      }
    },
    removeItem: async (key) => storage.removeItem(key),
    clear: async () => storage.clear(),
  };
}

// Hook to detect storage clears
export function useStorageCleared() {
  const [clearCount, setClearCount] = useState(storageClearCount);

  useEffect(() => {
    const listener = () => setClearCount(storageClearCount);
    storageClearListeners.add(listener);
    return () => {
      storageClearListeners.delete(listener);
    };
  }, []);

  return clearCount;
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

  adapters: Array<CacheAdapter<CacheEntry<TData>> | Storage> = [
    getCacheAdapter.cacheAdapter,
  ],
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
