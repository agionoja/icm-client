import type { RevalidateProps } from "./type";
import { useRevalidator } from "react-router";
import { useEffect, useRef } from "react";

export function useRevalidateOnFocus({
  enabled = false,
  onRevalidate,

  onCleanup,
}: RevalidateProps = {}) {
  const { revalidate } = useRevalidator();
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;

    if (!enabled) return;

    // Add debounce to handle multiple rapid events
    let revalidateTimeout: NodeJS.Timeout;

    const handleFocus = () => {
      if (isMounted.current) {
        // Clear any pending revalidation
        clearTimeout(revalidateTimeout);

        // Debounce the revalidation
        revalidateTimeout = setTimeout(() => {
          revalidate().catch((err) => {
            // Only log if still mounted and it's not a navigation abort
            if (isMounted.current && err.name !== "DOMException") {
              console.error(err);
            }
          });
          onRevalidate?.();
        }, 500);
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleFocus);

    return () => {
      isMounted.current = false;
      clearTimeout(revalidateTimeout);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleFocus);
      onCleanup?.();
    };
  }, [enabled, revalidate, onRevalidate, onCleanup]);
}
