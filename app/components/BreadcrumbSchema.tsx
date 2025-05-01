'use client';

import React from 'react';

import * as schema from '@/lib/schema';
interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbSchemaProps {
  items: BreadcrumbItem[];
  currentPageName: string;
}

const BreadcrumbSchema: React.FC<BreadcrumbSchemaProps> = ({ items, currentPageName }) => {
  const baseUrl = 'https://nicotinetins.com';
  
  // Create the breadcrumb list items
  const itemListElements = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: baseUrl,
    },
    ...items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 2,
      name: item.name,
      item: `${baseUrl}${item.url}`,
    })),
    {
      '@type': 'ListItem',
      position: items.length + 2,
      name: currentPageName,
    },
  ];

  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: itemListElements,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
    />
  );
};

export default BreadcrumbSchema;
