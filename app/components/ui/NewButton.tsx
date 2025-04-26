'use client';

import { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/app/lib/utils';

interface NewButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  children: ReactNode;
}

export function NewButton({
  size = 'md',
  variant = 'primary',
  className,
  children,
  ...props
}: NewButtonProps) {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  };

  const baseClasses =
    'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background';

  return (
    <button className={cn(baseClasses, sizeClasses[size], className)} {...props}>
      {children}
    </button>
  );
}
