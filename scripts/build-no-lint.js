#!/usr/bin/env node

/**
 * Script to build the Next.js application without linting
 * Useful for quick builds during development
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('Building Next.js application without linting...');

try {
  execSync('npx next build --no-lint', {
    stdio: 'inherit',
    cwd: path.resolve(__dirname, '..')
  });
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}
