import { create, type StoreApi } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { PersistOptions } from 'zustand/middleware/persist';
import { type BaseState } from './config';
import { useEffect } from 'react';

// Extend the BaseState to include hydration status
export interface HydratedBaseState extends BaseState {
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
}

// Create a type for the store creator function
export type StoreCreator<T extends HydratedBaseState> = (
  set: (partial: Partial<T>) => void,
  get: () => T,
  api: StoreApi<T>
) => Partial<T>;

// Type for the store with persist middleware
type PersistStore<T> = StoreApi<T> & {
  persist?: {
    rehydrate: () => void;
    hasHydrated: () => boolean;
    onHydrate: (fn: (state: T) => void) => void;
    onFinishHydration: (fn: (state: T) => void) => void;
  };
};

// Function to create a store with proper hydration handling
export function createHydratedStore<T extends HydratedBaseState>(
  initialState: Partial<T>,
  name: string,
  storeCreator: StoreCreator<T>
) {
  // Create the store with middleware
  const store = create<T>()(
    devtools(
      persist(
        (set, get, api) => {
          const state: T = {
            _hasHydrated: false,
            setHasHydrated: (hydrated: boolean) => set({ _hasHydrated: hydrated } as Partial<T>),
            isLoading: false,
            error: null,
            setError: (error: string | null) => set((state: T) => ({ ...state, error })),
            clearError: () => set((state: T) => ({ ...state, error: null })),
            setLoading: (isLoading: boolean) => set((state: T) => ({ ...state, isLoading })),
            ...initialState,
            ...storeCreator(set, get, api),
          } as T;
          return state;
        },
        {
          name: `hockey-pouches-${name}`,
          version: 1,
          onRehydrateStorage: () => state => {
            if (state) {
              state.setHasHydrated(true);
            }
          },
          skipHydration: true, // Skip initial hydration to prevent SSR issues
        } as PersistOptions<T, unknown>
      )
    )
  ) as unknown as PersistStore<T>;

  // Create a bound store with selectors
  const boundStore = Object.assign((selector?: (state: T) => unknown) => {
    const state = store.getState();
    return selector ? selector(state) : state;
  }, store);

  return boundStore;
}

// Helper hook to check if a store is hydrated
export function useHydration(store: {
  getState: () => { _hasHydrated: boolean };
  persist?: { rehydrate: () => void };
}) {
  const hasHydrated = store.getState()._hasHydrated;

  useEffect(() => {
    // Trigger rehydration after mount
    if (!hasHydrated && store.persist?.rehydrate) {
      store.persist.rehydrate();
    }
  }, [hasHydrated, store]);

  return hasHydrated;
}
