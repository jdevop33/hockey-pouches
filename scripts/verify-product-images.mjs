#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory of the current module
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const publicDir = path.join(rootDir, 'public');

// List of product image paths from the home page
const productImagePaths = [
  '/images/products/puxxcoolmint22mg.png',
  '/images/products/puxxperpermint22mg.png',
  '/images/products/puxxspearmint22mg.png',
  '/images/products/puxxwatermelon16mg.png',
  '/images/products/puxxcola16mg.png',
  // Add any other product images that should be checked
];

console.log('Verifying product images...');
console.log('===========================');

let missingImages = 0;
let existingImages = 0;

// Check each image path
productImagePaths.forEach(imagePath => {
  const fullPath = path.join(publicDir, imagePath.replace(/^\//, ''));

  try {
    if (fs.existsSync(fullPath)) {
      console.log(`✅ Found: ${imagePath}`);
      existingImages++;
    } else {
      console.log(`❌ Missing: ${imagePath}`);
      missingImages++;
    }
  } catch (err) {
    console.error(`Error checking ${imagePath}:`, err);
    missingImages++;
  }
});

console.log('\nSummary:');
console.log(`- ${existingImages} images found`);
console.log(`- ${missingImages} images missing`);

if (missingImages > 0) {
  console.log('\nRecommendations:');
  console.log('1. Make sure all images are in the correct public directory paths');
  console.log('2. Check for typos in image paths');
  console.log('3. Ensure all images are properly referenced in components');
  process.exit(1);
} else {
  console.log('\nAll product images verified successfully!');
}
