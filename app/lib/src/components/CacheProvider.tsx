import React from "react";
import type { CachedData } from "../types";
import {
  type RevalidateProps,
  useRevalidateOnFocus,
  useRevalidateOnInterval,
  useRevalidateOnReconnect,
} from "../hooks";
import { useSwrData } from "../hooks";

type MutableRevalidate = {
  revalidate: boolean;
};

type ClientCacheProviderProps<TData> = {
  children: (data: TData) => React.ReactNode;
  focusEnabled?: boolean;
  intervalEnabled?: boolean;
  reconnectEnabled?: boolean;
  mutableRevalidate: MutableRevalidate;
  interval?: number;
  loaderData: TData | (TData & CachedData<TData>);
};

export function ClientCacheProvider<TData extends object>({
  children,
  mutableRevalidate,
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

  return <SWR>{(data) => <>{children(data)}</>}</SWR>;
}
