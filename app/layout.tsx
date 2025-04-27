import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import { WebVitals } from './_components/web-vitals';
import { DatabaseInit } from './_components/database-init';
import { Providers } from './providers';
import { AnalyticsScripts } from './_components/analytics-scripts';
import CartWrapper from './components/CartWrapper';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://nicotinetins.com'),
  title: 'Nicotine Tins - Premium Nicotine Pouches by PUXX | Best Tobacco-Free Pouches in Canada',
  description:
    'Premium tobacco-free nicotine pouches by PUXX, designed for discerning adults across Canada. Discreet, convenient, and perfect for your active lifestyle. Free shipping on orders over $50.',
  keywords:
    'nicotine pouches, PUXX, tobacco-free, Canada, performance, discreet, nicotine tins, premium',
  authors: [{ name: 'PUXX Team' }],
  creator: 'PUXX',
  publisher: 'Nicotine Tins',
  alternates: {
    canonical: 'https://nicotinetins.com',
  },
  icons: {
    icon: [
      { url: '/images/logo/logo3.svg', sizes: 'any', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: '32x32', type: 'image/x-icon' },
    ],
    apple: [{ url: '/images/logo/logo3.svg', sizes: '256x256', type: 'image/svg+xml' }],
    shortcut: [{ url: '/images/logo/logo3.svg' }],
  },
  openGraph: {
    title: 'Nicotine Tins - Premium Nicotine Pouches by PUXX | Best in Canada',
    description:
      'Premium tobacco-free nicotine pouches by PUXX, designed for discerning adults across Canada. Discreet, convenient, and perfect for your active lifestyle.',
    url: 'https://nicotinetins.com',
    siteName: 'Premium Nicotine Tins by PUXX',
    images: [
      {
        url: '/images/logo/logo3.svg',
        width: 1200,
        height: 630,
        alt: 'Nicotine Tins - Premium Nicotine Pouches by PUXX',
      },
    ],
    locale: 'en_CA',
    type: 'website',
  },
  // Updated from Twitter to X
  twitter: {
    card: 'summary_large_image',
    title: 'Nicotine Tins - Premium Nicotine Pouches by PUXX',
    description:
      'Premium tobacco-free nicotine pouches designed for discerning adults across Canada. Free shipping on orders over $50.',
    images: ['/images/logo/logo3.svg'],
    creator: '@nicotinetins',
    site: '@nicotinetins',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || '',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="canonical" href="https://nicotinetins.com" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/images/logo/logo3.svg" sizes="256x256" />
        <meta name="format-detection" content="telephone=no, date=no, email=no, address=no" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.google-analytics.com" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://www.clarity.ms" />
        <meta property="og:site_name" content="Nicotine Tins by PUXX" />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="en_CA" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:creator" content="@nicotinetins" />
        <meta name="twitter:site" content="@nicotinetins" />
        <meta name="msapplication-TileColor" content="#12121a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Nicotine Tins by PUXX" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="Nicotine Tins by PUXX" />
        <meta name="theme-color" content="#12121a" />
        <meta name="msapplication-navbutton-color" content="#12121a" />
        <meta name="apple-mobile-web-app-status-bar-style" content="#12121a" />
        <meta name="color-scheme" content="dark" />

        {/* Analytics scripts moved to a separate client component */}
        <AnalyticsScripts />
      </head>
      <body
        className={`${inter.variable} bg-dark-500 font-sans text-white antialiased`}
        suppressHydrationWarning
      >
        <Providers>
          {/* Web Vitals Tracking */}
          <WebVitals />
          {/* Vercel Analytics */}
          <Analytics />
          {/* Database Initialization */}
          <DatabaseInit />
          {/* Main Content */}
          <CartWrapper>{children}</CartWrapper>
        </Providers>
      </body>
    </html>
  );
}
