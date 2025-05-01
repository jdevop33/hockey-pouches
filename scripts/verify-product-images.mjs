#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory of the current module
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const publicDir = path.join(rootDir, 'public');

// List of product image paths from both home page and products page
const productImagePaths = [
  // Main product images
  '/images/products/puxxcoolmint22mg.png',
  '/images/products/puxxperpermint22mg.png',
  '/images/products/puxxspearmint22mg.png',
  '/images/products/puxxwatermelon16mg.png',
  '/images/products/puxxcola16mg.png',

  // Product variations from detail page
  '/images/products/puxxcoolmint22mg-600x600.png',
  '/images/products/puxxcoolmint22mg-300x300.png',
  '/images/products/puxxperpermint22mg-600x600.png',
  '/images/products/puxxperpermint22mg-300x300.png',
  '/images/products/puxxspearmint22mg-600x600.png',
  '/images/products/puxxspearmint22mg-300x300.png',
  '/images/products/puxxwatermelon16mg-600x600.png',
  '/images/products/puxxwatermelon16mg-300x300.png',
  '/images/products/puxxcola16mg-600x600.png',
  '/images/products/puxxcola16mg-300x300.png',

  // Hero and banner images
  '/images/products/hero.png',
  '/images/products/banner.png',
];

console.log('Verifying product images...');
console.log('===========================');

let missingImages = 0;
let existingImages = 0;
let missingImagesList = [];

// Function to create directories recursively
function ensureDirectoryExists(directoryPath) {
  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath, { recursive: true });
    console.log(`Created directory: ${directoryPath}`);
    return true;
  }
  return false;
}

// Function to copy fallback image if needed
function copyFallbackForMissingImage(missingPath) {
  const fallbackImage = path.join(publicDir, 'images/products/puxxcoolmint22mg.png');

  if (!fs.existsSync(fallbackImage)) {
    console.error('Error: Fallback image not found!');
    return false;
  }

  try {
    // Ensure directory exists
    const dir = path.dirname(path.join(publicDir, missingPath.replace(/^\//, '')));
    ensureDirectoryExists(dir);

    // Copy fallback image
    fs.copyFileSync(fallbackImage, path.join(publicDir, missingPath.replace(/^\//, '')));
    console.log(`✅ Created fallback for: ${missingPath}`);
    return true;
  } catch (err) {
    console.error(`Error creating fallback for ${missingPath}:`, err);
    return false;
  }
}

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
      missingImagesList.push(imagePath);
    }
  } catch (err) {
    console.error(`Error checking ${imagePath}:`, err);
    missingImages++;
    missingImagesList.push(imagePath);
  }
});

console.log('\nSummary:');
console.log(`- ${existingImages} images found`);
console.log(`- ${missingImages} images missing`);

// If there are missing images, attempt to fix them
if (missingImages > 0) {
  console.log('\nAttempting to fix missing images...');

  let fixedCount = 0;
  for (const missingImage of missingImagesList) {
    if (copyFallbackForMissingImage(missingImage)) {
      fixedCount++;
    }
  }

  console.log(`\nFixed ${fixedCount} of ${missingImages} missing images.`);

  if (fixedCount < missingImages) {
    console.log('\nRecommendations:');
    console.log('1. Make sure all images are in the correct public directory paths');
    console.log('2. Check for typos in image paths');
    console.log('3. Ensure all images are properly referenced in components');
    process.exit(1);
  } else {
    console.log('\nAll missing images have been replaced with fallbacks!');
  }
} else {
  console.log('\nAll product images verified successfully!');
}
