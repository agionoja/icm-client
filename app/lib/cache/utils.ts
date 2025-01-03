import type { Location } from "react-router";
import { cacheAdapter } from "~/lib/cache/adapters";

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
