import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { logger } from './middleware/logger';
import { createSelectors } from './utils/selector';

// Define base types for our store
export interface BaseState {
  isLoading: boolean;
  error: string | null;
  setError: (error: string | null) => void;
  clearError: () => void;
  setLoading: (isLoading: boolean) => void;
}

// Create the base store with common functionality
export const createStore = <T extends BaseState>(initialState: Partial<T>, name: string) => {
  const store = create<T>()(
    devtools(
      persist(
        logger(
          set =>
            ({
              isLoading: false,
              error: null,
              setError: (error: string | null) => set(state => ({ ...state, error })),
              clearError: () => set(state => ({ ...state, error: null })),
              setLoading: (isLoading: boolean) => set(state => ({ ...state, isLoading })),
              ...initialState,
            }) as T
        ),
        {
          name: `hockey-pouches-${name}`,
          version: 1,
        }
      )
    )
  );

  return createSelectors(store);
};
