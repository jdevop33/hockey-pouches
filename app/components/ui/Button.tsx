'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import LoadingSpinner from './LoadingSpinner';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/20 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        default: 'bg-gold-500 text-dark-900 hover:bg-gold-600 shadow-gold-sm hover:shadow-gold',
        primary: 'bg-gold-500 text-dark-900 hover:bg-gold-600 shadow-gold-sm hover:shadow-gold',
        destructive: 'bg-alert-red text-white hover:bg-red-600',
        danger: 'bg-alert-red text-white hover:bg-red-600',
        outline: 'border border-gold-500/50 bg-transparent hover:bg-gold-500/10 text-gold-500',
        secondary:
          'bg-secondary-200 text-secondary-900 hover:bg-secondary-300 dark:bg-secondary-800 dark:text-secondary-50 dark:hover:bg-secondary-700',
        ghost: 'hover:bg-gold-500/10 text-gold-500 hover:text-gold-600',
        link: 'text-gold-500 underline-offset-4 hover:underline',
        gold: 'bg-gold-700 text-secondary-950 hover:bg-gold-600 border border-gold-600 hover:shadow-gold',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
        small: 'px-3 py-1.5 text-sm',
        medium: 'px-4 py-2 text-base',
        large: 'px-6 py-3 text-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, isLoading = false, disabled = false, onClick, children, ...props },
    ref
  ) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        onClick={onClick}
        {...props}
      >
        {isLoading && (
          <LoadingSpinner
            size="small"
            color={
              variant === 'outline'
                ? 'gold'
                : variant === 'primary' || variant === 'gold' || variant === 'default'
                  ? 'dark'
                  : 'white'
            }
            className="mr-2"
          />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
