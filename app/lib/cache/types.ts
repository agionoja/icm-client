/**
 * Represents a single entry in the cache
 * @template T The type of data being cached
 */

export interface CacheEntry<T> {
  /** The cached data */
  data: T;
  /** Timestamp when the entry was created */
  timestamp: number;
  /** Maximum age of the cache entry in seconds */
  maxAge: number | null;

  // state: "pending" | "loading" | "idle";
}

/**
 * Extended data type including cache metadata
 * @template TData The type of data being cached
 */
export interface CachedData<TData>
  extends Pick<Required<CacheConfig<TData>>, "maxAge" | "key"> {
  /** Original server data */
  serverData: TData;
  /** Promise for background data revalidation */
  deferredServerData?: Promise<TData>;
}

/**
 * Configuration options for cache behavior
 * @template T The type of data being cached
 */
export interface CacheConfig<T> {
  /** Cache strategy - 'swr' (Stale-While-Revalidate) or 'normal' */
  type?: "swr" | "normal";
  /** Time in seconds before cache entry expires */
  maxAge?: number | null;
  /** Custom cache key */
  key?: string;
  /** Custom cache storage adapter */
  adapter?: CacheAdapter<T>;

  revalidate?: boolean;
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

  clear: () => Promise<void>;
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
 * Configuration for cache invalidation
 * @template T The type of data being cached
 */
export type DecacheConfig<T> = Pick<CacheConfig<CacheEntry<T>>, "adapter"> & {
  key?: string | string[];
};
