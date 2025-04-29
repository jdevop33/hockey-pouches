import { Metadata, Viewport } from 'next';

export const baseMetadata: Metadata = {
  metadataBase: new URL('https://puxx.com'),
  title: {
    default: 'PUXX - Premium Nicotine Pouches',
    template: '%s | PUXX',
  },
  description:
    'Experience the finest nicotine pouches with PUXX. Premium quality, exceptional flavors, and superior satisfaction.',
  openGraph: {
    type: 'website',
    siteName: 'PUXX',
    title: 'PUXX - Premium Nicotine Pouches',
    description:
      'Experience the finest nicotine pouches with PUXX. Premium quality, exceptional flavors, and superior satisfaction.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PUXX - Premium Nicotine Pouches',
    description:
      'Experience the finest nicotine pouches with PUXX. Premium quality, exceptional flavors, and superior satisfaction.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const baseViewport: Viewport = {
  themeColor: '#000000',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};
