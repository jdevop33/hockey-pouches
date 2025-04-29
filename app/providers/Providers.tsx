'use client';

import React, { ReactNode, useState, useEffect, Suspense } from 'react';
import { ThemeProviderClient } from '@/components/theme-provider-client';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import { CsrfProvider } from '@/context/CsrfContext';
import { CartProvider } from '@/context/CartContext';
import { StoreProvider } from './StoreProvider';
import dynamic from 'next/dynamic';

// Dynamically import analytics with no SSR
const DynamicAnalytics = dynamic(
  () => import('@/components/ClientAnalytics').then(mod => ({ default: mod.default })),
  { ssr: false }
);

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setMounted(true);
    }, 0);

    return () => clearTimeout(timeout);
  }, []);

  // During SSR and initial client render, return a minimal wrapper
  if (!mounted) {
    return (
      <div className="contents" suppressHydrationWarning>
        {children}
      </div>
    );
  }

  // Once mounted on client, wrap with all providers in the correct order
  return (
    <StoreProvider>
      <ThemeProviderClient>
        <AuthProvider>
          <ToastProvider>
            <CsrfProvider>
              <CartProvider>
                <Suspense fallback={null}>
                  <DynamicAnalytics />
                </Suspense>
                {children}
              </CartProvider>
            </CsrfProvider>
          </ToastProvider>
        </AuthProvider>
      </ThemeProviderClient>
    </StoreProvider>
  );
}
