import { Metadata, Viewport } from 'next';
import { baseMetadata, baseViewport } from '@/config/metadata';

export const metadata: Metadata = {
  ...baseMetadata,
  title: 'Logs | PUXX - Premium Nicotine Pouches',
  description: 'PUXX logs page - Experience premium nicotine pouches with exceptional quality and flavor.',
  openGraph: {
    ...baseMetadata.openGraph,
    title: 'Logs | PUXX - Premium Nicotine Pouches',
    description: 'PUXX logs page - Experience premium nicotine pouches with exceptional quality and flavor.',
  },
};

export const viewport: Viewport = {
  ...baseViewport,
};