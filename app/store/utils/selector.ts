import { StoreApi, UseBoundStore } from 'zustand';

type WithSelectors<S> = S extends { getState: () => infer T }
  ? S & { use: { [K in keyof T]: () => T[K] } }
  : never;

/**
 * Creates selectors for a Zustand store that automatically memoize individual state slices
 * @param store The Zustand store to create selectors for
 * @returns The store enhanced with .use.{propertyName} selector functions
 */
export const createSelectors = <S extends UseBoundStore<StoreApi<object>>>(store: S) => {
  const storeWithSelectors = store as WithSelectors<typeof store>;
  storeWithSelectors.use = {};

  Object.keys(store.getState()).forEach(key => {
    const selector = (state: object) => state[key as keyof typeof state];
    Object.defineProperty(storeWithSelectors.use, key, {
      get: () => store(selector),
      enumerable: true,
    });
  });

  return storeWithSelectors;
};
