'use client';

import React, { ReactNode } from 'react';
import { ThemeProvider } from 'next-themes';
import ClientAnalytics from './ClientAnalytics';
import { AuthTokenRefresher } from './AuthTokenRefresher';
import { StoreProvider } from '@/providers/StoreProvider';

interface ClientProvidersProps {
  children: ReactNode;
}

export function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <ThemeProvider attribute="class" enableSystem={true} defaultTheme="light">
      <StoreProvider>
        {/* Auth token refresher to handle token expiry */}
        <AuthTokenRefresher />

        {/* Analytics components */}
        <ClientAnalytics />

        {children}
      </StoreProvider>
    </ThemeProvider>
  );
}
