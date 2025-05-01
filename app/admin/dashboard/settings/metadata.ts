import { Metadata, Viewport } from 'next';
import { baseMetadata, baseViewport } from '@/config/metadata';

export const metadata: Metadata = {
  ...baseMetadata,
  title: 'Settings | PUXX - Premium Nicotine Pouches',
  description: 'PUXX settings page - Experience premium nicotine pouches with exceptional quality and flavor.',
  openGraph: {
    ...baseMetadata.openGraph,
    title: 'Settings | PUXX - Premium Nicotine Pouches',
    description: 'PUXX settings page - Experience premium nicotine pouches with exceptional quality and flavor.'}};

export const viewport: Viewport = {
  ...baseViewport,
};