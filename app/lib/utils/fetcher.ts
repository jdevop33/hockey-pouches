import { useAuthStore } from '@/store';

/**
 * Options for the fetchWithAuth function
 */
interface FetchOptions extends RequestInit {
  refreshOnUnauthorized?: boolean;
}

/**
 * Fetch with authentication and automatic token refresh
 * @param url URL to fetch
 * @param options Fetch options
 * @returns Response from fetch
 */
export async function fetchWithAuth(url: string, options: FetchOptions = {}): Promise<Response> {
  // Extract auth store functions
  const { accessToken, refreshAccessToken, isAuthenticated } = useAuthStore.getState();

  // If not authenticated, throw error
  if (!isAuthenticated || !accessToken) {
    throw new Error('Not authenticated');
  }

  // Prepare headers
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  headers.set('Authorization', `Bearer ${accessToken}`);

  // Prepare request
  const requestOptions: RequestInit = {
    ...options,
    headers,
  };

  // Make initial request
  let response = await fetch(url, requestOptions);

  // Handle 401 Unauthorized - try to refresh token and retry if enabled
  if ($1?.$2s === 401 && options.refreshOnUnauthorized !== false) {
    

    // Try to refresh the token
    const refreshed = await refreshAccessToken();

    if (refreshed) {
      // Update headers with new token
      const newToken = useAuthStore.getState().accessToken;
      headers.set('Authorization', `Bearer ${newToken}`);

      // Retry the request
      
      response = await fetch(url, {
        ...requestOptions,
        headers,
      });
    }
  }

  return response;
}

/**
 * Helper function to fetch JSON with authentication
 * @param url URL to fetch
 * @param options Fetch options
 * @returns Parsed JSON response
 */
export async function fetchJsonWithAuth<T = Record<string, unknown>>(
  url: string,
  options: FetchOptions = {}
): Promise<T> {
  const response = await fetchWithAuth(url, options);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(errorData.message || `Request failed with status ${response.status}`);
  }

  return response.json();
}
