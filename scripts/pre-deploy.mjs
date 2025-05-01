#!/usr/bin/env node
/**
 * pre-deploy.mjs
 *
 * This script prepares the codebase for deployment by:
 * 1. Running the schema import fixer to fix any schema-related issues
 * 2. Building the project with Next.js
 *
 * Usage: node scripts/pre-deploy.mjs
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');

// Helper to run a command and return a promise that resolves when the command is complete
function runCommand(cmd, args, cwd = ROOT_DIR) {
  console.log(`Running: ${cmd} ${args.join(' ')}`);

  return new Promise((resolve, reject) => {
    const childProcess = spawn(cmd, args, {
      cwd,
      stdio: 'inherit',
      shell: process.platform === 'win32',
    });

    childProcess.on('close', code => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });

    childProcess.on('error', error => {
      reject(error);
    });
  });
}

async function main() {
  try {
    console.log('🔧 Starting pre-deployment preparation...');

    // Step 1: Fix schema imports
    console.log('Step 1: Running schema import fixer...');
    await runCommand('node', ['scripts/fix-schema-imports.mjs']);

    // Step 2: Build the Next.js project
    console.log('Step 2: Building Next.js project...');
    await runCommand('npm', ['run', 'build']);

    console.log('✅ Pre-deployment preparation completed successfully!');
  } catch (error) {
    console.error('❌ Pre-deployment preparation failed:', error);
    process.exit(1);
  }
}

main();
