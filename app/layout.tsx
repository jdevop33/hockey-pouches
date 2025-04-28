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
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="canonical" href="https://nicotinetins.com" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
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
      </head>
      <body
        className={`${inter.className} bg-dark-500 font-sans text-white antialiased`}
        suppressHydrationWarning
      >
        <StoreProvider>
          <ClientWrapper>{children}</ClientWrapper>
        </StoreProvider>
      </body>
    </html>
  );
}
