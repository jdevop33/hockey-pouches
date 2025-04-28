'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

export interface ThemeProviderProps {
  children: React.ReactNode;
  [key: string]: React.ReactNode | string | boolean | undefined;
}

export function ThemeProviderClient({ children, ...props }: ThemeProviderProps) {
  // Only render on client side
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);

    // Only run on client side
    if (typeof window !== 'undefined') {
      // Force dark mode
      document.documentElement.classList.add('dark');

      // Prevent theme changes
      localStorage.setItem('hockey-puxx-theme', 'dark');
    }
  }, []);

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      forcedTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
