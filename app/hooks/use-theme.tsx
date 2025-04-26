'use client';

import { useTheme as useNextTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function useTheme() {
  const { themes } = useNextTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch and ensure dark mode
  useEffect(() => {
    setMounted(true);

    // Force dark mode
    document.documentElement.classList.add('dark');
  }, []);

  // Always return dark mode
  const isDark = true;
  const isLight = false;

  // No-op theme toggle - we only support dark mode
  const toggleTheme = () => {
    // No-op, we're always in dark mode
    console.log('Theme toggle disabled - using dark mode only');
  };

  const setTheme = () => {
    // No-op, we're always in dark mode
    console.log('Theme changes disabled - using dark mode only');
  };

  return {
    theme: 'dark',
    setTheme,
    isDark,
    isLight,
    toggleTheme,
    themes,
    mounted,
  };
}
