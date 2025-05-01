'use client';

import React from 'react';

import * as schema from '@/lib/schema';
interface WebsiteSchemaProps {
  siteUrl?: string;
  siteName?: string;
  logo?: string;
  title?: string;
  description?: string;
}

const WebsiteSchemaScript: React.FC<WebsiteSchemaProps> = ({
  siteUrl = 'https://nicotinetins.com',
  siteName = 'Nicotine Tins by Hockey Puxx',
  logo = 'https://nicotinetins.com/images/logo/hockey-logo2.png',
  title = 'Nicotine Tins - Premium Nicotine Pouches by Hockey Puxx',
  description = 'Premium tobacco-free nicotine pouches designed for hockey players and fans across Canada. Discreet, convenient, and perfect for your active lifestyle.',
}) => {
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${siteUrl}/#website`,
    url: siteUrl,
    name: siteName,
    description: description,
    potentialAction: [
      {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${siteUrl}/products?search={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    ],
    publisher: {
      '@type': 'Organization',
      name: siteName,
      logo: {
        '@type': 'ImageObject',
        url: logo,
      },
    },
  };

  const organizationData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${siteUrl}/#organization`,
    name: siteName,
    url: siteUrl,
    logo: {
      '@type': 'ImageObject',
      url: logo,
      width: 512,
      height: 512,
    },
    sameAs: [
      'https://twitter.com/nicotinetins',
      'https://www.instagram.com/nicotinetins',
      'https://www.facebook.com/nicotinetins',
    ],
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: '+1-250-415-5678',
        contactType: 'customer service',
        email: 'info@nicotinetins.com',
        areaServed: 'CA',
        availableLanguage: ['English', 'French'],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationData) }}
      />
    </>
  );
};

export default WebsiteSchemaScript;
