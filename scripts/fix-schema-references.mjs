#!/usr/bin/env node
/**
 * fix-schema-references.mjs
 *
 * This script ensures that files using schema.* references maintain
 * the schema namespace import rather than removing it.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');

// Files to analyze
const EXTENSIONS = ['.ts', '.tsx'];
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

// Check if a file uses schema.* references
const usesSchemaReferences = content => {
  // Look for schema.something references
  const schemaRefs = content.match(/schema\.\w+/g);
  return schemaRefs !== null && schemaRefs.length > 0;
};

// Fix schema reference issues
const fixSchemaReferences = content => {
  // If we have schema references but no namespace import, add it
  if (usesSchemaReferences(content)) {
    // Check if there's already a namespace import
    const hasNamespaceImport = /import\s+\*\s+as\s+schema\s+from\s+['"]@\/lib\/schema['"]/.test(
      content
    );

    if (!hasNamespaceImport) {
      // Add namespace import at the top of the file, after other imports
      return content.replace(
        /(import .+;(\s*\n|\n\s*))+/,
        "$&import * as schema from '@/lib/schema';\n"
      );
    }
  }

  return content;
};

const run = async () => {
  console.log('🔍 Scanning files for schema reference issues...');

  // Find all TypeScript files
  const allFiles = findFiles(path.join(ROOT_DIR, 'app'));
  console.log(`Found ${allFiles.length} TypeScript files to analyze`);

  let fixedCount = 0;
  let fixedListStr = '';

  // Process each file
  for (const filePath of allFiles) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');

      // Only process files that use schema references
      if (!usesSchemaReferences(content)) {
        continue;
      }

      const fixedContent = fixSchemaReferences(content);

      if (fixedContent !== content) {
        fs.writeFileSync(filePath, fixedContent);
        console.log(`✅ Fixed schema references in ${path.relative(ROOT_DIR, filePath)}`);
        fixedCount++;
        fixedListStr += `- ${path.relative(ROOT_DIR, filePath)}\n`;
      }
    } catch (error) {
      console.error(`❌ Error processing ${filePath}:`, error.message);
    }
  }

  if (fixedCount > 0) {
    console.log(`✅ Fixed ${fixedCount} files with schema reference issues:\n${fixedListStr}`);
  } else {
    console.log('✅ No schema reference issues found.');
  }
};

// Run the script
run().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
