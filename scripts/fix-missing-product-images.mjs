#!/usr/bin/env node

/**
 * This script ensures all product images exist by creating any missing ones
 * from a template image. This prevents image loading errors in production.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory of the current module
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const publicDir = path.join(rootDir, 'public');
const productsImageDir = path.join(publicDir, 'images', 'products');

// Ensure the products image directory exists
if (!fs.existsSync(productsImageDir)) {
  console.log(`Creating directory: ${productsImageDir}`);
  fs.mkdirSync(productsImageDir, { recursive: true });
}

// Template image path for fallbacks
const templateImagePath = path.join(productsImageDir, 'puxxcoolmint22mg.png');

// The product images that should exist (from your product database)
// Update this list with your actual product images
const requiredProductImages = [
  'puxxcoolmint22mg.png',
  'puxxperpermint22mg.png',
  'puxxspearmint22mg.png',
  'puxxwatermelon16mg.png',
  'puxxcola16mg.png',
  'puxxcoolmint22mg-600x600.png',
  'puxxcoolmint22mg-300x300.png',
  'puxxperpermint22mg-600x600.png',
  'puxxperpermint22mg-300x300.png',
  'puxxspearmint22mg-600x600.png',
  'puxxspearmint22mg-300x300.png',
  'puxxwatermelon16mg-600x600.png',
  'puxxwatermelon16mg-300x300.png',
  'puxxcola16mg-600x600.png',
  'puxxcola16mg-300x300.png',
  'hero.png',
  'banner.png',
];

console.log('🖼️  Product Image Fixer');
console.log('========================');
console.log(`Checking for missing product images in: ${productsImageDir}`);

// First, check if the template image exists
if (!fs.existsSync(templateImagePath)) {
  console.error(`❌ Template image not found: ${templateImagePath}`);
  console.error(
    'Cannot create missing images without a template. Please add the template image first.'
  );
  process.exit(1);
}

// Check for missing images and copy template if needed
let missingImages = 0;
let existingImages = 0;

for (const imageName of requiredProductImages) {
  const imagePath = path.join(productsImageDir, imageName);

  if (!fs.existsSync(imagePath)) {
    console.log(`⚠️  Missing image: ${imageName} - creating from template`);

    try {
      // Copy the template image to create the missing image
      fs.copyFileSync(templateImagePath, imagePath);
      console.log(`  ✅ Created: ${imageName}`);
      missingImages++;
    } catch (err) {
      console.error(`  ❌ Failed to create ${imageName}: ${err.message}`);
    }
  } else {
    existingImages++;
  }
}

console.log('\n📊 Summary:');
console.log(`- ${existingImages} images already exist`);
console.log(`- ${missingImages} images were created from template`);
console.log(`- ${requiredProductImages.length} total product images verified`);

if (missingImages > 0) {
  console.log('\n⚠️  Warning: Some images were missing and replaced with the template image.');
  console.log('   These placeholder images should be replaced with actual product images.');
} else {
  console.log('\n✅ All product images are present!');
}

console.log('\nImage verification complete.');
