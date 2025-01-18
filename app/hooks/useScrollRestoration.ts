import { useEffect, useRef } from "react";
import { useLocation } from "react-router";

interface ScrollRestorationOptions {
  /**
   * Unique ID for this scroll position instance
   */
  key: string;
  /**
   * Whether to restore scroll on mount
   * @default true
   */
  restoreOnMount?: boolean;
  /**
   * Dependencies that should trigger scroll restoration
   * @default []
   */
  dependencies?: any[];
}

export function useScrollPosition({
  key,
  restoreOnMount = true,
  dependencies = [],
}: ScrollRestorationOptions) {
  const location = useLocation();
  const scrollPositionRef = useRef<number>(0);
  const elementRef = useRef<HTMLElement>(null);

  // Save scroll position before navigation
  useEffect(() => {
    const handleScroll = () => {
      // Store both window and element scroll positions
      const position = {
        window: window.scrollY,
        element: elementRef.current?.scrollTop ?? 0,
      };
      scrollPositionRef.current = position.window;
      sessionStorage.setItem(
        `scroll-position-${key}`,
        JSON.stringify(position),
      );
    };

    window.addEventListener("scroll", handleScroll);
    elementRef.current?.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      elementRef.current?.removeEventListener("scroll", handleScroll);
    };
  }, [key]);

  // Restore scroll position
  useEffect(() => {
    if (!restoreOnMount) return;

    const savedPosition = sessionStorage.getItem(`scroll-position-${key}`);
    if (savedPosition) {
      const position = JSON.parse(savedPosition);
      requestAnimationFrame(() => {
        // Restore window scroll
        window.scrollTo({
          top: position.window,
          behavior: "instant",
        });
        // Restore element scroll if applicable
        if (elementRef.current && position.element) {
          elementRef.current.scrollTop = position.element;
        }
      });
    }
  }, [location.search, key, restoreOnMount, ...dependencies]);

  return elementRef;
}
