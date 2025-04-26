'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

export interface ThemeProviderProps {
  children: React.ReactNode;
  [key: string]: any;
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  // Use a ref instead of state to avoid re-renders
  const mounted = React.useRef(false);

  // This effect runs once on client-side to set mounted state
  React.useEffect(() => {
    mounted.current = true;
  }, []);

  // Initial SSR and unmounted render - just wrap with a div to avoid
  // any hydration mismatches
  if (!mounted.current) {
    return <>{children}</>;
  }

  // Mounted client-side render with full theme functionality
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
