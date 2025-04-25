'use client';

import React from 'react';
import { Button as ShadcnButton } from './button-shadcn';

// This is a compatibility layer for the old Button component
// It maps the old variants to the new shadcn/ui Button component variants

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
  // Map old variants to new shadcn/ui variants
  const variantMap = {
    primary: 'default',
    secondary: 'secondary',
    danger: 'destructive',
    success: 'success', // Use the success variant directly
    outline: 'outline',
  };

  // Map old sizes to new shadcn/ui sizes
  const sizeMap = {
    small: 'sm',
    medium: 'default',
    large: 'lg',
  };

  // No need for custom classes since we're using the built-in success variant
  let customClasses = '';

  return (
    <ShadcnButton
      type={type}
      variant={variantMap[variant] as any}
      size={sizeMap[size] as any}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${customClasses} ${className} ${isLoading ? 'flex items-center gap-2' : ''}`}
      {...props}
    >
      {isLoading && (
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
      )}
      {children}
    </ShadcnButton>
  );
};

export default Button;
