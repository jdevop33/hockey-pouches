'use client';

import React, { ReactNode } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { ThemeProvider } from 'next-themes';

interface ClientProvidersProps {
  children: ReactNode;
}

export default function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      {children}
      <Analytics />
    </ThemeProvider>
  );
}
