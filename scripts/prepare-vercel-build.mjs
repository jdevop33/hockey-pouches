#!/usr/bin/env node

/**
 * prepare-vercel-build.mjs
 *
 * This script runs all the fix scripts before the Next.js build to ensure
 * that the deployment works correctly on Vercel.
 */

import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// Log function with timestamp
function log(message) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
}

// Run a command and return its output
function runCommand(command) {
  try {
    log(`Running: ${command}`);
    const output = execSync(command, { cwd: ROOT_DIR, encoding: 'utf-8' });
    return output.trim();
  } catch (error) {
    log(`Error running command: ${command}`);
    log(error.message);
    if (error.stdout) log(`stdout: ${error.stdout}`);
    if (error.stderr) log(`stderr: ${error.stderr}`);
    throw error;
  }
}

async function main() {
  try {
    log('Starting pre-build preparation...');

    // 1. Fix schema imports
    log('Step 1: Fixing schema imports...');
    runCommand('node scripts/fix-schema-imports.mjs');

    // 2. Fix cache tags
    log('Step 2: Fixing cache tags...');
    runCommand('node scripts/fix-cache-tags.mjs');

    // 3. Fix specific cache issues
    log('Step 3: Fixing specific cache issues...');
    runCommand('node scripts/fix-specific-cache-issues.mjs');

    // 4. Fix import paths in client components
    log('Step 4: Fixing import paths in client components...');
    runCommand('node scripts/fix-import-paths.mjs');

    // 5. Fix image issues
    log('Step 5: Fixing image issues...');
    runCommand('node scripts/fix-image-issues.mjs');

    // 6. Fix missing product images
    log('Step 6: Creating any missing product images...');
    runCommand('node scripts/fix-missing-product-images.mjs');

    // 7. Fix lint issues
    log('Step 7: Fixing lint issues...');
    runCommand('node scripts/fix-lint-issues.mjs');

    log('All preparation steps completed successfully!');
    log('Ready for Next.js build.');

    process.exit(0);
  } catch (error) {
    log(`Error during preparation: ${error.message}`);
    process.exit(1);
  }
}

// Run the main function
main().catch(error => {
  log(`Unexpected error: ${error.message}`);
  process.exit(1);
});
