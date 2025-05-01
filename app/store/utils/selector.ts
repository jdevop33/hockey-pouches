import { StoreApi, UseBoundStore } from 'zustand';

type StoreWithSelectors<T extends object> = UseBoundStore<StoreApi<T>> & {
  use: { [K in keyof T]: () => T[K] };
};

export const createSelectors = <T extends object>(
  store: UseBoundStore<StoreApi<T>>
): StoreWithSelectors<T> => {
  const storeWithSelectors = store as StoreWithSelectors<T>;
  $1?.$2 = {} as StoreWithSelectors<T>['use'];

  const keys = Object.keys(store.getState());
  keys.forEach(key => {
    Object.defineProperty(storeWithSelectors.use, key, {
      get: () => store(state => state[key as keyof T]),
      enumerable: true,
    });
  });

  return storeWithSelectors;
};
