#!/usr/bin/env node
/**
 * fix-duplicate-imports.mjs
 *
 * This script fixes duplicate imports caused by fix-schema-imports.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');

// Files with known duplicate imports from the error log
const FILES_TO_FIX = [
  'app/api/payments/manual/route.ts',
  'app/api/products/[productId]/related/route.ts',
  'app/lib/payment.ts',
  'app/lib/services/commission-service.ts',
  'app/lib/services/user-service.ts',
  // Add any other files with duplicate imports here
];

const run = async () => {
  console.log('🔍 Fixing duplicate imports in files...');

  let fixedCount = 0;

  for (const relativePath of FILES_TO_FIX) {
    const filePath = path.join(ROOT_DIR, relativePath);

    try {
      if (!fs.existsSync(filePath)) {
        console.warn(`⚠️ File not found: ${relativePath}`);
        continue;
      }

      const content = fs.readFileSync(filePath, 'utf8');

      // Create a map to track imports by their module path
      const importsByModule = new Map();
      const importLines = content.match(/import\s+.*?from\s+['"].*?['"]/g) || [];

      for (const line of importLines) {
        const modulePath = line.match(/from\s+['"](.*?)['"]/)[1];

        if (!importsByModule.has(modulePath)) {
          importsByModule.set(modulePath, []);
        }

        importsByModule.get(modulePath).push(line);
      }

      let fixedContent = content;

      // Fix duplicate imports
      for (const [modulePath, imports] of importsByModule.entries()) {
        if (imports.length > 1) {
          // If we have multiple imports from the same module, remove all but the first one
          for (let i = 1; i < imports.length; i++) {
            fixedContent = fixedContent.replace(imports[i] + ';', '');
            // Also remove any empty lines left behind
            fixedContent = fixedContent.replace(/\n\s*\n/g, '\n');
          }
        }
      }

      if (fixedContent !== content) {
        fs.writeFileSync(filePath, fixedContent);
        console.log(`✅ Fixed duplicate imports in ${relativePath}`);
        fixedCount++;
      }
    } catch (error) {
      console.error(`❌ Error fixing ${relativePath}:`, error.message);
    }
  }

  if (fixedCount > 0) {
    console.log(`✅ Fixed ${fixedCount} files with duplicate imports`);
  } else {
    console.log('⚠️ No files were fixed');
  }
};

// Run the script
run().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
