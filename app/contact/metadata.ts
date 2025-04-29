import { Metadata, Viewport } from 'next';
import { baseMetadata, baseViewport } from '@/config/metadata';

export const metadata: Metadata = {
  ...baseMetadata,
  title: 'Contact | PUXX - Premium Nicotine Pouches',
  description: 'PUXX contact page - Experience premium nicotine pouches with exceptional quality and flavor.',
  openGraph: {
    ...baseMetadata.openGraph,
    title: 'Contact | PUXX - Premium Nicotine Pouches',
    description: 'PUXX contact page - Experience premium nicotine pouches with exceptional quality and flavor.',
  },
};

export const viewport: Viewport = {
  ...baseViewport,
};