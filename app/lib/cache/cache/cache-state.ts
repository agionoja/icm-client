import { useEffect, useState } from "react";
import { useRouteKey } from "../utils";

/**
 * Represents the possible states of a cache operation
 * @property state - Current state of the cache operation
 * @property key - Unique identifier for the cache operation
 * @property timestamp - When the state was last updated
 */
export type CacheState = {
  state: "idle" | "loading" | "success" | "error";
  key: string | null;
  timestamp?: number;
};

/**
 * Manages cache operation states across an application
 *
 * This class provides a centralized way to track the state of cache operations,
 * allowing both React and non-React code to subscribe to state changes.
 *
 * @example
 * ```typescript
 * // Create a new instance
 * const manager = new CacheStateManager();
 *
 * // Update state for a cache operation
 * manager.setState('users', { state: 'loading' });
 *
 * // Subscribe to changes
 * const unsubscribe = manager.subscribe('users', (state) => {
 *   console.log('Users cache state:', state);
 * });
 *
 * // Later: cleanup subscription
 * unsubscribe();
 * ```
 */
class CacheStateManager {
  /**
   * Stores the current state for each cache key
   * @private
   */
  private readonly states: Map<string, CacheState>;

  /**
   * Stores subscriber callbacks for each cache key
   * @private
   */
  private readonly listeners: Map<string, Set<(state: CacheState) => void>>;

  constructor() {
    this.states = new Map();
    this.listeners = new Map();
  }

  /**
   * Retrieves the current state for a given cache key
   *
   * @param key - The cache key to get state for
   * @returns The current state or a default idle state if none exists
   *
   * @example
   * ```typescript
   * const state = manager.getState('users');
   * if (state.state === 'loading') {
   *   showLoadingSpinner();
   * }
   * ```
   */
  getState(key: string): CacheState {
    return this.states.get(key) || { state: "idle", key: null };
  }

  /**
   * Updates the state for a given cache key
   *
   * This will merge the new state with the existing state and notify all subscribers
   * of the change.
   *
   * @param key - The cache key to update state for
   * @param newState - Partial state to merge with existing state
   *
   * @example
   * ```typescript
   * // Start loading
   * manager.setState('users', { state: 'loading' });
   *
   * try {
   *   await fetchUsers();
   *   manager.setState('users', { state: 'success' });
   * } catch (error) {
   *   manager.setState('users', { state: 'error' });
   * }
   * ```
   */
  setState(key: string, newState: Partial<CacheState>): void {
    const currentState = this.getState(key);
    const updatedState = {
      ...currentState,
      ...newState,
      timestamp: Date.now(),
    };

    this.states.set(key, updatedState);
    this.notifyListeners(key, updatedState);
  }

  /**
   * Subscribes to state changes for a specific cache key
   *
   * @param key - The cache key to subscribe to
   * @param listener - Callback function that receives state updates
   * @returns Function that when called will unsubscribe the listener
   *
   * @example
   * ```typescript
   * // Basic subscription with cleanup
   * const cleanup = manager.subscribe('users', (state) => {
   *   console.log('State changed:', state);
   * });
   * cleanup(); // Call this to unsubscribe
   *
   * // In React useEffect (direct return)
   * useEffect(() =>
   *   cacheStateManager.subscribe('users', (state) => {
   *     setLoading(state.state === 'loading');
   *   })
   * , []);
   * ```
   */
  subscribe(key: string, listener: (state: CacheState) => void): () => void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }

    this.listeners.get(key)?.add(listener);

    return () => {
      this.listeners.get(key)?.delete(listener);
    };
  }

  /**
   * Notifies all subscribers of a state change
   * @private
   */
  private notifyListeners(key: string, state: CacheState): void {
    this.listeners.get(key)?.forEach((listener) => listener(state));
  }
}

/**
 * Singleton instance of CacheStateManager
 * @example
 * ```typescript
 * // In your cache loader
 * cacheStateManager.setState('users', { state: 'loading' });
 *
 * // In your components
 * const state = useCacheState('users');
 * ```
 */
export const cacheStateManager = new CacheStateManager();

/**
 * React hook for subscribing to cache state changes
 *
 * @param key - The cache key to subscribe to
 * @returns The current state for the given key
 *
 * @example
 * ```typescript
 * function LoadingIndicator() {
 *   const state = useCacheState('users');
 *   return state?.state === 'loading' ? <Spinner /> : null;
 * }
 * ```
 */
export function useCacheState(key?: string) {
  const fallbackKey = useRouteKey();
  const [state, setState] = useState<CacheState>({
    state: "idle",
    key: key || fallbackKey,
  });

  useEffect(
    () =>
      // Directly return the cleanup function from subscribe
      cacheStateManager.subscribe(key || fallbackKey, setState),
    [fallbackKey, key],
  );

  return state;
}
