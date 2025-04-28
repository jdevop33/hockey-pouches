'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface ProductImageProps {
  src: string | null | undefined;
  alt: string;
  size?: 'small' | 'medium' | 'large' | 'square';
  priority?: boolean;
  className?: string;
  aspectRatio?: string;
  objectFit?: 'contain' | 'cover';
  onClick?: () => void;
}

/**
 * A consistent product image component that handles standard sizing
 * across the application for product display
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
}) => {
  const [imageError, setImageError] = useState(false);
  const fallbackImage = '/images/products/fallback.jpg';

  // Use fallback if src is null/undefined or if there was an error loading the image
  const imageSrc = src && !imageError ? src : fallbackImage;

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
    console.error(`Failed to load image: ${src}`);
    setImageError(true);
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

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-md bg-gray-800',
        aspectRatio,
        getSizeClasses(),
        className,
        onClick ? 'cursor-pointer' : ''
      )}
      onClick={onClick}
    >
      <Image
        src={imageSrc}
        alt={alt}
        fill
        priority={priority || size === 'large'}
        quality={90}
        style={{ objectFit }}
        className="transition-opacity duration-300"
        onError={handleImageError}
        sizes={getSizes()}
        loading={priority ? 'eager' : 'lazy'}
      />
    </div>
  );
};

export default ProductImage;
