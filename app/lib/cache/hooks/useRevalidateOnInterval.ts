import type { RevalidateProps } from "./type";
import { useEffect, useRef } from "react";
import { useRevalidator } from "react-router";

export function useRevalidateOnInterval({
  enabled = false,
  interval = 1000,
  onRevalidate,
  onCleanup,
}: { interval?: number } & RevalidateProps = {}) {
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
