'use client';

import React from 'react';
import JsonLd from './JsonLd';
import { Product } from '@/types';

interface ProductSchemaProps {
  product: Product;
  url?: string;
}

const ProductSchema: React.FC<ProductSchemaProps> = ({ product, url }) => {
  // Construct absolute image URL if image_url is relative
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://nicotinetins.com';
  const absoluteImageUrl = product.image_url
    ? product.image_url.startsWith('http')
      ? product.image_url
      : `${baseUrl}${product.image_url}`
    : undefined;

  // Construct product URL
  const productUrl = url || `${baseUrl}/products/${product.id}`;

  const schemaData = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.name,
    description: product.description || product.name, // Use name as fallback description
    ...(absoluteImageUrl && { image: [absoluteImageUrl] }), // Conditionally add image
    sku: `NT-${product.id}`,
    mpn: `HPNT-${product.id}`,
    brand: {
      '@type': 'Brand',
      name: 'Hockey Puxx',
    },
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: 'CAD',
      price: product.price,
      priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
        .toISOString()
        .split('T')[0],
      availability: product.is_active
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'Nicotine Tins by Hockey Puxx',
      },
      itemCondition: 'https://schema.org/NewCondition',
    },
    // Keep aggregateRating and review as placeholders or fetch dynamically later
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '24',
    },
  };

  return <JsonLd data={schemaData} />;
};

export default ProductSchema;
