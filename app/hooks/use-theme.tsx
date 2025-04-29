'use client';

import { useTheme as useNextTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function useTheme() {
  const { setTheme, themes } = useNextTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setMounted(true);
      // Set initial theme without direct DOM manipulation
      setTheme('dark');
    }, 0);

    return () => clearTimeout(timeout);
  }, [setTheme]);

  // Before hydration, return default values
  if (!mounted) {
    return {
      theme: 'dark',
      setTheme: () => {},
      isDark: true,
      isLight: false,
      toggleTheme: () => {},
      themes: [],
      mounted: false,
    };
  }

  // After hydration, return actual values
  return {
    theme: 'dark',
    setTheme: () => setTheme('dark'), // Only allow dark theme
    isDark: true,
    isLight: false,
    toggleTheme: () => {}, // No-op since we only support dark mode
    themes,
    mounted,
  };
}
