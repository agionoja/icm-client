import { useRevalidator } from "react-router";
import { useEffect, useRef } from "react";

interface BaseOptions {
  enabled?: boolean;
  onRevalidate?: () => void;
  onCleanup?: () => void;
}

interface IntervalOptions extends BaseOptions {
  interval?: number;
}

export function useRevalidateOnFocus({
  enabled = false,
  onRevalidate,
  onCleanup,
}: BaseOptions = {}) {
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

export function useRevalidateOnInterval({
  enabled = false,
  interval = 1000,
  onRevalidate,
  onCleanup,
}: IntervalOptions = {}) {
  const { revalidate } = useRevalidator();
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;

    if (!enabled) return;

    const intervalId = setInterval(() => {
      if (isMounted.current) {
        revalidate().catch((err) => console.error(err));
        onRevalidate?.();
      }
    }, interval);

    return () => {
      isMounted.current = false;
      clearInterval(intervalId);
      onCleanup?.();
    };
  }, [enabled, interval, revalidate, onRevalidate, onCleanup]);
}

export function useRevalidateOnReconnect({
  enabled = false,
  onRevalidate,
  onCleanup,
}: BaseOptions = {}) {
  const { revalidate } = useRevalidator();
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;

    if (!enabled) return;

    const handleReconnect = () => {
      if (isMounted.current) {
        revalidate().catch((err) => console.error(err));
        onRevalidate?.();
      }
    };

    window.addEventListener("online", handleReconnect);

    return () => {
      isMounted.current = false;
      window.removeEventListener("online", handleReconnect);
      onCleanup?.();
    };
  }, [enabled, revalidate, onRevalidate, onCleanup]);
}
