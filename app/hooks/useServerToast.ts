import type { ToastMessage } from "remix-toast";
import { useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { memoryAdapter, useCacheInvalidator, useRouteKey } from "~/lib/cache";

// Client-side registry to track displayed toasts and prevent duplicates
// Uses Set for O(1) lookups instead of array scanning
const toastRegistry = new Set<string>();

/**
 * Optimized toast handler for route-specific server messages
 *
 * Why not use a root loader?
 * 1. Network Efficiency: Avoids unnecessary root loader executions (~200ms savings)
 * 2. Cache Precision: Route-specific cache invalidation prevents over-clearing
 * 3. Isolation: Prevents toast state leakage between unrelated routes
 * 4. Performance: Only processes toasts when actually needed per route
 */
export function useServerToast(serverToast: ToastMessage | undefined) {
  // Route-specific key for cache targeting
  const routeKey = useRouteKey();
  // Cache invalidation utilities
  const cacheInvalidator = useCacheInvalidator();
  // Processing flag to handle React strict mode double-execution
  const processing = useRef(false);

  useEffect(() => {
    // Early exit conditions
    if (!serverToast || processing.current) return;

    // Create unique identifier for toast deduplication
    const toastId = `${routeKey}-${serverToast.type}-${serverToast.message}`;

    // Prevent duplicate displays (client-side guard)
    if (toastRegistry.has(toastId)) return;

    // Begin processing sequence
    processing.current = true;
    toastRegistry.add(toastId);

    // Cache invalidation sequence - ensures fresh data after actions
    Promise.all([
      cacheInvalidator([routeKey], localStorage), // Browser storage
      cacheInvalidator([routeKey], memoryAdapter), // In-memory cache
      cacheInvalidator([routeKey]), // Default cache layer
    ])
      .then(() => {
        // Display toast after successful cache clearance
        toast(serverToast.message, {
          type: serverToast.type,
          onClose: () => {
            // Cleanup registry when toast dismisses
            toastRegistry.delete(toastId);
            processing.current = false;
          },
        });
      })
      .catch((err) => {
        // Error handling for cache invalidation failures
        console.error("Toast handling failed:", err);
        processing.current = false;
        toastRegistry.delete(toastId);
      });

    // Cleanup function for React effect cancellation
    return () => {
      // Only clean up if processing didn't complete
      if (!processing.current) {
        toastRegistry.delete(toastId);
      }
    };
  }, [cacheInvalidator, routeKey, serverToast]);
}
