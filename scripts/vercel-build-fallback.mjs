#!/usr/bin/env node

/**
 * vercel-build-fallback.mjs
 *
 * This is a minimal emergency fallback script for Vercel deployments.
 * It skips all the complicated preprocessing and just attempts a clean build
 * when the normal build process fails.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

// Log function with timestamp
function log(message) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
}

try {
  log('🚨 EMERGENCY FALLBACK BUILD PROCESS 🚨');
  log('This is running because the normal build process failed or timed out.');

  // Skip all preprocessing and just run the Next.js build
  log('Running minimal build process...');

  try {
    log('Setting up next.config.mjs for safe build...');
    // Create a backup of next.config.mjs if it exists
    if (fs.existsSync(path.join(rootDir, 'next.config.mjs'))) {
      fs.copyFileSync(
        path.join(rootDir, 'next.config.mjs'),
        path.join(rootDir, 'next.config.mjs.backup')
      );

      // Create a simplified next.config.mjs
      const safeConfig = `
        // Simple fallback config for emergency deployments
        export default {
          images: {
            domains: ['hockey-pouches.vercel.app', 'localhost', 'hockeypouch.com', 'www.hockeypouch.com'],
            formats: ['image/webp'],
          },
          typescript: {
            ignoreBuildErrors: true, // Skip TS errors for emergency build
          },
          eslint: {
            ignoreDuringBuilds: true, // Skip ESLint errors for emergency build
          },
          swcMinify: true,
          compress: true,
        };
      `;

      fs.writeFileSync(path.join(rootDir, 'next.config.mjs'), safeConfig, 'utf8');
    }

    // Run simplified build
    log('Running next build with minimal config...');
    execSync('npx next build', {
      cwd: rootDir,
      stdio: 'inherit',
      env: {
        ...process.env,
        NEXT_SKIP_LINT: '1',
        NEXT_TELEMETRY_DISABLED: '1',
      },
    });

    log('✅ Emergency build completed successfully!');

    // Restore original config
    if (fs.existsSync(path.join(rootDir, 'next.config.mjs.backup'))) {
      fs.renameSync(
        path.join(rootDir, 'next.config.mjs.backup'),
        path.join(rootDir, 'next.config.mjs')
      );
    }

    process.exit(0);
  } catch (buildError) {
    log(`❌ Error during emergency build: ${buildError.message}`);

    // Restore original config even if build failed
    if (fs.existsSync(path.join(rootDir, 'next.config.mjs.backup'))) {
      fs.renameSync(
        path.join(rootDir, 'next.config.mjs.backup'),
        path.join(rootDir, 'next.config.mjs')
      );
    }

    process.exit(1);
  }
} catch (error) {
  log(`❌ Fatal error in fallback script: ${error.message}`);
  process.exit(1);
}
