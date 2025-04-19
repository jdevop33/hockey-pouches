#!/usr/bin/env node

/**
 * Script to deploy the application to Vercel
 * Handles installation of Vercel CLI if needed
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('Checking if Vercel CLI is installed...');

try {
  // Check if Vercel CLI is installed
  execSync('vercel --version', { stdio: 'ignore' });
  console.log('Vercel CLI is already installed.');
} catch (error) {
  console.log('Installing Vercel CLI...');
  try {
    execSync('npm install -g vercel', { stdio: 'inherit' });
    console.log('Vercel CLI installed successfully.');
  } catch (installError) {
    console.error('Failed to install Vercel CLI:', installError.message);
    process.exit(1);
  }
}

console.log('Deploying to Vercel...');
try {
  execSync('vercel', {
    stdio: 'inherit',
    cwd: path.resolve(__dirname, '..')
  });
  console.log('Deployment completed successfully!');
} catch (deployError) {
  console.error('Deployment failed:', deployError.message);
  process.exit(1);
}
