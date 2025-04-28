import { StateCreator, StoreMutatorIdentifier } from 'zustand';

type Logger = <
  T extends object,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = [],
>(
  f: StateCreator<T, Mps, Mcs>,
  name?: string
) => StateCreator<T, Mps, Mcs>;

type LoggerImpl = <T extends object>(
  f: StateCreator<T, [], []>,
  name?: string
) => StateCreator<T, [], []>;

const loggerImpl: LoggerImpl = (f, name) => (set, get, store) => {
  type T = ReturnType<typeof f>;
  const loggedSet: typeof set = args => {
    const prevState = get();
    const result = set(args);
    const nextState = get();
    const action = typeof args === 'function' ? args.name || 'unnamed action' : 'setState';

    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      console.group(`🐻 Zustand Store Update: ${name || 'unnamed store'}`);
      console.log('Action:', action);
      console.log('Prev State:', prevState);
      console.log('Next State:', nextState);
      console.log(
        'Changed Keys:',
        Object.keys(nextState).filter(
          key => nextState[key as keyof T] !== prevState[key as keyof T]
        )
      );
      console.groupEnd();
    }

    return result;
  };

  return f(loggedSet, get, store);
};

export const logger = loggerImpl as unknown as Logger;
