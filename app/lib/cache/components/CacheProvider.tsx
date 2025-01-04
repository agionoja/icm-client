import React from "react";
import type { CachedData } from "../types";
import {
  useRevalidateOnFocus,
  useRevalidateOnInterval,
  useRevalidateOnReconnect,
  useSwrData,
} from "../hooks";

type MutableRevalidate = {
  revalidate: boolean;
};

type ClientCacheProviderProps<TData> = {
  children: (cachedData: TData) => React.ReactNode;
  focusEnabled?: boolean;
  intervalEnabled?: boolean;
  reconnectEnabled?: boolean;
  mutableRevalidate?: MutableRevalidate;
  interval?: number;
  loaderData: TData | (TData & CachedData<TData>);
};

export function ClientCache<TData extends object>({
  children,
  mutableRevalidate = { revalidate: false },
  focusEnabled = true,
  intervalEnabled = true,
  reconnectEnabled = true,
  interval = 50_000,
  loaderData,
}: ClientCacheProviderProps<TData>) {
  const handleRevalidate = () => {
    mutableRevalidate.revalidate = true;
  };

  const handleRevalidateCleanup = () => {
    mutableRevalidate.revalidate = false;
  };

  useRevalidateOnFocus({
    enabled: focusEnabled,
    onRevalidate: () => handleRevalidate(),
    onCleanup: () => handleRevalidateCleanup(),
  });

  useRevalidateOnInterval({
    enabled: intervalEnabled,
    interval,
    onRevalidate: () => handleRevalidate(),
    onCleanup: () => handleRevalidateCleanup(),
  });

  useRevalidateOnReconnect({
    enabled: reconnectEnabled,
    onRevalidate: () => handleRevalidate(),
    onCleanup: () => handleRevalidateCleanup(),
  });

  const SWR = useSwrData(loaderData);

  return <SWR>{(cachedData) => <>{children(cachedData)}</>}</SWR>;
}
