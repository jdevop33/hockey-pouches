import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { logger } from './middleware/logger';
import { createSelectors } from './utils/selector';

// Main store exports
export * from './slices/cartStore';
export * from './slices/productStore';
export * from './slices/uiStore';
export * from './slices/authStore';

// Define base types for our store
export interface BaseState {
  isLoading: boolean;
  error: string | null;
  setError: (error: string | null) => void;
  clearError: () => void;
  setLoading: (isLoading: boolean) => void;
}

// Create the base store with common functionality
const createBaseStore = <T extends BaseState>(
  initialState: Partial<Omit<T, keyof BaseState>>,
  name: string
) => {
  const store = create<T>()(
    devtools(
      persist(
        logger(
          set =>
            ({
              isLoading: false,
              error: null,
              setError: (error: string | null) => set(() => ({ error }) as Partial<T>),
              clearError: () => set(() => ({ error: null }) as Partial<T>),
              setLoading: (isLoading: boolean) => set(() => ({ isLoading }) as Partial<T>),
              ...initialState,
            }) as T,
          name
        ),
        {
          name: `hockey-pouches-${name}`,
        }
      )
    )
  );

  return createSelectors(store);
};

export { createBaseStore };
