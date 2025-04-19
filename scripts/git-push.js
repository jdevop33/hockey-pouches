#!/usr/bin/env node

/**
 * Script to push code to GitHub
 * Handles setting up the remote if needed
 */

const { execSync } = require('child_process');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Get the current branch
let currentBranch;
try {
  currentBranch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
} catch (error) {
  console.error('Failed to get current branch:', error.message);
  process.exit(1);
}

console.log(`Current branch: ${currentBranch}`);

// Check if origin remote exists
let remoteExists = false;
try {
  execSync('git remote get-url origin', { stdio: 'ignore' });
  remoteExists = true;
} catch (error) {
  console.log('Origin remote does not exist. Setting it up...');
}

if (!remoteExists) {
  try {
    execSync('git remote add origin https://github.com/jdevop33/hockey-pouches.git', {
      stdio: 'inherit',
      cwd: path.resolve(__dirname, '..')
    });
    console.log('Origin remote added successfully.');
  } catch (error) {
    console.error('Failed to add origin remote:', error.message);
    process.exit(1);
  }
}

// Push to GitHub
console.log(`Pushing to GitHub (branch: ${currentBranch})...`);
try {
  execSync(`git push -u origin ${currentBranch}`, {
    stdio: 'inherit',
    cwd: path.resolve(__dirname, '..')
  });
  console.log('Push completed successfully!');
} catch (error) {
  console.error('Push failed:', error.message);
  process.exit(1);
}
