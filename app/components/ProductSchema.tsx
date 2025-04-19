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
    image: [`https://nicotinetins.com${product.imageUrl}`],
    sku: `NT-${product.id}`,
    mpn: `HPNT-${product.id}`,
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
        name: 'Nicotine Tins by Hockey Puxx',
      },
      itemCondition: 'https://schema.org/NewCondition',
      deliveryLeadTime: {
        '@type': 'QuantitativeValue',
        minValue: 1,
        maxValue: 5,
        unitCode: 'DAY',
      },
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '24',
      bestRating: '5',
      worstRating: '1',
    },
    review: [
      {
        '@type': 'Review',
        reviewRating: {
          '@type': 'Rating',
          ratingValue: '5',
          bestRating: '5',
          worstRating: '1',
        },
        author: {
          '@type': 'Person',
          name: 'David Wilson',
        },
        datePublished: '2023-11-15',
        reviewBody:
          'These pouches are a game-changer for me during the season. I can use them discreetly between periods for that extra boost.',
      },
      {
        '@type': 'Review',
        reviewRating: {
          '@type': 'Rating',
          ratingValue: '4',
          bestRating: '5',
          worstRating: '1',
        },
        author: {
          '@type': 'Person',
          name: 'Jennifer Lee',
        },
        datePublished: '2023-10-22',
        reviewBody:
          'As a hockey coach, I was looking for an alternative to traditional tobacco products. These pouches are perfect - discreet and convenient.',
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
    />
  );
};

export default ProductSchema;
