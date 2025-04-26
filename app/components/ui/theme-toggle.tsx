'use client';

import * as React from 'react';
import { useTheme } from '../../../app/hooks/use-theme';
import { Moon } from 'lucide-react';

interface ThemeToggleProps {
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

/**
 * ThemeToggle component is now just a visual indicator of dark mode
 * It doesn't actually toggle the theme anymore as we're enforcing dark mode
 */
export function ThemeToggle({
  className = '',
  variant = 'outline',
  size = 'sm',
}: ThemeToggleProps) {
  const { mounted } = useTheme();

  // Prevent hydration mismatch
  if (!mounted) {
    return <div className={`h-9 w-9 ${className}`} />;
  }

  // Just show the moon icon to indicate dark mode - no functionality
  return (
    <div
      className={`cursor-default rounded-full p-2 opacity-70 ${
        variant === 'outline'
          ? 'border border-gray-800'
          : variant === 'ghost'
            ? 'bg-gray-800/50'
            : 'bg-gray-800'
      } ${size === 'sm' ? 'h-8 w-8' : size === 'lg' ? 'h-12 w-12' : 'h-10 w-10'} ${className}`}
      aria-label="Dark mode enabled"
      title="Dark mode enabled"
    >
      <Moon className="h-5 w-5 text-gold-500" />
    </div>
  );
}
