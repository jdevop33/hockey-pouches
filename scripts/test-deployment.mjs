#!/usr/bin/env node

/**
 * test-deployment.mjs
 *
 * This script runs all the fix scripts and a test build to ensure
 * that the deployment will work correctly on Vercel.
 */

import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Log function with timestamp and color
function log(message, color = colors.reset) {
  const timestamp = new Date().toISOString();
  console.log(`${color}[${timestamp}] ${message}${colors.reset}`);
}

// Run a command and return its output
function runCommand(command, { ignoreError = false } = {}) {
  try {
    log(`Running: ${command}`, colors.cyan);
    const output = execSync(command, { cwd: ROOT_DIR, encoding: 'utf-8' });
    return output.trim();
  } catch (error) {
    log(`Error running command: ${command}`, colors.red);
    log(error.message, colors.red);
    if (error.stdout) log(`stdout: ${error.stdout}`);
    if (error.stderr) log(`stderr: ${error.stderr}`, colors.red);

    if (!ignoreError) {
      throw error;
    }

    return null;
  }
}

// Check if a file exists
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (_error) {
    return false;
  }
}

async function main() {
  try {
    log('Starting pre-deployment test...', colors.blue);

    // 1. Verify scripts exist
    log('Step 1: Verifying scripts exist...', colors.blue);
    const requiredScripts = [
      'scripts/fix-schema-imports.mjs',
      'scripts/fix-cache-tags.mjs',
      'scripts/fix-specific-cache-issues.mjs',
      'scripts/fix-import-paths.mjs',
      'scripts/prepare-vercel-build.mjs',
    ];

    const missingScripts = requiredScripts.filter(
      script => !fileExists(path.join(ROOT_DIR, script))
    );

    if (missingScripts.length > 0) {
      log(`Missing scripts: ${missingScripts.join(', ')}`, colors.red);
      throw new Error('Missing required scripts');
    }

    log('All required scripts exist', colors.green);

    // 2. Run the prepare script
    log('Step 2: Running prepare-vercel-build script...', colors.blue);
    runCommand('node scripts/prepare-vercel-build.mjs');
    log('Prepare script completed successfully', colors.green);

    // 3. Test the build
    log('Step 3: Testing build...', colors.blue);
    log('This may take a few minutes...', colors.yellow);
    runCommand('next build');
    log('Build completed successfully', colors.green);

    log('✅ All tests passed! The deployment should work on Vercel.', colors.green);
    process.exit(0);
  } catch (error) {
    log(`❌ Test failed: ${error.message}`, colors.red);
    log('Please fix the issues before deploying to Vercel.', colors.yellow);
    process.exit(1);
  }
}

// Run the main function
main().catch(error => {
  log(`Unexpected error: ${error.message}`, colors.red);
  process.exit(1);
});
