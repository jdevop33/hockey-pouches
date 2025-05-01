/**
 * fix-import-paths.mjs
 *
 * This script finds client components with @/ imports and replaces them with relative imports
 * to prevent issues with Next.js component resolution during static generation.
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// Files to process
const CLIENT_COMPONENT_PATTERN = path.join(ROOT_DIR, 'app/**/*.{ts,tsx}');

// Process files
async function processFiles() {
  console.log('🔍 Scanning for client components with @/ imports...');

  // Get all TS and TSX files in app directory
  const files = await glob(CLIENT_COMPONENT_PATTERN);
  console.log(`Found ${files.length} files to analyze`);

  let updatedCount = 0;

  for (const filePath of files) {
    // Read file content
    const content = await fs.readFile(filePath, 'utf8');

    // Check if it's a client component
    if (content.includes("'use client'") || content.includes('"use client"')) {
      // Check if it contains @/ imports
      if (content.includes('from "@/') || content.includes("from '@/")) {
        console.log(
          `📄 Found client component with @/ imports: ${path.relative(ROOT_DIR, filePath)}`
        );

        // Get relative path from this file to the app directory
        const appDir = path.join(ROOT_DIR, 'app');
        const fileDir = path.dirname(filePath);
        const relativeToApp = path.relative(fileDir, appDir);

        // Replace @/ imports with relative paths
        let updatedContent = content;

        // Replace "from '@/lib/" with "from '../lib/" style imports
        updatedContent = updatedContent.replace(
          /from\s+(['"])@\/([^'"]+)(['"])/g,
          (match, quote1, importPath, quote2) => {
            // Get correct relative path based on how deep the file is
            const segments = importPath.split('/');

            // Create proper relative path
            const relativePath = path.join(relativeToApp, segments.join('/'));

            // Fix path separators for JS imports
            const fixedPath = relativePath.replace(/\\/g, '/');

            return `from ${quote1}${fixedPath}${quote2}`;
          }
        );

        // If content has changed, write it back
        if (updatedContent !== content) {
          await fs.writeFile(filePath, updatedContent, 'utf8');
          console.log(`✅ Fixed imports in ${path.relative(ROOT_DIR, filePath)}`);
          updatedCount++;
        }
      }
    }
  }

  if (updatedCount > 0) {
    console.log(`🎉 Fixed imports in ${updatedCount} files.`);
  } else {
    console.log('✅ No import issues found in client components.');
  }
}

// Run the script
processFiles().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
