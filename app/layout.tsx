import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import CartWrapper from './components/CartWrapper';
import { Analytics } from '@vercel/analytics/react';
import { WebVitals } from './_components/web-vitals';
import { DatabaseInit } from './_components/database-init';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { CsrfProvider } from './context/CsrfContext';

// Analytics tracking IDs - configured for production deployment
const GA_TRACKING_ID = 'G-PMM01WKF05';
const CLARITY_TRACKING_ID = 'r6bz25gfvl';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://nicotinetins.com'),
  title:
    'Nicotine Tins - Premium Nicotine Pouches by Hockey Puxx | Best Tobacco-Free Pouches in Canada',
  description:
    'Premium tobacco-free nicotine pouches by Hockey Puxx, designed for hockey players and fans across Canada. Discreet, convenient, and perfect for your active lifestyle. Free shipping on orders over $50.',
  keywords:
    'nicotine pouches, hockey puxx, tobacco-free, Canada, athletes, sports, energy, performance, discreet, nicotine tins, hockey players',
  authors: [{ name: 'Hockey Puxx Team' }],
  creator: 'Hockey Puxx',
  publisher: 'Nicotine Tins',
  alternates: {
    canonical: 'https://nicotinetins.com',
  },
  openGraph: {
    title: 'Nicotine Tins - Premium Nicotine Pouches by Hockey Puxx | Best in Canada',
    description:
      'Premium tobacco-free nicotine pouches by Hockey Puxx, designed for hockey players and fans across Canada. Discreet, convenient, and perfect for your active lifestyle.',
    url: 'https://nicotinetins.com',
    siteName: 'Nicotine Tins by Hockey Puxx',
    images: [
      {
        url: '/images/logo/logo3.svg',
        width: 1200,
        height: 630,
        alt: 'Nicotine Tins - Premium Nicotine Pouches by Hockey Puxx',
      },
    ],
    locale: 'en_CA',
    type: 'website',
  },
  // Updated from Twitter to X
  twitter: {
    card: 'summary_large_image',
    title: 'Nicotine Tins - Premium Nicotine Pouches by Hockey Puxx',
    description:
      'Premium tobacco-free nicotine pouches designed for hockey players and fans across Canada. Free shipping on orders over $50.',
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
    google: 'google-site-verification-code', // Replace with actual code when available
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* ... (keep existing head content) ... */}
        <link rel="canonical" href="https://nicotinetins.com" />
        <link rel="icon" href="/images/logo/logo3.svg" sizes="any" />
        <link rel="apple-touch-icon" href="/images/logo/logo3.svg" sizes="256x256" />
        <link rel="icon" type="image/svg+xml" sizes="64x64" href="/images/logo/logo3.svg" />
        <link rel="icon" type="image/svg+xml" sizes="48x48" href="/images/logo/logo3.svg" />
        <meta name="format-detection" content="telephone=no, date=no, email=no, address=no" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.google-analytics.com" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://www.clarity.ms" />
        <meta property="og:site_name" content="Nicotine Tins by Hockey Puxx" />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="en_CA" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:creator" content="@nicotinetins" />
        <meta name="twitter:site" content="@nicotinetins" />
        <meta name="theme-color" content="#0F172A" />
        <meta name="msapplication-TileColor" content="#0F172A" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Nicotine Tins by Hockey Puxx" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="Nicotine Tins by Hockey Puxx" />
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
              '@id': 'https://nicotinetins.com/#website',
              url: 'https://nicotinetins.com',
              name: 'Nicotine Tins by Hockey Puxx',
              description:
                'Premium tobacco-free nicotine pouches designed for hockey players and fans across Canada. Discreet, convenient, and perfect for your active lifestyle.',
              potentialAction: [
                {
                  '@type': 'SearchAction',
                  target: {
                    '@type': 'EntryPoint',
                    urlTemplate: 'https://nicotinetins.com/products?search={search_term_string}',
                  },
                  'query-input': 'required name=search_term_string',
                },
              ],
              publisher: {
                '@type': 'Organization',
                name: 'Nicotine Tins by Hockey Puxx',
                logo: {
                  '@type': 'ImageObject',
                  url: 'https://nicotinetins.com/images/logo/logo3.svg',
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
              '@id': 'https://nicotinetins.com/#organization',
              name: 'Nicotine Tins by Hockey Puxx',
              url: 'https://nicotinetins.com',
              logo: {
                '@type': 'ImageObject',
                url: 'https://nicotinetins.com/images/logo/logo3.svg',
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
            }),
          }}
        />
      </head>
      {/* Removed suppressHydrationWarning from body */}
      <body className={`${inter.variable} font-sans`}>
        <AuthProvider>
          <ToastProvider>
            <CsrfProvider>
              {/* Web Vitals Tracking */}
              <WebVitals />
              {/* Vercel Analytics */}
              <Analytics />
              {/* Database Initialization */}
              <DatabaseInit />
              {/* Main Content */}
              <CartWrapper>{children}</CartWrapper>
            </CsrfProvider>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
