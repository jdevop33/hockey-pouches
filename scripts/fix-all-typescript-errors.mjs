#!/usr/bin/env node

/**
 * fix-all-typescript-errors.mjs
 * 
 * This script runs all the TypeScript error fixing scripts in sequence
 */

import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

// Log function with timestamp
function log(message) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
}

// Run a script and return success status
function runScript(scriptName) {
  const scriptPath = path.join(__dirname, scriptName);
  
  try {
    log(`Running ${scriptName}...`);
    execSync(`node ${scriptPath}`, { stdio: 'inherit' });
    log(`✅ ${scriptName} completed successfully`);
    return true;
  } catch (error) {
    log(`❌ ${scriptName} failed: ${error.message}`);
    return false;
  }
}

// Check TypeScript errors
function checkTypeScriptErrors() {
  try {
    log('Running TypeScript type checking...');
    const result = execSync('npx tsc --noEmit', { cwd: rootDir, encoding: 'utf8' });
    log('✅ No TypeScript errors found!');
    return { success: true, errors: 0 };
  } catch (error) {
    // Count the number of errors
    const errorCount = (error.stdout.match(/error TS/g) || []).length;
    log(`❌ TypeScript check failed with ${errorCount} errors`);
    return { success: false, errors: errorCount };
  }
}

// Main function
async function main() {
  log('🛠️ Starting TypeScript error fixing process...');
  
  // Check initial TypeScript errors
  const initialCheck = checkTypeScriptErrors();
  log(`Initial TypeScript check: ${initialCheck.errors} errors`);
  
  // Run scripts in sequence
  const scripts = [
    'revert-placeholder-changes.mjs',
    'fix-template-literals-all.mjs',
    'fix-critical-typescript-errors.mjs'
  ];
  
  let allSuccessful = true;
  
  for (const script of scripts) {
    const success = runScript(script);
    if (!success) {
      allSuccessful = false;
      log(`⚠️ ${script} had issues, but continuing with next script...`);
    }
  }
  
  // Check final TypeScript errors
  const finalCheck = checkTypeScriptErrors();
  
  log(`
📊 Summary:
- Initial TypeScript errors: ${initialCheck.errors}
- Final TypeScript errors: ${finalCheck.errors}
- Errors fixed: ${initialCheck.errors - finalCheck.errors}
- All scripts ran successfully: ${allSuccessful ? 'Yes' : 'No'}
  `);
  
  if (finalCheck.errors > 0) {
    log(`
⚠️ There are still ${finalCheck.errors} TypeScript errors remaining.
For emergency deployment, you can set EMERGENCY_BUILD=true in your environment variables
to bypass TypeScript checking during build.
    `);
  } else {
    log('✅ All TypeScript errors have been fixed!');
  }
}

main().catch(error => {
  log(`❌ Fatal error: ${error.message}`);
  process.exit(1);
});
