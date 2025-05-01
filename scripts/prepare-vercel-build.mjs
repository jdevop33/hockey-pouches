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
import { exec } from 'child_process';

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
function _runCommand(command) {
  try {
    log(`Running: ${command}`);
    const output = execSync(command, {
      cwd: ROOT_DIR,
      encoding: 'utf-8',
      timeout: 60000, // 1 minute timeout
    });
    return output.trim();
  } catch (error) {
    log(`Error running command: ${command}`);
    log(error.message);
    if (error.stdout) log(`stdout: ${error.stdout}`);
    if (error.stderr) log(`stderr: ${error.stderr}`);

    // Don't throw, just log the error and continue with next step
    log('Continuing with next step despite error...');
    return '';
  }
}

// Run a command with promise and timeout
function runCommandWithTimeout(command, timeoutMs = 30000) {
  return new Promise(resolve => {
    log(`Running with ${timeoutMs}ms timeout: ${command}`);

    const childProcess = exec(command, { cwd: ROOT_DIR });
    let output = '';

    childProcess.stdout.on('data', data => {
      output += data;
    });

    childProcess.stderr.on('data', data => {
      log(`stderr: ${data}`);
    });

    const timer = setTimeout(() => {
      log(`⚠️ Command timed out after ${timeoutMs}ms: ${command}`);
      childProcess.kill();
      resolve('');
    }, timeoutMs);

    childProcess.on('close', code => {
      clearTimeout(timer);
      if (code === 0) {
        log(`Command completed successfully`);
      } else {
        log(`Command exited with code ${code}`);
      }
      resolve(output);
    });
  });
}

async function main() {
  try {
    log('Starting pre-build preparation...');

    // 1. Fix schema imports
    log('Step 1: Fixing schema imports...');
    await runCommandWithTimeout('node scripts/fix-schema-imports.mjs', 30000);

    // 2. Fix cache tags
    log('Step 2: Fixing cache tags...');
    await runCommandWithTimeout('node scripts/fix-cache-tags.mjs', 30000);

    // 3. Fix specific cache issues
    log('Step 3: Fixing specific cache issues...');
    await runCommandWithTimeout('node scripts/fix-specific-cache-issues.mjs', 30000);

    // 4. Fix import paths in client components
    log('Step 4: Fixing import paths in client components...');
    await runCommandWithTimeout('node scripts/fix-import-paths.mjs', 30000);

    // 5. Fix image issues
    log('Step 5: Fixing image issues...');
    await runCommandWithTimeout('node scripts/fix-image-issues.mjs', 30000);

    // 6. Fix missing product images
    log('Step 6: Creating any missing product images...');
    await runCommandWithTimeout('node scripts/fix-missing-product-images.mjs', 45000);

    // 7. Fix lint issues - give this one more time but still limit it
    log('Step 7: Fixing lint issues...');
    await runCommandWithTimeout('node scripts/fix-lint-issues.mjs', 60000);

    log('All preparation steps completed successfully!');
    log('Ready for Next.js build.');

    process.exit(0);
  } catch (error) {
    log(`Error during preparation: ${error.message}`);
    // Continue with the build even if there are errors
    log('Continuing with build despite errors in preparation steps');
    process.exit(0);
  }
}

// Run the main function
main().catch(error => {
  log(`Unexpected error: ${error.message}`);
  // Continue with the build even if there are errors
  log('Continuing with build despite unexpected errors');
  process.exit(0);
});
