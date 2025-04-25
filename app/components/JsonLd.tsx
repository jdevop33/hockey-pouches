'use client';

import React from 'react';
import { Product } from '@/types';

interface JsonLdProps {
  data: any;
}

/**
 * JSON-LD component for adding structured data to pages
 */
export default function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/**
 * Generate product structured data
 */
export function generateProductJsonLd(product: Product, url: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image_url,
    sku: `HP-${product.id}`,
    mpn: `HP-${product.id}`,
    brand: {
      '@type': 'Brand',
      name: 'Hockey Pouches',
    },
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: 'USD',
      price: product.price,
      priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      availability: product.is_active ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'Hockey Pouches',
      },
    },
  };
}

/**
 * Generate organization structured data
 */
export function generateOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Hockey Pouches',
    url: 'https://hockeypouches.com',
    logo: 'https://hockeypouches.com/images/logo.png',
    sameAs: [
      'https://facebook.com/hockeypouches',
      'https://instagram.com/hockeypouches',
      'https://twitter.com/hockeypouches',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+1-800-123-4567',
      contactType: 'customer service',
      email: 'support@hockeypouches.com',
    },
  };
}

/**
 * Generate breadcrumb structured data
 */
export function generateBreadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `https://hockeypouches.com${item.url}`,
    })),
  };
}
