#!/usr/bin/env node

/**
 * Product Image Renaming Script
 *
 * This script renames product images to follow the standardized naming convention:
 * brand-flavor-strength.png (e.g., puxx-mint-22mg.png)
 *
 * It also handles resized images (e.g., -768x768, -300x300, etc.)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Directory containing product images
const PRODUCTS_DIR = path.join(path.resolve(__dirname, '..'), 'public', 'images', 'products');

// Mapping of old names to new names (without size suffixes)
const RENAME_MAP = {
  // Base files
  puxxcoolmint22mg: 'puxx-mint-22mg',
  puxxperpermint22mg: 'puxx-peppermint-22mg',
  puxxspearmint22mg: 'puxx-spearmint-22mg',
  puxxwatermelon16mg: 'puxx-watermelon-16mg',
  puxxcola16mg: 'puxx-cola-16mg',
  puxcherry16mg: 'puxx-cherry-16mg',
  'cool-mint-6mg': 'puxx-mint-6mg',

  // Apple Mint already follows convention but brand name should be added
  'apple-mint-12mg': 'puxx-apple-mint-12mg',
  'apple-mint-6mg': 'puxx-apple-mint-6mg',
};

// Get all files in the products directory
function getAllFiles(dir) {
  const files = [];

  // Read directory contents
  const items = fs.readdirSync(dir, { withFileTypes: true });

  items.forEach(item => {
    const itemPath = path.join(dir, item.name);

    if (item.isDirectory()) {
      // Recursively get files from subdirectories
      files.push(...getAllFiles(itemPath));
    } else if (item.isFile()) {
      files.push(itemPath);
    }
  });

  return files;
}

// Rename files according to mapping
function renameFiles() {
  const files = getAllFiles(PRODUCTS_DIR);
  const renamedFiles = [];

  files.forEach(filePath => {
    // Skip non-image files
    if (!filePath.endsWith('.png') && !filePath.endsWith('.jpg')) return;

    const dir = path.dirname(filePath);
    const fileName = path.basename(filePath);

    // Check for matches in our rename map
    for (const [oldName, newName] of Object.entries(RENAME_MAP)) {
      // Handle both base files and sized variations (e.g., -300x300)
      if (fileName.startsWith(oldName)) {
        // Extract the size suffix if present (e.g., -300x300.png)
        const sizeSuffix = fileName.slice(oldName.length, -4);
        const newFileName = `${newName}${sizeSuffix}.png`;
        const newFilePath = path.join(dir, newFileName);

        // Only rename if target doesn't exist
        if (!fs.existsSync(newFilePath)) {
          try {
            fs.renameSync(filePath, newFilePath);
            renamedFiles.push({
              from: fileName,
              to: newFileName,
            });
            console.log(`Renamed: ${fileName} → ${newFileName}`);
          } catch (err) {
            console.error(`Error renaming ${fileName}:`, err.message);
          }
        } else {
          console.log(`Skipped: ${fileName} (target ${newFileName} already exists)`);
        }

        break;
      }
    }
  });

  return renamedFiles;
}

// Execute the renaming process
console.log('Starting product image renaming process...');
const renamedFiles = renameFiles();
console.log(`Finished renaming ${renamedFiles.length} files.`);

// Output summary
if (renamedFiles.length > 0) {
  console.log('\nRename Summary:');
  renamedFiles.forEach(({ from, to }) => {
    console.log(`${from} → ${to}`);
  });
}
