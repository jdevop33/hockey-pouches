'use client';
import React, { ReactNode } from 'react';
import { ThemeProviderClient } from '@/components/theme-provider-client';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import { CsrfProvider } from '@/context/CsrfContext';
import { CartProvider } from '@/context/CartContext';
import { StoreProvider } from './StoreProvider'; // Assumes StoreProvider handles Zustand hydration
import { Toaster } from '@/components/ui/Toaster';
import ClientAnalyticsWrapper from './ClientAnalyticsWrapper'; // Assuming this handles dynamic loading
// Removed: import ClientProviders from './ClientProviders'; // This seemed incorrect
// If ClientProviders was intended, ensure it has a default export or use named import:
// 
interface ProvidersProps {
  children: ReactNode;
}
/**
 * AppProviders: Combines all essential application-wide providers.
 * Order matters here - contexts that depend on others should be nested inside.
 * StoreProvider should likely wrap everything if contexts rely on Zustand stores.
 */
export function Providers({ children }: ProvidersProps) {
  return (
    // StoreProvider likely initializes/hydrates Zustand stores
    <StoreProvider>
      {/* ThemeProvider handles theme state */}
      <ThemeProviderClient>
         {/* AuthProvider likely provides auth state/actions (check for redundancy) */}
        <AuthProvider>
           {/* ToastProvider manages toast notifications */}
          <ToastProvider>
             {/* CsrfProvider manages CSRF token state */}
            <CsrfProvider>
               {/* CartProvider likely provides cart state/actions (check for redundancy) */}
              <CartProvider>
                {/* Wrapper to handle dynamic loading of analytics scripts */}
                <ClientAnalyticsWrapper />
                {/* Render the main application content */}
                {children}
                {/* Toaster component renders toasts managed by ToastProvider/useToast */}
                <Toaster />
              </CartProvider>
            </CsrfProvider>
          </ToastProvider>
        </AuthProvider>
      </ThemeProviderClient>
    </StoreProvider>
  );
}
