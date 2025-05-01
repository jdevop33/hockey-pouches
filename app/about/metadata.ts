import { Metadata, Viewport } from 'next';
import { baseMetadata, baseViewport } from '@/config/metadata';

export const metadata: Metadata = {
  ...baseMetadata,
  title: 'About | PUXX - Premium Nicotine Pouches',
  description: 'Learn about PUXX - Our story, mission, and commitment to quality nicotine pouches.',
  openGraph: {
    ...baseMetadata.openGraph,
    title: 'About | PUXX - Premium Nicotine Pouches',
    description:
      'Learn about PUXX - Our story, mission, and commitment to quality nicotine pouches.'}};

export const viewport: Viewport = {
  ...baseViewport,
};
