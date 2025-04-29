import { Metadata, Viewport } from 'next';
import { baseMetadata, baseViewport } from '@/config/metadata';

export const metadata: Metadata = {
  ...baseMetadata,
  title: '[orderId] | PUXX - Premium Nicotine Pouches',
  description: 'PUXX [orderId] page - Experience premium nicotine pouches with exceptional quality and flavor.',
  openGraph: {
    ...baseMetadata.openGraph,
    title: '[orderId] | PUXX - Premium Nicotine Pouches',
    description: 'PUXX [orderId] page - Experience premium nicotine pouches with exceptional quality and flavor.',
  },
};

export const viewport: Viewport = {
  ...baseViewport,
};