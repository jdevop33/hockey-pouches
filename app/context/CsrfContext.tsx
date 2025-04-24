'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useCsrfToken, CsrfToken } from '@/lib/csrf';

// Create CSRF context
const CsrfContext = createContext<CsrfToken | null>(null);

// CSRF provider props
interface CsrfProviderProps {
  children: React.ReactNode;
}

/**
 * CSRF provider component
 * Provides CSRF token to all child components
 */
export function CsrfProvider({ children }: CsrfProviderProps) {
  const csrfToken = useCsrfToken();
  
  return (
    <CsrfContext.Provider value={csrfToken}>
      {children}
    </CsrfContext.Provider>
  );
}

/**
 * Hook to use CSRF token
 * @returns CSRF token object
 */
export function useCsrf(): CsrfToken {
  const context = useContext(CsrfContext);
  
  if (!context) {
    throw new Error('useCsrf must be used within a CsrfProvider');
  }
  
  return context;
}

/**
 * Hook to add CSRF token to fetch options
 * @param options Fetch options
 * @returns Fetch options with CSRF token
 */
export function useCsrfFetch(): (url: string, options?: RequestInit) => Promise<Response> {
  const { token, headerName } = useCsrf();
  
  return async (url: string, options: RequestInit = {}) => {
    // Add CSRF token to headers
    const headers = new Headers(options.headers || {});
    headers.set(headerName, token);
    
    // Return fetch with CSRF token
    return fetch(url, {
      ...options,
      headers,
    });
  };
}
