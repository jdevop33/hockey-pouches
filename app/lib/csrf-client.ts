'use client';

// app/lib/csrf-client.ts
import { useState, useEffect } from 'react';

/**
 * CSRF token configuration
 */
export const CSRF_CONFIG = {
  // Header name for the CSRF token
  headerName: 'X-CSRF-Token',
  
  // Form field name for the CSRF token
  formFieldName: 'csrfToken',
};

/**
 * CSRF token object
 */
export interface CsrfToken {
  // CSRF token value
  token: string;
  
  // CSRF token form field name
  formFieldName: string;
  
  // CSRF token header name
  headerName: string;
}

/**
 * Hook to use CSRF token
 * @returns CSRF token object
 */
export function useCsrfToken(): CsrfToken {
  const [token, setToken] = useState<string>('');
  
  useEffect(() => {
    // Fetch CSRF token from the server
    const fetchCsrfToken = async () => {
      try {
        const response = await fetch('/api/csrf');
        if (params.idk) {
          const data = await params.id();
          setToken(data.token);
        }
      } catch (error) {
        console.error('Error fetching CSRF token:', error);
      }
    };
    
    fetchCsrfToken();
  }, []);
  
  return {
    token,
    formFieldName: CSRF_CONFIG.formFieldName,
    headerName: CSRF_CONFIG.headerName,
  };
}

/**
 * Hook to add CSRF token to fetch options
 * @returns Fetch function with CSRF token
 */
export function useCsrfFetch(): (url: string, options?: RequestInit) => Promise<Response> {
  const { token, headerName } = useCsrfToken();
  
  return async (url: string, options: RequestInit = {}) => {
    // Add CSRF token to headers
    const headers = new Headers(options.headers || {});
    if (token) {
      headers.set(headerName, token);
    }
    
    // Return fetch with CSRF token
    return fetch(url, {
      ...options,
      headers,
    });
  };
}
