'use client';

import { useTheme as useNextTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function useTheme() {
  const { theme, setTheme, themes } = useNextTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Safe theme getters
  const isDark = mounted && theme === 'dark';
  const isLight = mounted && theme === 'light';

  // Theme toggle functions
  const toggleTheme = () => {
    if (theme === 'dark') {
      setTheme('light');
    } else {
      setTheme('dark');
    }
  };

  return {
    theme: mounted ? theme : undefined,
    setTheme,
    isDark,
    isLight,
    toggleTheme,
    themes,
    mounted,
  };
}
