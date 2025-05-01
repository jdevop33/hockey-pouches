'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Loader } from 'lucide-react';

interface ProductImageProps {
  src: string | null | undefined;
  alt: string;
  size?: 'small' | 'medium' | 'large' | 'square';
  priority?: boolean;
  className?: string;
  aspectRatio?: string;
  objectFit?: 'contain' | 'cover';
  onClick?: () => void;
  enableZoom?: boolean;
  badge?: {
    text: string;
    color: string;
  };
}

/**
 * A consistent product image component that handles standard sizing
 * across the application for product display with enhanced UX features
 */
const ProductImage: React.FC<ProductImageProps> = ({
  src,
  alt,
  size = 'medium',
  priority = false,
  className,
  aspectRatio = 'aspect-square',
  objectFit = 'contain',
  onClick,
  enableZoom = false,
  badge,
}) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isZoomed, setIsZoomed] = useState(false);
  const fallbackImage = '/images/products/puxxcoolmint22mg.png';

  // Ensure src is properly formatted and handle relative/absolute paths
  const getNormalizedSrc = (path: string | null | undefined) => {
    if (!path) return null;

    // If it's already a full URL, return it
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }

    // Make sure it starts with a slash for local paths
    return path.startsWith('/') ? path : `/${path}`;
  };

  const normalizedSrc = getNormalizedSrc(src);

  // Use fallback if src is null/undefined or if there was an error loading the image
  const imageSrc = normalizedSrc && !imageError ? normalizedSrc : fallbackImage;

  // Configure size dimensions
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'h-36 w-36 md:h-40 md:w-40';
      case 'medium':
        return 'h-48 w-48 md:h-60 md:w-60';
      case 'large':
        return 'h-64 w-64 md:h-80 md:w-80 lg:h-96 lg:w-96';
      case 'square':
        return 'w-full h-full';
      default:
        return 'h-48 w-48';
    }
  };

  const handleImageError = () => {
    console.error(`Failed to load image: ${src}. Using fallback image instead.`);
    setImageError(true);
    setIsLoading(false);
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  // Calculate appropriate sizes based on component size
  const getSizes = () => {
    switch (size) {
      case 'small':
        return '(max-width: 768px) 144px, 160px';
      case 'medium':
        return '(max-width: 768px) 192px, 240px';
      case 'large':
        return '(max-width: 768px) 256px, (max-width: 1024px) 320px, 384px';
      case 'square':
        return '(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw';
      default:
        return '(max-width: 768px) 192px, 240px';
    }
  };

  // Handle zoom functionality
  const toggleZoom = (e: React.MouseEvent) => {
    if (!enableZoom) return;
    e.stopPropagation();
    setIsZoomed(!isZoomed);
  };

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-md bg-dark-800/80',
        aspectRatio,
        getSizeClasses(),
        className,
        onClick || enableZoom ? 'cursor-pointer' : '',
        enableZoom && 'group'
      )}
      onClick={onClick || (enableZoom ? toggleZoom : undefined)}
    >
      {/* Loading state overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-dark-800/40 backdrop-blur-sm">
          <Loader className="h-8 w-8 animate-spin text-gold-500" />
        </div>
      )}

      {/* Product badge */}
      {badge && !isLoading && (
        <div
          className={`absolute right-2 top-2 z-10 rounded-full ${badge.color} px-3 py-1 text-xs font-bold text-dark-900 shadow-md`}
        >
          {badge.text}
        </div>
      )}

      {/* Zoom indicator for desktop */}
      {enableZoom && !isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-dark-900/0 opacity-0 transition-all duration-300 group-hover:bg-dark-900/20 group-hover:opacity-100">
          <div className="rounded-full bg-gold-500/80 p-2 backdrop-blur-sm">
            <svg
              className="h-6 w-6 text-dark-900"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m4-3h-6"
              />
            </svg>
          </div>
        </div>
      )}

      {/* Base image */}
      <Image
        src={imageSrc}
        alt={alt}
        fill
        priority={priority || size === 'large'}
        quality={size === 'large' ? 90 : 80}
        style={{ objectFit }}
        className={cn(
          'transition-all duration-300',
          enableZoom && 'group-hover:scale-105',
          isLoading ? 'opacity-0' : 'opacity-100'
        )}
        onError={handleImageError}
        onLoad={handleImageLoad}
        sizes={getSizes()}
        loading={priority ? 'eager' : 'lazy'}
        unoptimized={false} // Make sure we use Next.js image optimization
      />

      {/* Zoomed view modal */}
      {isZoomed && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-dark-900/90 p-4"
          onClick={() => setIsZoomed(false)}
        >
          <div className="relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded-lg bg-dark-800 shadow-xl">
            <button
              onClick={e => {
                e.stopPropagation();
                setIsZoomed(false);
              }}
              className="absolute right-4 top-4 z-10 rounded-full bg-dark-900/60 p-2 text-white backdrop-blur-sm transition-all hover:bg-dark-900/80"
              aria-label="Close enlarged view"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <div className="h-[90vh] w-[90vw] max-w-4xl">
              <Image
                src={imageSrc}
                alt={`${alt} (enlarged view)`}
                fill
                quality={100}
                className="object-contain p-4"
                sizes="90vw"
                unoptimized={false}
              />
            </div>
          </div>
        </div>
      )}

      {/* Enhance bottom light source simulation for depth (Refactoring UI principle 30) */}
      <div className="absolute inset-x-0 bottom-0 h-1/6 bg-gradient-to-t from-black/10 to-transparent"></div>
    </div>
  );
};

export default ProductImage;
