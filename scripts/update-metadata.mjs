import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const appDir = path.join(__dirname, '..', 'app');

const metadataTemplate = `import { Metadata, Viewport } from 'next';
import { baseMetadata, baseViewport } from '@/config/metadata';

export const metadata: Metadata = {
  ...baseMetadata,
  title: 'PAGE_TITLE',
  description: 'PAGE_DESCRIPTION',
  openGraph: {
    ...baseMetadata.openGraph,
    title: 'PAGE_TITLE',
    description: 'PAGE_DESCRIPTION',
  },
};

export const viewport: Viewport = {
  ...baseViewport,
};`;

async function* walk(dir) {
  const dirents = await fs.readdir(dir, { withFileTypes: true });
  for (const dirent of dirents) {
    const res = path.resolve(dir, dirent.name);
    if (dirent.isDirectory()) {
      yield* walk(res);
    } else {
      yield res;
    }
  }
}

async function updateMetadata() {
  try {
    for await (const filePath of walk(appDir)) {
      if (filePath.endsWith('page.tsx') || filePath.endsWith('page.ts')) {
        const dir = path.dirname(filePath);
        const metadataPath = path.join(dir, 'metadata.ts');

        // Skip if metadata file already exists
        try {
          await fs.access(metadataPath);
          console.log(`Metadata file already exists: ${metadataPath}`);
          continue;
        } catch {}

        // Generate page-specific metadata
        const pageName = path.basename(dir);
        const title = `${pageName.charAt(0).toUpperCase() + pageName.slice(1)} | PUXX - Premium Nicotine Pouches`;
        const description = `PUXX ${pageName} page - Experience premium nicotine pouches with exceptional quality and flavor.`;

        const metadata = metadataTemplate
          .replace(/PAGE_TITLE/g, title)
          .replace(/PAGE_DESCRIPTION/g, description);

        await fs.writeFile(metadataPath, metadata, 'utf8');
        console.log(`Created metadata file: ${metadataPath}`);
      }
    }
  } catch (error) {
    console.error('Error updating metadata:', error);
  }
}

updateMetadata();
