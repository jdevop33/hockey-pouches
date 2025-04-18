import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import CartWrapper from './components/CartWrapper';
import GoogleAnalytics from './components/GoogleAnalytics';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://hockeypouches.ca'),
  title: 'Hockey Pouches - Premium Nicotine Pouches for Hockey Players',
  description:
    'Premium tobacco-free nicotine pouches designed for hockey players and fans across Canada. Discreet, convenient, and perfect for your active lifestyle.',
  keywords:
    'nicotine pouches, hockey, tobacco-free, Canada, athletes, sports, energy, performance, discreet',
  authors: [{ name: 'Hockey Pouches Team' }],
  creator: 'Hockey Pouches',
  publisher: 'Hockey Pouches',
  openGraph: {
    title: 'Hockey Pouches - Premium Nicotine Pouches for Hockey Players',
    description:
      'Premium tobacco-free nicotine pouches designed for hockey players and fans across Canada.',
    url: 'https://hockeypouches.ca',
    siteName: 'Hockey Pouches',
    images: [
      {
        url: '/images/logo/logo3.svg', // Using the new logo
        width: 1200,
        height: 630,
        alt: 'Hockey Pouches - Premium Nicotine Pouches',
      },
    ],
    locale: 'en_CA',
    type: 'website',
  },
  // Updated from Twitter to X
  twitter: {
    card: 'summary_large_image',
    title: 'Hockey Pouches - Premium Nicotine Pouches for Hockey Players',
    description:
      'Premium tobacco-free nicotine pouches designed for hockey players and fans across Canada.',
    images: ['/images/logo/logo3.svg'], // Using the new logo
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="canonical" href="https://hockeypouches.ca" />
        <link rel="icon" href="/images/logo/logo3.svg" sizes="any" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/images/logo/logo3.svg" sizes="180x180" />
        <link rel="icon" type="image/png" sizes="32x32" href="/images/logo/logo3.svg" />
        <link rel="icon" type="image/png" sizes="16x16" href="/images/logo/logo3.svg" />

        {/* Additional social media tags */}
        <meta property="og:site_name" content="Hockey Pouches" />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="en_CA" />
        {/* X (formerly Twitter) meta tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:creator" content="@hockeypouches" />

        {/* Color theme */}
        <meta name="theme-color" content="#0F172A" />
        <meta name="msapplication-TileColor" content="#0F172A" />
      </head>
      <body className={`${inter.variable} font-sans`}>
        <GoogleAnalytics />
        <CartWrapper>{children}</CartWrapper>
      </body>
    </html>
  );
}
