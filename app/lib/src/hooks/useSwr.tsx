import type { CachedData } from "../types";
import React from "react";
import { Await } from "react-router";
import { cacheStateManager } from "../cache/cache-state";

export function useSwrData<TData extends object>(
  loaderData: TData | (TData & CachedData<TData>),
) {
  return function SWR({
    children,
  }: {
    children: (data: TData) => React.ReactElement;
  }) {
    // Type guard to narrow down the type
    const isCachedData = (value: any): value is CachedData<TData> => {
      return "deferredServerData" in value && "serverData" in value;
    };

    if (isCachedData(loaderData)) {
      const { deferredServerData, serverData } = loaderData;

      return (
        <>
          {deferredServerData ? (
            <React.Suspense fallback={children(serverData)}>
              <Await resolve={deferredServerData}>
                {(resolvedData) => {
                  cacheStateManager.setState(loaderData.key, {
                    state: "success",
                    key: loaderData.key,
                  });
                  return children(resolvedData);
                }}
              </Await>
            </React.Suspense>
          ) : (
            children(serverData)
          )}
        </>
      );
    }

    // Fallback for plain TData
    return <>{children(loaderData)}</>;
  };
}
