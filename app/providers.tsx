'use client';

import React from 'react';
import { ThemeProviderClient } from './components/theme-provider-client';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { CsrfProvider } from './context/CsrfContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProviderClient>
      <AuthProvider>
        <ToastProvider>
          <CsrfProvider>{children}</CsrfProvider>
        </ToastProvider>
      </AuthProvider>
    </ThemeProviderClient>
  );
}
