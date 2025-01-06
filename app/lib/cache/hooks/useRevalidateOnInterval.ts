import type { RevalidateProps } from "./type";
import { useEffect, useRef } from "react";
import { useRevalidator } from "react-router";

type Interval = {
  //The interval for revalidation seconds
  interval?: number;
};

export function useRevalidateOnInterval({
  enabled = false,
  interval = 60,
  onRevalidate,
  onCleanup,
}: Interval & RevalidateProps = {}) {
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
    }, interval * 1000);

    return () => {
      isMounted.current = false;
      clearInterval(intervalId);
      onCleanup?.();
    };
  }, [enabled, interval, revalidate, onRevalidate, onCleanup]);
}
