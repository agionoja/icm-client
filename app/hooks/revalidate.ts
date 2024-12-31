import { useRevalidator } from "react-router";
import { useEffect } from "react";

interface BaseOptions {
  enabled?: boolean;
  onRevalidate?: () => void;
}

interface IntervalOptions extends BaseOptions {
  interval?: number;
}

export function useRevalidateOnFocus({
  enabled = false,
  onRevalidate,
}: BaseOptions = {}) {
  const { revalidate, state } = useRevalidator();

  useEffect(() => {
    if (!enabled) return;

    const handleFocus = () => {
      revalidate();
      onRevalidate?.();
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [enabled, revalidate, onRevalidate]);

  useEffect(() => {
    if (!enabled) return;

    const handleVisibilityChange = () => {
      revalidate();
      onRevalidate?.();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [enabled, revalidate, onRevalidate]);

  return enabled ? { state } : { state: null };
}

export function useRevalidateOnInterval({
  enabled = false,
  interval = 1000,
  onRevalidate,
}: IntervalOptions = {}) {
  const { revalidate, state } = useRevalidator();

  useEffect(() => {
    if (!enabled) return;

    const intervalId = setInterval(() => {
      revalidate();
      onRevalidate?.();
    }, interval);

    return () => clearInterval(intervalId);
  }, [enabled, interval, revalidate, onRevalidate]);

  return enabled ? { state } : { state: null };
}

export function useRevalidateOnReconnect({
  enabled = false,
  onRevalidate,
}: BaseOptions = {}) {
  const { revalidate, state } = useRevalidator();

  useEffect(() => {
    if (!enabled) return;

    const handleReconnect = () => {
      revalidate();
      onRevalidate?.();
    };

    window.addEventListener("online", handleReconnect);

    return () => window.removeEventListener("online", handleReconnect);
  }, [enabled, revalidate, onRevalidate]);

  return enabled ? { state } : { state: null };
}
