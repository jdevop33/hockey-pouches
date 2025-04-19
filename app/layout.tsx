import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import dynamic from 'next/dynamic';
import CartWrapper from './components/CartWrapper';
// Import WebsiteSchema dynamically to avoid client/server component issues
const WebsiteSchema = dynamic(() => import('./components/WebsiteSchema'), { ssr: false });

// Dynamically import client components with SSR disabled
const WebVitals = dynamic(() => import('./_components/web-vitals').then(mod => mod.WebVitals), {
  ssr: false,
});
const VercelAnalytics = dynamic(
  () => import('@vercel/analytics/react').then(mod => mod.Analytics),
  { ssr: false }
);

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
        url: '/images/logo/hockey-logo2.png',
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
    images: ['/images/logo/hockey-logo2.png'],
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
        <link rel="canonical" href="https://nicotinetins.com" />
        <link rel="icon" href="/images/logo/hockey-logo2.png" sizes="any" />
        <link rel="apple-touch-icon" href="/images/logo/hockey-logo2.png" sizes="180x180" />
        <link rel="icon" type="image/png" sizes="32x32" href="/images/logo/hockey-logo2.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/images/logo/hockey-logo2.png" />

        {/* Prevent iOS from auto-detecting phone numbers and emails */}
        <meta name="format-detection" content="telephone=no, date=no, email=no, address=no" />

        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.google-analytics.com" />

        {/* Additional social media tags */}
        <meta property="og:site_name" content="Nicotine Tins by Hockey Puxx" />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="en_CA" />

        {/* X (formerly Twitter) meta tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:creator" content="@nicotinetins" />
        <meta name="twitter:site" content="@nicotinetins" />

        {/* Color theme */}
        <meta name="theme-color" content="#0F172A" />
        <meta name="msapplication-TileColor" content="#0F172A" />

        {/* Mobile app capability */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Nicotine Tins by Hockey Puxx" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="Nicotine Tins by Hockey Puxx" />
      </head>
      <body className={`${inter.variable} font-sans`}>
        {/* Google Analytics */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=G-PMM01WKF05`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-PMM01WKF05', {
              page_path: window.location.pathname + window.location.search,
              transport_type: 'beacon',
              send_page_view: true,
              anonymize_ip: true
            });
          `}
        </Script>

        {/* Microsoft Clarity */}
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "r6bz25gfvl");
          `}
        </Script>

        {/* Web Vitals Tracking */}
        <WebVitals />

        {/* Vercel Analytics */}
        <VercelAnalytics />

        {/* Structured Data */}
        <WebsiteSchema
          siteUrl="https://nicotinetins.com"
          siteName="Nicotine Tins by Hockey Puxx"
          logo="https://nicotinetins.com/images/logo/hockey-logo2.png"
          title="Nicotine Tins - Premium Nicotine Pouches by Hockey Puxx | Best Tobacco-Free Pouches in Canada"
          description="Premium tobacco-free nicotine pouches by Hockey Puxx, designed for hockey players and fans across Canada. Discreet, convenient, and perfect for your active lifestyle."
        />

        {/* Main Content */}
        <CartWrapper>{children}</CartWrapper>
      </body>
    </html>
  );
}
