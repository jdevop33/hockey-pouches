import { Metadata, Viewport } from 'next';
import { baseMetadata, baseViewport } from '@/config/metadata';

export const metadata: Metadata = {
  ...baseMetadata,
  title: 'Apply | PUXX - Premium Nicotine Pouches',
  description: 'PUXX apply page - Experience premium nicotine pouches with exceptional quality and flavor.',
  openGraph: {
    ...baseMetadata.openGraph,
    title: 'Apply | PUXX - Premium Nicotine Pouches',
    description: 'PUXX apply page - Experience premium nicotine pouches with exceptional quality and flavor.'}};

export const viewport: Viewport = {
  ...baseViewport,
};