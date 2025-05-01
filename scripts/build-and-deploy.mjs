#!/usr/bin/env node
/**
 * build-and-deploy.mjs
 *
 * This script runs the necessary fixes before building the application:
 * 1. Fixes schema imports using fix-schema-imports.mjs
 * 2. Fixes viewport metadata format using fix-viewport-metadata.mjs
 * 3. Fixes unstable_cache tag issues using fix-cache-tags.mjs
 *
 * Usage: node scripts/build-and-deploy.mjs
 */

import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');

// Output with timestamp function
const log = message => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
};

const runCommand = command => {
  log(`Running: ${command}`);
  try {
    execSync(command, { stdio: 'inherit' });
    return true;
  } catch (error) {
    log(`Error running command: ${command}`);
    log(error.message);
    return false;
  }
};

// Add a function to fix the cache tag issues directly
const fixPersistentCacheIssues = () => {
  log(`Running manual fix for persistent cache tag issues...`);

  // Target files with known issues
  const productRelatedRoute = path.join(ROOT_DIR, 'app/api/products/[productId]/related/route.ts');
  const productRoute = path.join(ROOT_DIR, 'app/api/products/[productId]/route.ts');

  try {
    // Fix related products route
    if (fs.existsSync(productRelatedRoute)) {
      log(`Fixing ${productRelatedRoute}`);
      let content = fs.readFileSync(productRelatedRoute, 'utf8');

      // Replace the tags section with a hardcoded valid solution
      content = content.replace(
        /tags\s*:\s*\([^)]*\)\s*=>\s*\[([^\]]*)\]/g,
        'tags: ["product-related"]'
      );

      fs.writeFileSync(productRelatedRoute, content);
    }

    // Fix product route
    if (fs.existsSync(productRoute)) {
      log(`Fixing ${productRoute}`);
      let content = fs.readFileSync(productRoute, 'utf8');

      // Replace the tags section with a hardcoded valid solution
      content = content.replace(
        /tags\s*:\s*\([^)]*\)\s*=>\s*\[([^\]]*)\]/g,
        'tags: ["product-detail"]'
      );

      fs.writeFileSync(productRoute, content);
    }

    return true;
  } catch (error) {
    log(`Error fixing persistent cache issues: ${error.message}`);
    return false;
  }
};

const main = async () => {
  log('Starting build and deploy process...');

  // 1. Fix schema imports
  log('Step 1: Fixing schema imports...');
  if (!runCommand('node scripts/fix-schema-imports.mjs')) {
    log('Failed to fix schema imports. Aborting.');
    process.exit(1);
  }

  // 2. Fix viewport metadata
  log('Step 2: Fixing viewport metadata...');
  if (!runCommand('node scripts/fix-viewport-metadata.mjs')) {
    log('Failed to fix viewport metadata. Aborting.');
    process.exit(1);
  }

  // 3. Fix unstable_cache tags
  log('Step 3: Fixing unstable_cache tags...');
  if (!runCommand('node scripts/fix-cache-tags.mjs')) {
    log('Failed to fix unstable_cache tags. Aborting.');
    process.exit(1);
  }

  // 4. Fix specific unstable_cache issues
  log('Step 4: Fixing specific unstable_cache issues...');
  if (!runCommand('node scripts/fix-specific-cache-issues.mjs')) {
    log('Failed to fix specific unstable_cache issues. Aborting.');
    process.exit(1);
  }

  // 5. Apply manual fixes for persistent issues
  log('Step 5: Applying manual fixes for persistent issues...');
  if (!fixPersistentCacheIssues()) {
    log('Failed to apply manual fixes. Aborting.');
    process.exit(1);
  }

  // 6. Run production build
  log('Step 6: Running production build...');
  if (!runCommand('next build')) {
    log('Build failed. Aborting.');
    process.exit(1);
  }

  log('Build and fixes completed successfully!');
};

// Run the script
main().catch(error => {
  log(`Unhandled error: ${error.message}`);
  process.exit(1);
});
