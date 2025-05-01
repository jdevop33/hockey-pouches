import { Metadata, Viewport } from 'next';
import { baseMetadata, baseViewport } from '@/config/metadata';

export const metadata: Metadata = {
  ...baseMetadata,
  title: 'Privacy | PUXX - Premium Nicotine Pouches',
  description: 'PUXX privacy page - Experience premium nicotine pouches with exceptional quality and flavor.',
  openGraph: {
    ...baseMetadata.openGraph,
    title: 'Privacy | PUXX - Premium Nicotine Pouches',
    description: 'PUXX privacy page - Experience premium nicotine pouches with exceptional quality and flavor.'}};

export const viewport: Viewport = {
  ...baseViewport,
};