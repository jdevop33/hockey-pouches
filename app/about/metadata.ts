import { Metadata, Viewport } from 'next';
import { baseMetadata, baseViewport } from '../config/metadata';

export const metadata: Metadata = {
  ...baseMetadata,
  title: 'About PUXX - Premium Nicotine Pouches',
  description:
    'Learn about PUXX, our story, values, and commitment to creating the best nicotine pouch experience.',
  openGraph: {
    ...baseMetadata.openGraph,
    title: 'About PUXX - Premium Nicotine Pouches',
    description:
      'Learn about PUXX, our story, values, and commitment to creating the best nicotine pouch experience.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  ...baseViewport,
};
