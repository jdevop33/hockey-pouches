import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import CartWrapper from './components/CartWrapper';
import { Analytics } from '@vercel/analytics/react';
import { WebVitals } from './_components/web-vitals';
import PerformanceMonitoring from './components/PerformanceMonitoring';
import { DatabaseInit } from './_components/database-init';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { CsrfProvider } from './context/CsrfContext';
import './components/SEO';
import './components/JsonLd';
import { ThemeProvider } from './components/theme-provider';

// Analytics tracking IDs - configured for production deployment
const GA_TRACKING_ID = 'G-PMM01WKF05';
const CLARITY_TRACKING_ID = 'r6bz25gfvl';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://nicotinetins.com'),
  title: 'PUXX Premium - Luxury Nicotine Pouches | Premium Tobacco-Free Experience',
  description:
    'Experience premium tobacco-free nicotine pouches by PUXX Premium. Meticulously crafted for those who demand excellence. Discreet, convenient, and perfect for your lifestyle. Free shipping on orders over $50.',
  keywords:
    'nicotine pouches, PUXX Premium, tobacco-free, luxury nicotine, premium pouches, discreet nicotine, smoke-free, odorless',
  authors: [{ name: 'PUXX Premium Team' }],
  creator: 'PUXX Premium',
  publisher: 'PUXX Premium',
  alternates: {
    canonical: 'https://puxxpremium.com',
  },
  openGraph: {
    title: 'PUXX Premium - Luxury Nicotine Pouches | Premium Tobacco-Free Experience',
    description:
      'Experience premium tobacco-free nicotine pouches by PUXX Premium. Meticulously crafted for those who demand excellence. Discreet, convenient, and perfect for your lifestyle.',
    url: 'https://puxxpremium.com',
    siteName: 'PUXX Premium',
    images: [
      {
        url: '/images/logo/puxx-logo.svg',
        width: 1200,
        height: 630,
        alt: 'PUXX Premium - Luxury Nicotine Pouches',
      },
    ],
    locale: 'en_CA',
    type: 'website',
  },
  // Updated from Twitter to X
  twitter: {
    card: 'summary_large_image',
    title: 'PUXX Premium - Luxury Nicotine Pouches',
    description:
      'Experience premium tobacco-free nicotine pouches by PUXX Premium. Meticulously crafted for those who demand excellence.',
    images: ['/images/logo/puxx-logo.svg'],
    creator: '@puxxpremium',
    site: '@puxxpremium',
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
    google: 'google-site-verification-code', // Replace with actual code when available
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* ... (keep existing head content) ... */}
        <link rel="canonical" href="https://puxxpremium.com" />
        <link rel="icon" href="/images/logo/puxx-logo.svg" sizes="any" />
        <link rel="apple-touch-icon" href="/images/logo/puxx-logo.svg" sizes="256x256" />
        <link rel="icon" type="image/svg+xml" sizes="64x64" href="/images/logo/puxx-logo.svg" />
        <link rel="icon" type="image/svg+xml" sizes="48x48" href="/images/logo/puxx-logo.svg" />
        <meta name="format-detection" content="telephone=no, date=no, email=no, address=no" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.google-analytics.com" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://www.clarity.ms" />
        <meta property="og:site_name" content="PUXX Premium" />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="en_CA" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:creator" content="@puxxpremium" />
        <meta name="twitter:site" content="@puxxpremium" />
        <meta name="theme-color" content="#d4af37" />
        <meta name="msapplication-TileColor" content="#d4af37" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="PUXX Premium" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="PUXX Premium" />
        <Script
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
        />
        <Script
          id="gtag-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_TRACKING_ID}', {
                page_path: window.location.pathname + window.location.search,
                transport_type: 'beacon',
                send_page_view: true,
                anonymize_ip: true
              });
            `,
          }}
        />
        <Script
          id="clarity-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(c,l,a,r,i,t,y){
                  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "${CLARITY_TRACKING_ID}");
            `,
          }}
        />
        <Script
          id="website-schema"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              '@id': 'https://puxxpremium.com/#website',
              url: 'https://puxxpremium.com',
              name: 'PUXX Premium',
              description:
                'Experience premium tobacco-free nicotine pouches by PUXX Premium. Meticulously crafted for those who demand excellence. Discreet, convenient, and perfect for your lifestyle.',
              potentialAction: [
                {
                  '@type': 'SearchAction',
                  target: {
                    '@type': 'EntryPoint',
                    urlTemplate: 'https://puxxpremium.com/products?search={search_term_string}',
                  },
                  'query-input': 'required name=search_term_string',
                },
              ],
              publisher: {
                '@type': 'Organization',
                name: 'PUXX Premium',
                logo: {
                  '@type': 'ImageObject',
                  url: 'https://puxxpremium.com/images/logo/puxx-logo.svg',
                },
              },
            }),
          }}
        />
        <Script
          id="organization-schema"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              '@id': 'https://puxxpremium.com/#organization',
              name: 'PUXX Premium',
              url: 'https://puxxpremium.com',
              logo: {
                '@type': 'ImageObject',
                url: 'https://puxxpremium.com/images/logo/puxx-logo.svg',
                width: 512,
                height: 512,
              },
              sameAs: [
                'https://twitter.com/puxxpremium',
                'https://www.instagram.com/puxxpremium',
                'https://www.facebook.com/puxxpremium',
              ],
              contactPoint: [
                {
                  '@type': 'ContactPoint',
                  telephone: '+1-250-415-5678',
                  contactType: 'customer service',
                  email: 'info@puxxpremium.com',
                  areaServed: 'CA',
                  availableLanguage: ['English', 'French'],
                },
              ],
            }),
          }}
        />
      </head>
      <body className={`${inter.variable} font-sans`} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="light">
          <AuthProvider>
            <ToastProvider>
              <CsrfProvider>
                {/* Web Vitals Tracking */}
                <WebVitals />
                {/* Performance Monitoring */}
                <PerformanceMonitoring />
                {/* Vercel Analytics */}
                <Analytics />
                {/* Database Initialization */}
                <DatabaseInit />
                {/* Main Content */}
                <CartWrapper>{children}</CartWrapper>
              </CsrfProvider>
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
