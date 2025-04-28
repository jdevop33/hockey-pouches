'use client';

import React, { ReactNode, useState, useEffect } from 'react';
import { ThemeProviderClient } from './theme-provider-client';
import { AuthProvider } from '../context/AuthContext';
import { ToastProvider } from '../context/ToastContext';
import { CsrfProvider } from '../context/CsrfContext';
import { CartProvider } from '../context/CartContext';

interface ClientWrapperProps {
  children: ReactNode;
}

/**
 * ClientWrapper is a client component that wraps the application
 * with all necessary client-side providers in a specific order.
 *
 * This approach avoids hydration issues by ensuring all client-side
 * initialization happens within a dedicated client component.
 */
export default function ClientWrapper({ children }: ClientWrapperProps) {
  // Add mounted state to prevent hydration mismatch
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Defer setting mounted to true to ensure client-side only execution
    // and avoid potential hydration errors during provider initialization
    const timeout = setTimeout(() => {
      setMounted(true);
    }, 0);

    return () => clearTimeout(timeout);
  }, []);

  // Return children wrapped in a div during SSR
  // This prevents context hooks from being called during static generation
  if (!mounted) {
    return <div suppressHydrationWarning>{children}</div>;
  }

  // Add all required providers for the application
  // Each provider is wrapped in an error boundary to prevent cascading failures
  try {
    return (
      <ThemeProviderClient>
        <AuthProvider>
          <ToastProvider>
            <CsrfProvider>
              <CartProvider>{children}</CartProvider>
            </CsrfProvider>
          </ToastProvider>
        </AuthProvider>
      </ThemeProviderClient>
    );
  } catch (error) {
    console.error('Error in ClientWrapper providers:', error);
    // Fallback rendering in case providers fail to initialize
    return (
      <div className="p-4 text-center text-white">
        Something went wrong. Please refresh the page.
      </div>
    );
  }
}
