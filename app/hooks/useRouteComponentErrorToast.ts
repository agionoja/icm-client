import type { IApiException } from "icm-shared";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { memoryAdapter, useCacheInvalidator, useRouteKey } from "~/lib/cache";

export function useRouteComponentErrorToast(
  error: Pick<IApiException, "message"> | null,
) {
  const routeKey = useRouteKey();
  const cacheInvalidator = useCacheInvalidator();

  useEffect(() => {
    if (error) {
      Promise.all([
        cacheInvalidator([routeKey], localStorage),
        cacheInvalidator([routeKey], memoryAdapter),
        cacheInvalidator([routeKey]), // clears the default adapter,
      ]).then(() => {
        toast(error.message, { type: "error" });
      });
    }
  }, [cacheInvalidator, error, routeKey]);
}
