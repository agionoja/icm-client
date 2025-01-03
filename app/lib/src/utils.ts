import { type Location, useLocation } from "react-router";
import { cacheAdapter } from "./cache";
import type { CacheConfig, CacheEntry } from "./types";
import { z } from "zod";

export function isRedirect(response: Response): boolean {
  return response.status >= 300 && response.status < 400;
}

export function isRouteError(response: Response): boolean {
  return response.status >= 400 && response.status < 600;
}

export function isResponse(value: unknown): value is Response {
  return value instanceof Response;
}

export async function handleResponse<T>(data: T | Response) {
  if (isResponse(data)) {
    if (isRedirect(data) || isRouteError(data)) {
      throw data;
    }
  }
  return data as T;
}

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

export function dateReviver(_key: string, value: any): any {
  if (typeof value !== "string") {
    return value;
  }

  const msDatePattern = /^\/Date\((\d+)\)\/$/;
  const msMatch = msDatePattern.exec(value);
  if (msMatch) {
    return new Date(+msMatch[1]);
  }

  const isoPattern =
    /^(\d{4}-\d{2}-\d{2})(T(\d{2}:?\d{2}:?\d{2})(.\d{1,3})?Z?)?$/;
  const isoMatch = isoPattern.exec(value);
  if (isoMatch) {
    const parsedDate = new Date(value);
    return isNaN(parsedDate.getTime()) ? value : parsedDate;
  }

  return value;
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

export function isState(
  timestamp: number,
  maxAge: number | null,
  type: CacheConfig<any>["type"],
): boolean {
  if (!maxAge && type === "swr") return true;
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
