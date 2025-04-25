'use client';

import React from 'react';
import LoadingSpinner from './LoadingSpinner';

interface ButtonProps {
  children: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline' | 'gold';
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
    'inline-flex items-center justify-center rounded-md font-medium focus:outline-none transition-all';

  // Size classes
  const sizeClasses = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2 text-base',
    large: 'px-6 py-3 text-lg',
  }[size];

  // Variant classes
  const variantClasses = {
    primary:
      'bg-gradient-gold text-secondary-950 hover:shadow-gold border border-gold-600 hover:scale-[1.02]',
    secondary:
      'bg-secondary-800 text-white hover:bg-secondary-700 border border-gold-light hover:border-gold hover:shadow-gold-sm',
    danger: 'bg-red-600 text-white hover:bg-red-700 border border-red-700',
    success: 'bg-green-600 text-white hover:bg-green-700 border border-green-700',
    outline:
      'bg-transparent text-gold-500 border border-gold-light hover:bg-secondary-800 hover:border-gold hover:shadow-gold-sm',
    gold: 'bg-gold-700 text-secondary-950 hover:bg-gold-600 border border-gold-600 hover:shadow-gold',
  }[variant];

  // Disabled classes
  const disabledClasses =
    disabled || isLoading
      ? 'opacity-50 cursor-not-allowed hover:scale-100 hover:shadow-none'
      : 'cursor-pointer';

  return (
    <button
      type={type}
      className={`${baseClasses} ${sizeClasses} ${variantClasses} ${disabledClasses} ${className}`}
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
