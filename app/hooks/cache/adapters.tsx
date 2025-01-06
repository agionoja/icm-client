import type { CacheAdapter, CacheEntry } from "~/hooks/cache/types";

const Cache = new Map();

export const cacheAdapter: CacheAdapter<CacheEntry<any>> = {
  getItem: async (key) => Cache.get(key),
  setItem: async (key, value) => Cache.set(key, value),
  removeItem: async (key) => Cache.delete(key),
  clear: async () => Cache.clear(),
};

export const getCacheAdapter = { cacheAdapter };

export const MEMORY_STORE = new Map();

/**
 * Immutable memory cache adapter for handling Promise-containing data
 * Useful when caching data that cannot be serialized (e.g., Promises, Functions)
 *
 * @example
 * ```ts
 * import { memoryAdapter } from './cache-adapters';
 *
 * const loader = async ({ request }) => {
 *   return cache({ request, serverLoader }, {
 *     adapter: memoryAdapter,
 *     type: 'swr'
 *   });
 * };
 * ```
 */
export const memoryAdapter: CacheAdapter<any> = {
  getItem: async (key) => MEMORY_STORE.get(key) ?? null,
  setItem: async (key, value) => {
    MEMORY_STORE.set(key, { ...value });
  },
  removeItem: async (key) => {
    MEMORY_STORE.delete(key);
  },

  clear: async () => MEMORY_STORE.clear(),
};

export function memoryAdapterFactory<T>(): CacheAdapter<CacheEntry<T>> {
  return memoryAdapter;
}
