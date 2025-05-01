#!/usr/bin/env node
/**
 * fix-cache-tags.mjs
 *
 * This script fixes invalid tags passed to unstable_cache by finding instances
 * where undefined or non-string values are used as tags.
 *
 * Usage: node scripts/fix-cache-tags.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');

// Files to analyze
const EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];
const IGNORE_DIRS = ['node_modules', '.next', '.vercel', 'dist'];

// Helper to recursively find files
const findFiles = dir => {
  let results = [];

  if (IGNORE_DIRS.some(ignore => dir.includes(ignore))) {
    return results;
  }

  try {
    const list = fs.readdirSync(dir);
    for (const file of list) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        // Recursively search directories
        results = results.concat(findFiles(filePath));
      } else if (stat.isFile() && EXTENSIONS.includes(path.extname(file))) {
        results.push(filePath);
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dir}:`, error.message);
  }

  return results;
};

// Check if a file contains unstable_cache calls
const hasUnstableCacheCalls = content => {
  return content.includes('unstable_cache');
};

// Fix unstable_cache calls with potentially invalid tags
const fixUnstableCacheTags = content => {
  let updatedContent = content;
  let madeChanges = false;

  // Pattern to match unstable_cache calls with optional tags array
  const pattern =
    /unstable_cache\s*\(\s*async\s*\([^)]*\)\s*=>\s*{[\s\S]*?}\s*,\s*(\[[^\]]*\])\s*(?:,\s*{[\s\S]*?})?\s*\)/g;
  let match;

  while ((match = pattern.exec(content)) !== null) {
    const tagArrayStr = match[1];

    // Check for undefined or invalid tags in the array
    if (tagArrayStr.includes('undefined') || tagArrayStr.includes('null')) {
      console.log(`Found invalid tag in: ${tagArrayStr}`);

      // Replace the tag array with a cleaned version
      const cleanedTagArray = tagArrayStr
        .replace(/\[\s*\]/g, '["default-tag"]') // Empty arrays
        .replace(/undefined/g, '"default-tag"') // Undefined values
        .replace(/null/g, '"default-tag"') // Null values
        .replace(/,\s*,/g, ', "default-tag",') // Sequential commas
        .replace(/\[\s*,/g, '["default-tag",') // Array starting with comma
        .replace(/,\s*\]/g, ', "default-tag"]'); // Array ending with comma

      updatedContent = updatedContent.replace(tagArrayStr, cleanedTagArray);
      madeChanges = true;
    }
  }

  // Also look for unstable_cache calls in object property syntax
  const objectPattern = /tags\s*:\s*(\[[^\]]*\])/g;
  while ((match = objectPattern.exec(content)) !== null) {
    const tagArrayStr = match[1];

    // Check for undefined or invalid tags in the array
    if (tagArrayStr.includes('undefined') || tagArrayStr.includes('null')) {
      console.log(`Found invalid tag in object property: ${tagArrayStr}`);

      // Replace the tag array with a cleaned version
      const cleanedTagArray = tagArrayStr
        .replace(/\[\s*\]/g, '["default-tag"]') // Empty arrays
        .replace(/undefined/g, '"default-tag"') // Undefined values
        .replace(/null/g, '"default-tag"') // Null values
        .replace(/,\s*,/g, ', "default-tag",') // Sequential commas
        .replace(/\[\s*,/g, '["default-tag",') // Array starting with comma
        .replace(/,\s*\]/g, ', "default-tag"]'); // Array ending with comma

      updatedContent = updatedContent.replace(tagArrayStr, cleanedTagArray);
      madeChanges = true;
    }
  }

  // Fix string interpolation in tag arrays which might cause undefined
  const stringInterpolationPattern = /\[\s*`[^`]*\${([^}]*)}`\s*\]/g;
  while ((match = stringInterpolationPattern.exec(content)) !== null) {
    const interpolatedVar = match[1];

    // Replace with a conditional expression to ensure string
    const fixedInterpolation = `[${interpolatedVar} ? \`tag-\${${interpolatedVar}}\` : "default-tag"]`;
    updatedContent = updatedContent.replace(match[0], fixedInterpolation);
    madeChanges = true;
  }

  return { updatedContent, madeChanges };
};

// Main function
const run = async () => {
  console.log('🔍 Scanning files for unstable_cache tag issues...');

  // Find all relevant files
  const allFiles = findFiles(path.join(ROOT_DIR, 'app'));
  console.log(`Found ${allFiles.length} files to analyze`);

  let updatedCount = 0;
  let updatedFiles = [];

  // Process each file
  for (const filePath of allFiles) {
    const content = fs.readFileSync(filePath, 'utf8');

    if (hasUnstableCacheCalls(content)) {
      const { updatedContent, madeChanges } = fixUnstableCacheTags(content);

      if (madeChanges) {
        console.log(`🔄 Fixing unstable_cache tags in ${path.relative(ROOT_DIR, filePath)}`);
        fs.writeFileSync(filePath, updatedContent);
        updatedCount++;
        updatedFiles.push(path.relative(ROOT_DIR, filePath));
      }
    }
  }

  if (updatedCount > 0) {
    console.log(`✅ Fixed unstable_cache tags in ${updatedCount} files:`);
    updatedFiles.forEach(file => console.log(`- ${file}`));
  } else {
    console.log('✅ No unstable_cache tag issues found.');
  }
};

// Run the script
run().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
