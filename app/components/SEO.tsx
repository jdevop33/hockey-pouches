import React from 'react';
import Head from 'next/head';
import { Metadata } from 'next';

export interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  noindex?: boolean;
  keywords?: string[];
  ogType?: 'website' | 'article' | 'product';
  children?: React.ReactNode;
}

/**
 * Default SEO values
 */
export const defaultSEO = {
  title: 'Hockey Pouches - Premium Nicotine Pouches',
  description: 'Discover premium nicotine pouches from Hockey Pouches. Enjoy a variety of flavors and strengths for a satisfying nicotine experience without tobacco.',
  ogImage: '/images/og-image.jpg',
  keywords: ['nicotine pouches', 'tobacco-free', 'hockey pouches', 'nicotine products', 'oral nicotine'],
  ogType: 'website' as const,
};

/**
 * Generate metadata for a page
 */
export function generateMetadata({
  title = defaultSEO.title,
  description = defaultSEO.description,
  ogImage = defaultSEO.ogImage,
  keywords = defaultSEO.keywords,
  ogType = defaultSEO.ogType,
  noindex = false,
  canonical,
}: SEOProps): Metadata {
  // Construct full title with brand name
  const fullTitle = title === defaultSEO.title ? title : `${title} | Hockey Pouches`;
  
  return {
    title: fullTitle,
    description,
    keywords: keywords.join(', '),
    robots: noindex ? 'noindex, nofollow' : 'index, follow',
    openGraph: {
      title: fullTitle,
      description,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type: ogType,
      siteName: 'Hockey Pouches',
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [ogImage],
    },
    alternates: canonical ? {
      canonical,
    } : undefined,
  };
}

/**
 * SEO component for adding metadata to pages
 */
export default function SEO({
  title = defaultSEO.title,
  description = defaultSEO.description,
  canonical,
  ogImage = defaultSEO.ogImage,
  noindex = false,
  keywords = defaultSEO.keywords,
  ogType = defaultSEO.ogType,
  children,
}: SEOProps) {
  // Construct full title with brand name
  const fullTitle = title === defaultSEO.title ? title : `${title} | Hockey Pouches`;
  
  // Construct canonical URL
  const canonicalUrl = canonical 
    ? `https://hockeypouches.com${canonical}` 
    : undefined;
  
  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(', ')} />
      
      {/* Robots meta tag */}
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      
      {/* Canonical URL */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content="Hockey Pouches" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      
      {/* Additional SEO elements */}
      {children}
    </Head>
  );
}
