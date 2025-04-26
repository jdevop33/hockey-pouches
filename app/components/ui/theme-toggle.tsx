'use client';

import * as React from 'react';
import { useTheme } from '../../../app/hooks/use-theme';
import { Moon, Sun } from 'lucide-react';

interface ThemeToggleProps {
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export function ThemeToggle({
  className = '',
  variant = 'outline',
  size = 'sm',
}: ThemeToggleProps) {
  const { theme, toggleTheme, mounted } = useTheme();

  // Prevent hydration mismatch
  if (!mounted) {
    return <div className={`h-9 w-9 ${className}`} />;
  }

  return (
    <button
      onClick={toggleTheme}
      className={`rounded-full p-2 ${
        variant === 'outline'
          ? 'border border-gray-200 dark:border-gray-800'
          : variant === 'ghost'
            ? 'hover:bg-gray-100 dark:hover:bg-gray-800'
            : 'bg-gray-100 dark:bg-gray-800'
      } ${size === 'sm' ? 'h-8 w-8' : size === 'lg' ? 'h-12 w-12' : 'h-10 w-10'} ${className}`}
      aria-label="Toggle theme"
    >
      {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="text-gold-500 h-5 w-5" />}
    </button>
  );
}
