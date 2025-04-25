'use client';

import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'white' | 'gray' | 'gold' | 'dark';
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  color = 'primary',
  className = '',
}) => {
  // Determine size class
  const sizeClass = {
    small: 'h-4 w-4 border-2',
    medium: 'h-8 w-8 border-2',
    large: 'h-12 w-12 border-3',
  }[size];

  // Determine color class
  const colorClass = {
    primary: 'border-primary-500 border-t-transparent',
    white: 'border-white border-t-transparent',
    gray: 'border-gray-300 border-t-transparent',
    gold: 'border-gold-500 border-t-transparent',
    dark: 'border-secondary-950 border-t-transparent',
  }[color];

  return (
    <div
      className={`inline-block animate-spin rounded-full ${sizeClass} ${colorClass} ${className}`}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default LoadingSpinner;
