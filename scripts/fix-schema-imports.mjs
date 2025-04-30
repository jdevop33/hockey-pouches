#!/usr/bin/env node
/**
 * fix-schema-imports.mjs
 *
 * This script helps fix common schema import issues:
 * 1. Removes unused schema imports
 * 2. Converts namespace imports to specific imports where possible
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');

// Files to analyze (API routes and other key files)
const API_ROUTES_GLOB = 'app/api/**/*.ts';
const EXTENSIONS = ['.ts', '.tsx'];

// Helper to recursively find files
const findFiles = (dir, pattern) => {
  let results = [];
  const list = fs.readdirSync(dir);

  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Recursively search directories
      results = results.concat(findFiles(filePath, pattern));
    } else if (stat.isFile() && EXTENSIONS.includes(path.extname(file))) {
      // Check if file matches pattern
      if (pattern) {
        const relativePath = path.relative(ROOT_DIR, filePath);
        if (new RegExp(pattern.replace(/\*/g, '.*')).test(relativePath)) {
          results.push(filePath);
        }
      } else {
        results.push(filePath);
      }
    }
  }

  return results;
};

// Check if a file has an unused schema import
const hasUnusedSchemaImport = content => {
  // Check for import statement
  const importMatch = content.match(/import\s+\*\s+as\s+schema\s+from\s+['"]@\/lib\/schema['"]/);
  if (!importMatch) return false;

  // Check if 'schema' is used in the file
  const schemaUsageCount = (content.match(/schema\./g) || []).length;
  return schemaUsageCount === 0;
};

// Main function
const run = async () => {
  console.log('🔍 Scanning files for schema import issues...');

  // Find API routes and other files
  const apiRoutes = findFiles(path.join(ROOT_DIR, 'app'), API_ROUTES_GLOB);
  console.log(`Found ${apiRoutes.length} API route files to analyze`);

  let fixedCount = 0;

  // Process each file
  for (const filePath of apiRoutes) {
    const content = fs.readFileSync(filePath, 'utf8');

    // Check for unused schema imports
    if (hasUnusedSchemaImport(content)) {
      console.log(`🛠️ Fixing unused schema import in ${path.relative(ROOT_DIR, filePath)}`);

      // Remove the unused import
      const fixedContent = content.replace(
        /import\s+\*\s+as\s+schema\s+from\s+['"]@\/lib\/schema['"];\s*\n?/g,
        ''
      );

      // Write the fixed content back
      fs.writeFileSync(filePath, fixedContent);
      fixedCount++;
    }
  }

  console.log(`✅ Fixed ${fixedCount} files with schema import issues`);
};

// Run the script
run().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
