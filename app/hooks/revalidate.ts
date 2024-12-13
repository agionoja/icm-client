import { useRevalidator } from "react-router";
import { useEffect } from "react";

interface BaseOptions {
  enabled?: boolean;
}

interface IntervalOptions extends BaseOptions {
  interval?: number;
}

export function useRevalidateOnFocus({ enabled = false }: BaseOptions = {}) {
  const { revalidate, state } = useRevalidator();

  useEffect(() => {
    if (!enabled) return;

    const handleFocus = () => revalidate();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [enabled, revalidate]);

  useEffect(() => {
    if (!enabled) return;

    const handleVisibilityChange = () => revalidate();
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [enabled, revalidate]);

  return enabled ? { state } : { state: null };
}

export function useRevalidateOnInterval({
  enabled = false,
  interval = 1000,
}: IntervalOptions = {}) {
  const { revalidate, state } = useRevalidator();

  useEffect(() => {
    if (!enabled) return;

    const intervalId = setInterval(revalidate, interval);

    return () => clearInterval(intervalId);
  }, [enabled, interval, revalidate]);

  return enabled ? { state } : { state: null };
}

export function useRevalidateOnReconnect({
  enabled = false,
}: BaseOptions = {}) {
  const { revalidate, state } = useRevalidator();

  useEffect(() => {
    if (!enabled) return;

    const handleReconnect = () => revalidate();

    window.addEventListener("online", handleReconnect);

    return () => window.removeEventListener("online", handleReconnect);
  }, [enabled, revalidate]);

  return enabled ? { state } : { state: null };
}
