import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import ClientWrapper from '@/components/ClientWrapper';
import { StoreProvider } from './providers/StoreProvider';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Hockey Pouches - Premium Hockey Equipment Storage',
  description: 'High-quality hockey equipment storage solutions for professionals and enthusiasts.',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  themeColor: '#12121a',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Hockey Pouches',
  },
  applicationName: 'Hockey Pouches',
  formatDetection: {
    telephone: false,
    date: false,
    email: false,
    address: false,
  },
  openGraph: {
    siteName: 'Hockey Pouches',
    type: 'website',
    locale: 'en_CA',
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@hockeypouches',
    site: '@hockeypouches',
  },
  colorScheme: 'dark',
  viewport: {
    width: 'device-width',
    initialScale: 1,
  },
  manifest: '/manifest.json',
  metadataBase: new URL('https://hockeypouches.com'),
  alternates: {
    canonical: '/',
  },
  other: {
    'msapplication-TileColor': '#12121a',
    'mobile-web-app-capable': 'yes',
    'msapplication-navbutton-color': '#12121a',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.google-analytics.com" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://www.clarity.ms" />
      </head>
      <body
        className={`${inter.variable} bg-dark-500 font-sans text-white antialiased`}
        suppressHydrationWarning
      >
        <StoreProvider>
          <ClientWrapper>{children}</ClientWrapper>
        </StoreProvider>
      </body>
    </html>
  );
}
