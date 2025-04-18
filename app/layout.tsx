import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import CartWrapper from './components/CartWrapper';
import GoogleAnalytics from './components/GoogleAnalytics';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Hockey Pouches - Premium Nicotine Pouches for Hockey Players',
  description: 'Premium tobacco-free nicotine pouches designed for hockey players and fans across Canada. Discreet, convenient, and perfect for your active lifestyle.',
  keywords: 'nicotine pouches, hockey, tobacco-free, Canada, athletes, sports, energy, performance, discreet',
  authors: [{ name: 'Hockey Pouches Team' }],
  creator: 'Hockey Pouches',
  publisher: 'Hockey Pouches',
  openGraph: {
    title: 'Hockey Pouches - Premium Nicotine Pouches for Hockey Players',
    description: 'Premium tobacco-free nicotine pouches designed for hockey players and fans across Canada.',
    url: 'https://hockeypouches.ca',
    siteName: 'Hockey Pouches',
    images: [
      {
        url: '/images/hero.jpeg',
        width: 1200,
        height: 630,
        alt: 'Hockey Pouches - Premium Nicotine Pouches',
      },
    ],
    locale: 'en_CA',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hockey Pouches - Premium Nicotine Pouches for Hockey Players',
    description: 'Premium tobacco-free nicotine pouches designed for hockey players and fans across Canada.',
    images: ['/images/hero.jpeg'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="canonical" href="https://hockeypouches.ca" />
      </head>
      <body className={`${inter.variable} font-sans`}>
        <GoogleAnalytics />
        <CartWrapper>
          {children}
        </CartWrapper>
      </body>
    </html>
  );
}
