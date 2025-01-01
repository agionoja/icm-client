import React, { useEffect, useState } from "react";
import { Await, useNavigate } from "react-router";

const DEFAULT_MAX_AGE = 60 * 5; // 5 minutes in seconds

// Cache entry interface to store data with timestamp
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  maxAge: number;
}

// Basic clientCache adapter interface
export interface CacheAdapter {
  getItem: (key: string) => any | Promise<any>;
  setItem: (key: string, value: any, maxAge?: number) => Promise<any> | any;
  removeItem: (key: string) => Promise<any> | any;
}

export interface RouteClientLoaderArgs<TServerData> {
  request: Request;
  serverLoader: () => Promise<TServerData>;
}

export interface RouteClientActionArgs<TServerData> {
  request: Request;
  serverAction: () => Promise<TServerData>;
}

// Cache configuration types
export interface CacheConfig {
  type?: "swr" | "normal";
  key?: string;
  maxAge?: number;
  adapter?: CacheAdapter;
}

export interface CachedData<TData> {
  serverData: TData;
  deferredServerData?: Promise<TData>;
  key: string;
}

const map = new Map();

// Default in-memory clientCache implementation with maxAge support
export let clientCache: CacheAdapter = {
  getItem: async (key) => {
    const entry = map.get(key) as CacheEntry<any> | undefined;
    if (!entry) return null;

    const isExpired = isMaxAgeExpired(entry.timestamp, entry.maxAge);
    if (isExpired) {
      map.delete(key);
      return null;
    }

    return entry.data;
  },
  setItem: async (key, val, maxAge = DEFAULT_MAX_AGE) => {
    const entry: CacheEntry<any> = {
      data: val,
      timestamp: Date.now(),
      maxAge,
    };
    map.set(key, entry);
  },
  removeItem: async (key) => map.delete(key),
};

// Storage adapter augmentation with maxAge support
const augmentStorageAdapter = (storage: Storage): CacheAdapter => {
  return {
    getItem: async (key: string) => {
      try {
        const item = storage.getItem(key);
        if (!item) return null;

        const cacheEntry = JSON.parse(item) as CacheEntry<any>;
        if (isMaxAgeExpired(cacheEntry.timestamp, cacheEntry.maxAge)) {
          storage.removeItem(key);
          return null;
        }

        return cacheEntry.data;
      } catch (e) {
        console.error(e);
        return null;
      }
    },
    setItem: async (key: string, val: any, maxAge = DEFAULT_MAX_AGE) => {
      const cacheEntry: CacheEntry<any> = {
        data: val,
        timestamp: Date.now(),
        maxAge,
      };
      storage.setItem(key, JSON.stringify(cacheEntry));
    },
    removeItem: async (key: string) => storage.removeItem(key),
  };
};

export const createCacheAdapter = (adapter: () => CacheAdapter | Storage) => {
  if (typeof document === "undefined") return { adapter: undefined };
  const adapterInstance = adapter();
  return adapterInstance instanceof Storage
    ? { adapter: augmentStorageAdapter(adapterInstance) }
    : { adapter: adapterInstance };
};

export const configureGlobalCache = (
  newCacheInstance: () => CacheAdapter | Storage,
) => {
  if (typeof document === "undefined") return;
  const newCache = newCacheInstance();
  clientCache =
    newCache instanceof Storage ? augmentStorageAdapter(newCache) : newCache;
};

// Type-safe clientCache operations
export const decacheClientLoader = async <TData,>(
  { request, serverAction }: RouteClientActionArgs<TData>,
  {
    key = constructKey(request),
    adapter = clientCache,
  }: Partial<CacheConfig> = {},
): Promise<TData> => {
  const data = await serverAction();
  await adapter.removeItem(key);
  return data;
};

export const cacheClientLoader = async <TData,>(
  { request, serverLoader }: RouteClientLoaderArgs<TData>,
  config: CacheConfig = {},
): Promise<TData & CachedData<TData>> => {
  const {
    type = "swr",
    key = constructKey(request),
    adapter = clientCache,
    maxAge = DEFAULT_MAX_AGE,
  } = config;

  const existingData = await adapter.getItem(key);
  const isExistingData = isNotEmptyObject(existingData?.data);

  console.log({ isExistingData, existingData });

  if (type === "normal" && isExistingData) {
    return {
      ...existingData,
      serverData: existingData as TData,
      deferredServerData: undefined,
      key,
    };
  }

  const data = isExistingData ? existingData : await serverLoader();
  await adapter.setItem(key, data, maxAge);

  return {
    ...(data ?? existingData),
    serverData: data as TData,
    deferredServerData: existingData ? serverLoader() : undefined,
    key,
  };
};

export function useCachedLoaderData<TData>(
  loaderData: CachedData<TData>,
  { adapter = clientCache }: { adapter?: CacheAdapter } = {
    adapter: clientCache,
  },
) {
  const navigate = useNavigate();
  const [freshData, setFreshData] = useState<TData>(loaderData.serverData);

  // Unpack deferred data from the server
  useEffect(() => {
    let isMounted = true;
    if (loaderData.deferredServerData) {
      loaderData.deferredServerData
        .then((newData) => {
          if (isMounted) {
            adapter.setItem(loaderData.key, newData);
            setFreshData(newData);
          }
        })
        .catch((e: unknown) => {
          if (e instanceof Response && e.status === 302) {
            const to = e.headers.get("Location");
            to && navigate(to);
          } else {
            throw e;
          }
        });
    }
    return () => {
      isMounted = false;
    };
  }, [loaderData, adapter, navigate]);

  useEffect(() => {
    if (
      loaderData.serverData &&
      JSON.stringify(loaderData.serverData) !== JSON.stringify(freshData)
    ) {
      setFreshData(loaderData.serverData);
    }
  }, [loaderData.serverData, freshData]);

  return {
    ...freshData,
    cacheKey: loaderData.key,
    invalidate: () => invalidateCache(loaderData.key),
  } as TData & {
    cacheKey: string;
    invalidate: () => Promise<void>;
  };
}

export function useSwrData<TData>(data: CachedData<TData>) {
  return function SWR({
    children,
  }: {
    children: (data: TData) => React.ReactElement;
  }) {
    return (
      <>
        {data.deferredServerData ? (
          <React.Suspense fallback={children(data.serverData)}>
            <Await resolve={data.deferredServerData}>{children}</Await>
          </React.Suspense>
        ) : (
          children(data.serverData)
        )}
      </>
    );
  };
}

const constructKey = (request: Request) => {
  const url = new URL(request.url);
  return url.pathname + url.search + url.hash;
};

export const invalidateCache = async (key: string | string[]) => {
  const keys = Array.isArray(key) ? key : [key];
  for (const k of keys) {
    await clientCache.removeItem(k);
  }
};

export const useCacheInvalidator = () => ({
  invalidateCache,
});

function isNotEmptyObject<T extends object | null>(object?: T): boolean {
  if (!object) return false;
  return Object.keys(object).length > 0;
}

function isMaxAgeExpired(timestamp: number, maxAge: number): boolean {
  const maxAgeInMs = maxAge * 1000;
  const currentTime = Date.now();
  return currentTime - timestamp > maxAgeInMs;
}
