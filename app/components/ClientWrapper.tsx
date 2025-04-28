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
    setMounted(true);
  }, []);

  // Return children directly during initial server render or first mount
  // This prevents hydration mismatches
  if (!mounted) {
    return <>{children}</>;
  }

  // Add all required providers for the application
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
}
