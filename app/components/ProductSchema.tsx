'use client';

import React from 'react';
// Removed static import: import { Product } from '../data/products';

// Define the type for the product prop, aligning with API/DB data
// Make potentially missing fields optional
interface SchemaProduct {
  id: number;
  name: string;
  description?: string | null; // Optional
  image_url?: string | null; // Use image_url and make optional
  price: number;
  is_active?: boolean;
  inventory_quantity?: number;
}

interface ProductSchemaProps {
  product: SchemaProduct; // Use the updated interface
}

const ProductSchema: React.FC<ProductSchemaProps> = ({ product }) => {
  // Construct absolute image URL if image_url is relative
  const absoluteImageUrl = product.image_url
    ? product.image_url.startsWith('http')
      ? product.image_url
      : `https://nicotinetins.com${product.image_url}` // Assuming base URL
    : undefined;

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
      name: 'Hockey Puxx', // Assuming static brand
    },
    offers: {
      '@type': 'Offer',
      url: `https://nicotinetins.com/products/${product.id}`,
      priceCurrency: 'CAD',
      price: product.price,
      priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
        .toISOString()
        .split('T')[0],
      availability:
        product.is_active === false
          ? 'https://schema.org/OutOfStock'
          : product.inventory_quantity !== undefined && product.inventory_quantity <= 0
            ? 'https://schema.org/OutOfStock'
            : 'https://schema.org/InStock',
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

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
    />
  );
};

export default ProductSchema;
