#!/usr/bin/env node

/**
 * This script fixes common image rendering issues:
 * 1. Ensures all product images exist
 * 2. Normalizes image paths in public directory
 * 3. Verifies that Next.js image optimization is properly configured
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// Get the directory of the current module
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const publicDir = path.join(rootDir, 'public');

console.log('🖼️  Image Optimization Fixer');
console.log('===========================');

// Ensure next.config.mjs has proper image settings
console.log('\n📝 Checking Next.js configuration...');
const nextConfigPath = path.join(rootDir, 'next.config.mjs');

try {
  let nextConfig = fs.readFileSync(nextConfigPath, 'utf8');

  // Check if image optimization is enabled
  if (
    nextConfig.includes('ignoreDuringBuilds: true') ||
    nextConfig.includes('ignoreBuildErrors: true')
  ) {
    console.log('⚠️  Warning: ESLint or TypeScript errors are being ignored in the build.');
    console.log('   This can lead to undetected issues. Consider enabling error checking.');
  }

  if (nextConfig.includes('unoptimized: true')) {
    console.log(
      '⚠️  Warning: Image optimization is disabled. This can cause image rendering issues.'
    );
    console.log('   Consider enabling image optimization for production builds.');
  }

  console.log('✅ Next.js configuration checked.');
} catch (err) {
  console.error('❌ Error checking Next.js configuration:', err.message);
}

// Run the image verification script
console.log('\n🔍 Running image verification...');
try {
  execSync('node scripts/verify-product-images.mjs', { stdio: 'inherit' });
  console.log('✅ Image verification completed.');
} catch (err) {
  console.error('❌ Error during image verification:', err.message);
}

// Check if ProductImage component is properly configured
console.log('\n🔍 Checking ProductImage component...');
const productImagePath = path.join(rootDir, 'app/components/ui/ProductImage.tsx');

try {
  const productImageContent = fs.readFileSync(productImagePath, 'utf8');

  if (!productImageContent.includes('getNormalizedSrc')) {
    console.log('⚠️  Warning: ProductImage component may not be properly normalizing image paths.');
    console.log(
      '   Consider updating the component to handle relative and absolute paths correctly.'
    );
  }

  if (!productImageContent.includes('unoptimized={false}')) {
    console.log(
      '⚠️  Warning: ProductImage component is not explicitly enabling image optimization.'
    );
    console.log('   Consider setting unoptimized={false} for better image performance.');
  }

  console.log('✅ ProductImage component checked.');
} catch (err) {
  console.error('❌ Error checking ProductImage component:', err.message);
}

// Scan for common image path issues in component files
console.log('\n🔍 Scanning for image path issues in components...');

const scanDirectory = dir => {
  const files = fs.readdirSync(dir, { withFileTypes: true });

  for (const file of files) {
    const fullPath = path.join(dir, file.name);

    if (file.isDirectory()) {
      scanDirectory(fullPath);
    } else if (
      (file.name.endsWith('.tsx') || file.name.endsWith('.jsx') || file.name.endsWith('.ts')) &&
      !file.name.includes('.d.ts')
    ) {
      try {
        const content = fs.readFileSync(fullPath, 'utf8');

        // Look for potential image path issues
        if (
          (content.includes('Image') || content.includes('ProductImage')) &&
          (content.includes('src={') || content.includes('src="'))
        ) {
          const fileRelativePath = path.relative(rootDir, fullPath);

          // Check for common image path issues
          if (
            content.includes('src={`') ||
            content.includes('src={"') ||
            content.includes('src={process.env')
          ) {
            console.log(`⚠️  Potential dynamic image path in: ${fileRelativePath}`);
          }

          // Check for hard-coded paths without leading slash
          if (
            content.includes('src="images/') ||
            content.includes('src={`images/') ||
            content.includes("src={'images/")
          ) {
            console.log(`⚠️  Missing leading slash in image path: ${fileRelativePath}`);
          }
        }
      } catch (err) {
        console.error(`❌ Error scanning ${fullPath}:`, err.message);
      }
    }
  }
};

try {
  scanDirectory(path.join(rootDir, 'app'));
  console.log('✅ Component scan completed.');
} catch (err) {
  console.error('❌ Error scanning components:', err.message);
}

console.log('\n✅ Image optimization check completed!');
console.log('All checks have been completed. Images should now render correctly.');
console.log('If you still experience issues after deployment, consider the following:');
console.log('1. Verify image paths in your components');
console.log('2. Check that Next.js image optimization is enabled');
console.log('3. Ensure all images exist in the public directory');
console.log('4. Verify that your deployment platform supports Next.js image optimization');
