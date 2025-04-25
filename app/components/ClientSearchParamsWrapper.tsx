'use client';

import { Suspense, ReactNode } from 'react';

interface ClientSearchParamsWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * A wrapper component that provides a Suspense boundary for components that use useSearchParams()
 * This follows Next.js best practices for handling useSearchParams() to prevent hydration issues
 */
export default function ClientSearchParamsWrapper({ 
  children, 
  fallback = null 
}: ClientSearchParamsWrapperProps) {
  return <Suspense fallback={fallback}>{children}</Suspense>;
}
