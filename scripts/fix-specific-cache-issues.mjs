#!/usr/bin/env node
/**
 * fix-specific-cache-issues.mjs
 *
 * This script targets and fixes specific issues with unstable_cache tags
 * in the API routes related to products.
 *
 * Usage: node scripts/fix-specific-cache-issues.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');

// Specific routes to target with known cache issues
const TARGET_FILES = [
  'app/api/products/[productId]/related/route.ts',
  'app/api/products/[productId]/route.ts',
  'app/lib/services/product-service.ts',
];

// Fix for product related cache tag issue
const fixRelatedProductsCache = content => {
  // Find and fix the unstable_cache call in related products
  const relatedProductsPattern = /tags\s*:\s*\[([^\]]*)\]/g;
  let updatedContent = content;

  if (content.includes('getRelatedProducts') && content.includes('unstable_cache')) {
    console.log('Fixing getRelatedProducts cache tags...');

    // Replace undefined tags with proper string tags
    updatedContent = updatedContent.replace(relatedProductsPattern, (match, tagGroup) => {
      if (tagGroup.includes('undefined') || tagGroup.trim() === '') {
        // Add proper tags for related products
        return 'tags: ["products", "related-products"]';
      }
      return match;
    });
  }

  // Fix product details cache
  if (content.includes('getProductFromDb') && content.includes('unstable_cache')) {
    console.log('Fixing getProductFromDb cache tags...');

    // Find the options in unstable_cache
    const optionsPattern = /{\s*tags\s*:(?:[^}]*)}/gs;

    // Replace the options with the proper pattern
    updatedContent = updatedContent.replace(optionsPattern, match => {
      if (match.includes('(productId)') || match.includes('undefined')) {
        return '{\n      tags: ["product-detail"],\n      revalidate: 3600\n  }';
      }
      return match;
    });
  }

  return updatedContent;
};

// Main function
const run = async () => {
  console.log('🔧 Fixing specific cache issues in target files...');

  let fixedFiles = 0;

  for (const relativePath of TARGET_FILES) {
    const filePath = path.join(ROOT_DIR, relativePath);

    if (!fs.existsSync(filePath)) {
      console.log(`⚠️ File not found: ${relativePath}`);
      continue;
    }

    console.log(`Processing ${relativePath}...`);
    const content = fs.readFileSync(filePath, 'utf8');
    const updatedContent = fixRelatedProductsCache(content);

    if (content !== updatedContent) {
      fs.writeFileSync(filePath, updatedContent);
      console.log(`✅ Fixed cache issues in ${relativePath}`);
      fixedFiles++;
    } else {
      console.log(`ℹ️ No issues found in ${relativePath}`);
    }
  }

  console.log(`🎉 Fixed cache issues in ${fixedFiles} files.`);
};

// Run the script
run().catch(error => {
  console.error(`❌ Error: ${error.message}`);
  process.exit(1);
});
