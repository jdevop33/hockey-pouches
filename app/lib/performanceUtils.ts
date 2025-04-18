/**
 * Utility functions for performance optimization
 */

/**
 * Debounce function to limit the rate at which a function can fire
 * @param func The function to debounce
 * @param wait The time to wait in milliseconds
 * @returns Debounced function
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function to limit the rate at which a function can fire
 * @param func The function to throttle
 * @param limit The time limit in milliseconds
 * @returns Throttled function
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean = false;
  let lastFunc: NodeJS.Timeout;
  let lastRan: number;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      lastRan = Date.now();
      inThrottle = true;
      
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(() => {
        if (Date.now() - lastRan >= limit) {
          func(...args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
};

/**
 * Memoize function to cache results of expensive function calls
 * @param func The function to memoize
 * @returns Memoized function
 */
export function memoize<T extends (...args: any[]) => any>(
  func: T
): (...args: Parameters<T>) => ReturnType<T> {
  const cache = new Map<string, ReturnType<T>>();
  
  return function executedFunction(...args: Parameters<T>): ReturnType<T> {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key) as ReturnType<T>;
    }
    
    const result = func(...args);
    cache.set(key, result);
    return result;
  };
}

/**
 * Check if code is running on the client side
 * @returns Boolean indicating if code is running on client
 */
export const isClient = (): boolean => {
  return typeof window !== 'undefined';
};

/**
 * Check if code is running in development mode
 * @returns Boolean indicating if code is running in development
 */
export const isDevelopment = (): boolean => {
  return process.env.NODE_ENV === 'development';
};

/**
 * Safely access localStorage with fallbacks
 * @param key The key to access
 * @param defaultValue Default value if key doesn't exist
 * @returns The value from localStorage or the default
 */
export const getLocalStorage = <T>(key: string, defaultValue: T): T => {
  if (!isClient()) {
    return defaultValue;
  }
  
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error accessing localStorage for key "${key}":`, error);
    return defaultValue;
  }
};

/**
 * Safely set localStorage with error handling
 * @param key The key to set
 * @param value The value to store
 * @returns Boolean indicating success
 */
export const setLocalStorage = <T>(key: string, value: T): boolean => {
  if (!isClient()) {
    return false;
  }
  
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error setting localStorage for key "${key}":`, error);
    return false;
  }
};
