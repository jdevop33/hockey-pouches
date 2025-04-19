'use client';

import React from 'react';
import { Product } from '../data/products';

interface ProductSchemaProps {
  product: Product;
}

const ProductSchema: React.FC<ProductSchemaProps> = ({ product }) => {
  const schemaData = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: `https://nicotinetins.com${product.imageUrl}`,
    sku: `NT-${product.id}`,
    brand: {
      '@type': 'Brand',
      name: 'Hockey Puxx',
    },
    offers: {
      '@type': 'Offer',
      url: `https://nicotinetins.com/products/${product.id}`,
      priceCurrency: 'CAD',
      price: product.price,
      priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
        .toISOString()
        .split('T')[0],
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: 'Nicotine Tins',
      },
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
