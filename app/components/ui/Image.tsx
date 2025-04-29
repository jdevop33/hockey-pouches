'use client';

import * as React from 'react';
import NextImage, { ImageProps as NextImageProps } from 'next/image';
import { cn } from '@/lib/utils';
import { layout } from './design-system';

export interface ImageProps extends Omit<NextImageProps, 'alt'> {
  /**
   * Alternative text for the image
   */
  alt: string;
  /**
   * Aspect ratio of the image container
   */
  aspectRatio?: keyof typeof layout.aspectRatio;
  /**
   * How to fit the image within its container
   */
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  /**
   * Fallback component to show when image fails to load
   */
  fallback?: React.ReactNode;
  /**
   * Whether to show a blur placeholder while loading
   */
  withBlur?: boolean;
  /**
   * Optional overlay color
   */
  overlay?: string;
  /**
   * Whether to animate the image on load
   */
  animate?: boolean;
}

/**
 * Enhanced image component with aspect ratio, loading states, and fallbacks
 */
export const Image = React.forwardRef<HTMLImageElement, ImageProps>(
  (
    {
      className,
      src,
      alt,
      aspectRatio = 'square',
      objectFit = 'cover',
      fallback,
      withBlur = true,
      overlay,
      animate = true,
      ...props
    },
    ref
  ) => {
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState(false);

    // Handle load complete
    const handleLoadComplete = () => {
      setIsLoading(false);
    };

    // Handle load error
    const handleError = () => {
      setError(true);
      setIsLoading(false);
    };

    // Container classes
    const containerClasses = cn(
      'relative overflow-hidden',
      {
        [`aspect-[${layout.aspectRatio[aspectRatio]}]`]: aspectRatio,
      },
      className
    );

    // Image classes
    const imageClasses = cn(
      'transition-opacity duration-300',
      {
        'opacity-0': isLoading,
        'opacity-100': !isLoading,
        'animate-fade-in': animate && !isLoading,
      },
      {
        'object-contain': objectFit === 'contain',
        'object-cover': objectFit === 'cover',
        'object-fill': objectFit === 'fill',
        'object-none': objectFit === 'none',
        'object-scale-down': objectFit === 'scale-down',
      }
    );

    // If there's an error and fallback is provided
    if (error && fallback) {
      return <div className={containerClasses}>{fallback}</div>;
    }

    return (
      <div className={containerClasses}>
        <NextImage
          ref={ref}
          src={src}
          alt={alt}
          className={imageClasses}
          onLoadingComplete={handleLoadComplete}
          onError={handleError}
          {...(withBlur && typeof src === 'string'
            ? { placeholder: 'blur', blurDataURL: src }
            : {})}
          {...props}
        />

        {/* Loading indicator */}
        {isLoading && <div className="absolute inset-0 animate-pulse bg-gray-100" />}

        {/* Optional overlay */}
        {overlay && !isLoading && <div className={cn('absolute inset-0', `bg-[${overlay}]`)} />}
      </div>
    );
  }
);

Image.displayName = 'Image';
