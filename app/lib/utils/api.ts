'use client';

import * as React from 'react';
import { showErrorToast, showInfoToast } from './toast';

interface FetchOptions extends RequestInit {
  retries?: number;
  retryDelay?: number;
  onRetry?: (attempt: number, error: ApiError) => void;
  shouldRetry?: (error: ApiError, attempt: number) => boolean;
}

interface ApiError extends Error {
  status?: number;
  data?: unknown;
}

const defaultRetryCondition = (error: ApiError) => {
  // Retry on network errors or 5xx server errors
  if (!error.status) return true; // Network error
  if (error.status >= 500 && error.status < 600) return true; // Server error
  if (error.status === 429) return true; // Rate limiting
  return false;
};

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Fetches data from an API with automatic retries and error handling
 *
 * @param url - The URL to fetch from
 * @param options - Extended fetch options including retry configuration
 * @returns Promise with the parsed response
 *
 * @example
 * ```typescript
 * const data = await fetchWithRetry('/api/data', {
 *   retries: 3,
 *   retryDelay: 1000,
 *   onRetry: (attempt) => ,
 * });
 * ```
 */
export async function fetchWithRetry<T>(url: string, options: FetchOptions = {}): Promise<T> {
  const {
    retries = 3,
    retryDelay = 1000,
    onRetry,
    shouldRetry = defaultRetryCondition,
    ...fetchOptions
  } = options;

  let lastError: ApiError = new Error('Request failed') as ApiError;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, fetchOptions);

      if (!response.ok) {
        const error = new Error(response.statusText) as ApiError;
        error.status = response.status;
        try {
          error.data = await response.json();
        } catch {
          // Ignore JSON parsing errors
        }
        throw error;
      }

      return await response.json();
    } catch (error) {
      lastError =
        error instanceof Error ? (error as ApiError) : (new Error(String(error)) as ApiError);

      const isLastAttempt = attempt === retries;
      if (isLastAttempt || !shouldRetry(lastError, attempt)) {
        break;
      }

      if (onRetry) {
        onRetry(attempt + 1, lastError);
      }

      // Calculate exponential backoff delay
      const backoffDelay = retryDelay * Math.pow(2, attempt);
      // Add some randomness to prevent thundering herd
      const jitter = Math.random() * 200;
      await wait(backoffDelay + jitter);
    }
  }

  throw lastError;
}

/**
 * React hook for making API requests with retry logic and toast notifications
 *
 * @param defaultOptions - Default options for all requests made with this hook
 * @returns Object with fetch method and loading state
 *
 * @example
 * ```typescript
 * const { fetchApi, isLoading } = useApi({
 *   headers: { 'Authorization': `Bearer ${token}` }
 * });
 *
 * // Later in your code
 * const data = await fetchApi('/api/data');
 * ```
 */
export function useApi(defaultOptions: FetchOptions = {}) {
  const [isLoading, setIsLoading] = React.useState(false);

  const fetchApi = React.useCallback(
    async <T>(url: string, options: FetchOptions = {}): Promise<T> => {
      setIsLoading(true);

      try {
        const mergedOptions = {
          ...defaultOptions,
          ...options,
          headers: {
            ...defaultOptions.headers,
            ...options.headers,
          },
          onRetry: (attempt: number, error: ApiError) => {
            showInfoToast(`Retrying request... Attempt ${attempt} of ${options.retries || 3}`);
            if (options.onRetry) {
              options.onRetry(attempt, error);
            }
          },
        };

        return await fetchWithRetry<T>(url, mergedOptions);
      } catch (error) {
        const apiError =
          error instanceof Error ? (error as ApiError) : (new Error(String(error)) as ApiError);

        // Handle specific error types
        if (apiError.status === 401) {
          showErrorToast('Please log in again');
        } else if (apiError.status === 403) {
          showErrorToast('You do not have permission to perform this action');
        } else {
          showErrorToast(apiError.message || 'An unexpected error occurred');
        }
        throw apiError;
      } finally {
        setIsLoading(false);
      }
    },
    [defaultOptions]
  );

  return { fetchApi, isLoading };
}
