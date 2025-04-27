'use client';

import React from 'react';
import Script from 'next/script';

interface Product {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  image_url?: string | null;
  category?: string | null;
}

interface ProductSchemaProps {
  product: Product;
}

export default function ProductSchema({ product }: ProductSchemaProps) {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

  // Create structured data for search engines
  const structuredData = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.name,
    description: product.description || `Premium ${product.name} nicotine pouches by PUXX`,
    image: product.image_url
      ? `${baseUrl}${product.image_url}`
      : `${baseUrl}/images/products/fallback.jpg`,
    brand: {
      '@type': 'Brand',
      name: 'PUXX',
    },
    sku: `PUXX-${product.id}`,
    mpn: `PUXX-${product.id}`,
    category: product.category || 'Nicotine Pouches',
    offers: {
      '@type': 'Offer',
      url: typeof window !== 'undefined' ? window.location.href : '',
      priceCurrency: 'CAD',
      price: product.price,
      priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
        .toISOString()
        .split('T')[0],
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: 'PUXX Premium Nicotine Pouches',
      },
    },
  };

  return (
    <>
      <Script
        id={`product-schema-${product.id}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    </>
  );
}
