import { StateCreator } from 'zustand';

export const logger =
  <T extends object>(config: StateCreator<T>, name = 'store'): StateCreator<T> =>
  (set, get, api) =>
    config(
      args => {
        if (process.env.NODE_ENV === 'development') {
          const nextState = typeof args === 'function' ? args(get()) : args;
          console.group(`%c${name} %cUpdate`, 'color: #12b886; font-weight: bold;', 'color: #666;');
          console.log('Prev State:', get());
          console.log('Next State:', nextState);
          console.groupEnd();
        }
        return set(args);
      },
      get,
      api
    );
