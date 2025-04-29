import { create, type StoreApi } from 'zustand';
import { devtools } from 'zustand/middleware';
import { persist, type PersistOptions } from 'zustand/middleware/persist';
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
          // Create the base state
          const baseState = {
            _hasHydrated: false,
            setHasHydrated: (hydrated: boolean) => set({ _hasHydrated: hydrated } as Partial<T>),
            isLoading: false,
            error: null,
            setError: (error: string | null) => set((state: T) => ({ ...state, error })),
            clearError: () => set((state: T) => ({ ...state, error: null })),
            setLoading: (isLoading: boolean) => set((state: T) => ({ ...state, isLoading })),
          };

          // Create store-specific state and actions
          const storeState = storeCreator(set, get, api);

          // Merge states
          return {
            ...baseState,
            ...initialState,
            ...storeState,
          } as T;
        },
        {
          name: `hockey-pouches-${name}`,
          version: 1,
          onRehydrateStorage: () => state => {
            // When storage is rehydrated, update the hydration status
            if (state) {
              state.setHasHydrated(true);
            }
          },
          // Skip initial hydration to prevent hydration mismatches
          skipHydration: true,
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
