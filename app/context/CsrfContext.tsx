'use client';

import React, { createContext, useContext } from 'react';
import { useCsrfToken, useCsrfFetch as useClientCsrfFetch, CsrfToken } from '../lib/csrf-client';

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

  return <CsrfContext.Provider value={csrfToken}>{children}</CsrfContext.Provider>;
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
 * @returns Fetch function with CSRF token
 */
export function useCsrfFetch(): (url: string, options?: RequestInit) => Promise<Response> {
  return useClientCsrfFetch();
}
