'use client';

import React from 'react';
import LoadingSpinner from './LoadingSpinner';

interface ButtonProps {
  children: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline';
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
    'inline-flex items-center justify-center rounded-md font-medium focus:outline-none transition-colors';

  // Size classes
  const sizeClasses = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2 text-base',
    large: 'px-6 py-3 text-lg',
  }[size];

  // Variant classes
  const variantClasses = {
    primary:
      'bg-anzac-500 text-white hover:bg-anzac-600 focus:ring-2 focus:ring-anzac-400 focus:ring-offset-2',
    secondary:
      'bg-navy-600 text-white hover:bg-navy-700 focus:ring-2 focus:ring-navy-500 focus:ring-offset-2',
    danger:
      'bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2',
    success:
      'bg-forest-600 text-white hover:bg-forest-700 focus:ring-2 focus:ring-forest-500 focus:ring-offset-2',
    outline:
      'bg-cream-50 dark:bg-rich-900 text-rich-800 dark:text-cream-100 border border-anzac-300 dark:border-rich-700 hover:bg-cream-100 dark:hover:bg-rich-800 focus:ring-2 focus:ring-anzac-400 focus:ring-offset-2',
  }[variant];

  // Disabled classes
  const disabledClasses =
    disabled || isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';

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
          color={variant === 'outline' ? 'primary' : 'white'}
          className="mr-2"
        />
      )}
      {children}
    </button>
  );
};

export default Button;
