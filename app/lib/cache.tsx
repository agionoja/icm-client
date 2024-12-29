import React, { useEffect, useState } from "react";
import { Await, useNavigate } from "react-router";

// Basic cache adapter interface

export interface CacheAdapter {
  getItem: (key: string) => any | Promise<any>;
  setItem: (key: string, value: any) => Promise<any> | any;
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
  adapter?: CacheAdapter;
}

export interface CachedData<TData> {
  serverData: TData;
  deferredServerData?: Promise<TData>;
  key: string;
}

const map = new Map();

// Default in-memory cache implementation
export let cache: CacheAdapter = {
  getItem: async (key) => map.get(key),
  setItem: async (key, val) => map.set(key, val),
  removeItem: async (key) => map.delete(key),
};

// Storage adapter augmentation
const augmentStorageAdapter = (storage: Storage): CacheAdapter => {
  return {
    getItem: async (key: string) => {
      try {
        return JSON.parse(storage.getItem(key) || "");
      } catch (e) {
        console.error(e);
        return storage.getItem(key);
      }
    },
    setItem: async (key: string, val: any) =>
      storage.setItem(key, JSON.stringify(val)),
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
  cache =
    newCache instanceof Storage ? augmentStorageAdapter(newCache) : newCache;
};

// Type-safe cache operations
export const decacheClientLoader = async <TData,>(
  { request, serverAction }: RouteClientActionArgs<TData>,
  { key = constructKey(request), adapter = cache }: Partial<CacheConfig> = {},
): Promise<TData> => {
  const data = await serverAction();
  await adapter.removeItem(key);
  return data;
};

export const cacheClientLoader = async <TData,>(
  { request, serverLoader }: RouteClientLoaderArgs<TData>,
  config: CacheConfig = {},
): Promise<TData & CachedData<TData>> => {
  const { type = "swr", key = constructKey(request), adapter = cache } = config;

  const existingData = await adapter.getItem(key);

  if (type === "normal" && existingData) {
    return {
      ...existingData,
      serverData: existingData as TData,
      deferredServerData: undefined,
      key,
    };
  }

  const data = existingData || (await serverLoader());
  await adapter.setItem(key, data);

  return {
    ...(data ?? existingData),
    serverData: data as TData,
    deferredServerData: existingData ? serverLoader() : undefined,
    key,
  };
};

// First, modify the hook to accept data as a parameter
export function useCachedLoaderData<TData>(
  loaderData: TData,
  { adapter = cache }: { adapter?: CacheAdapter } = { adapter: cache },
) {
  const typedLoaderData = loaderData as CachedData<TData>; // Assert the type here
  const navigate = useNavigate();
  const [freshData, setFreshData] = useState<TData>(typedLoaderData.serverData);

  useEffect(() => {
    let isMounted = true;
    if (typedLoaderData.deferredServerData) {
      typedLoaderData.deferredServerData
        .then((newData: TData) => {
          if (isMounted) {
            adapter.setItem(typedLoaderData.key, newData);
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
  }, [typedLoaderData, adapter, navigate]);

  useEffect(() => {
    if (
      typedLoaderData.serverData &&
      JSON.stringify(typedLoaderData.serverData) !== JSON.stringify(freshData)
    ) {
      setFreshData(typedLoaderData.serverData);
    }
  }, [typedLoaderData.serverData, freshData]);

  return {
    ...freshData,
    cacheKey: typedLoaderData.key,
    invalidate: () => invalidateCache(typedLoaderData.key),
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
    await cache.removeItem(k);
  }
};

export const useCacheInvalidator = () => ({
  invalidateCache,
});
