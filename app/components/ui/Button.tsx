'use client';

import React from 'react';
import LoadingSpinner from './LoadingSpinner';
import clsx from 'clsx';

interface ButtonProps {
  children: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline' | 'gold' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const Button: React.FC<ButtonProps> = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'medium',
  isLoading = false,
  disabled = false,
  className = '',
  onClick,
  ...props
}) => {
  // Base classes
  const baseClasses =
    'inline-flex items-center justify-center rounded-full px-6 py-3 text-lg font-extrabold uppercase tracking-wide transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2';

  // Size classes
  const sizeClasses = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2 text-base',
    large: 'px-6 py-3 text-lg',
  }[size];

  // Variant classes
  const variantClasses = {
    primary:
      'bg-brand-gold text-brand-black shadow-gold hover:bg-brand-blue hover:text-brand-cream hover:shadow-gold-glow',
    secondary:
      'bg-secondary-800 text-white hover:bg-secondary-700 border border-gold-light hover:border-gold hover:shadow-gold-sm',
    danger: 'bg-red-600 text-white hover:bg-red-700 border border-red-700',
    success: 'bg-green-600 text-white hover:bg-green-700 border border-green-700',
    outline:
      'border-2 border-brand-gold text-brand-gold bg-transparent hover:bg-brand-gold/10 hover:text-brand-blue',
    gold: 'bg-gold-700 text-secondary-950 hover:bg-gold-600 border border-gold-600 hover:shadow-gold',
    ghost: 'bg-transparent text-brand-cream hover:bg-brand-blue/10 hover:text-brand-blue',
  }[variant];

  // Disabled classes
  const disabledClasses =
    disabled || isLoading
      ? 'opacity-50 cursor-not-allowed hover:scale-100 hover:shadow-none'
      : 'cursor-pointer';

  return (
    <button
      type={type}
      className={clsx(baseClasses, sizeClasses, variantClasses, disabledClasses, className)}
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
              : variant === 'primary' || variant === 'gold'
                ? 'dark'
                : 'white'
          }
          className="mr-2"
        />
      )}
      {children}
    </button>
  );
};

export default Button;
