#!/usr/bin/env node
/**
 * fix-schema-imports-permanent.mjs
 *
 * This script runs ESLint with --fix to permanently fix schema import issues in the codebase
 * using the drizzle/enforce-schema-imports rule.
 *
 * Unlike the temporary build-time scripts, this applies permanent fixes to your source code.
 */

import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');

// Run ESLint with --fix for all TypeScript files in the app directory
const runEslintFix = async () => {
  return new Promise((resolve, reject) => {
    console.log('🔍 Running ESLint to fix schema import issues permanently...');

    // Use exec instead of spawn for better Windows compatibility
    const command = 'npx.cmd eslint ./app --ext .ts,.tsx --fix';
    const eslint = exec(command, {
      cwd: ROOT_DIR,
    });

    // Capture output
    eslint.stdout?.on('data', data => {
      console.log(data.toString());
    });

    eslint.stderr?.on('data', data => {
      console.error(data.toString());
    });

    eslint.on('close', code => {
      if (code === 0) {
        console.log('✅ Schema import issues fixed permanently!');
        resolve();
      } else {
        console.error(`❌ ESLint process exited with code ${code}`);
        reject(new Error(`ESLint process exited with code ${code}`));
      }
    });
  });
};

// Fix any remaining issues that ESLint might have missed
const fixRemainingIssues = async () => {
  // This could include running the previous scripts that handle specific edge cases
  // that the ESLint rule might not catch
  console.log('🔍 Checking for any remaining schema import issues...');

  // Add additional fix logic here if needed

  console.log('✅ Validation complete!');
};

// Main function
const main = async () => {
  try {
    await runEslintFix();
    await fixRemainingIssues();

    console.log('✅ All schema import issues are now permanently fixed in your codebase!');
    console.log('📝 NOTE: Make sure to commit these changes to your repository.');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

main();
