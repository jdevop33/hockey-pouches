'use client';

import React from 'react';
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
  const fallbackImage = '/images/products/fallback.jpg';
  const imageSrc = src || fallbackImage;

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
        priority={priority}
        style={{ objectFit }}
        className="p-2 transition-transform duration-300"
      />
    </div>
  );
};

export default ProductImage;
