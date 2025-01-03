import { useEffect, useRef } from "react";
import { useRevalidator } from "react-router";
import type { RevalidateProps } from "./type";

export function useRevalidateOnReconnect({
  enabled = false,
  onRevalidate,
  onCleanup,
}: RevalidateProps = {}) {
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
