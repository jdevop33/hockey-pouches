#!/usr/bin/env node
/**
 * fix-schema-imports.mjs
 *
 * This script helps fix common schema import issues:
 * 1. Removes unused schema imports
 * 2. Converts namespace imports to specific imports where possible
 * 3. Identifies correct table imports based on usage
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');

// All tables in the schema for identifying correct imports
const SCHEMA_TABLES = [
  'users',
  'products',
  'orders',
  'orderItems',
  'inventory',
  'commissions',
  'tasks',
  'discountCodes',
  'cart',
  'addresses',
  'referrals',
  'wholesaleApplications',
  'logs',
];

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

// Check if a file has an unused schema import
const hasUnusedSchemaImport = content => {
  // Check for import statement
  const importMatch = content.match(/import\s+\*\s+as\s+schema\s+from\s+['"]@\/lib\/schema['"]/);
  if (!importMatch) return false;

  // Check if 'schema' is used in the file
  const schemaUsageCount = (content.match(/schema\./g) || []).length;
  return schemaUsageCount === 0;
};

// Identify schema tables used in a file
const identifyTablesUsed = content => {
  const usedTables = [];

  // Check for namespace usage
  const schemaMatches = content.match(/schema\.(\w+)/g) || [];
  for (const match of schemaMatches) {
    const table = match.replace('schema.', '');
    if (SCHEMA_TABLES.includes(table) && !usedTables.includes(table)) {
      usedTables.push(table);
    }
  }

  // Check for direct table usage
  for (const table of SCHEMA_TABLES) {
    const directUsage = new RegExp(`\\b${table}\\b`, 'g');
    if (directUsage.test(content) && !usedTables.includes(table)) {
      usedTables.push(table);
    }
  }

  return usedTables;
};

// Convert namespace import to specific imports
const convertToSpecificImports = (content, usedTables) => {
  if (usedTables.length === 0) {
    // Remove unused import
    return content.replace(/import\s+\*\s+as\s+schema\s+from\s+['"]@\/lib\/schema['"];\s*\n?/g, '');
  }

  // Replace namespace import with specific imports
  const namespaceImport = content.match(
    /import\s+\*\s+as\s+schema\s+from\s+['"]@\/lib\/schema['"];\s*\n?/
  );
  if (!namespaceImport) return content;

  const specificImports = usedTables
    .map(table => `import { ${table} } from '@/lib/schema/${table}';`)
    .join('\n');

  // Keep the schema namespace import but add specific imports
  return content.replace(
    namespaceImport[0],
    `${specificImports}\nimport * as schema from '@/lib/schema'; // Keep for other schema references\n`
  );
};

// Main function
const run = async () => {
  console.log('🔍 Scanning files for schema import issues...');

  // Find all TypeScript files
  const allFiles = findFiles(path.join(ROOT_DIR, 'app'));
  console.log(`Found ${allFiles.length} TypeScript files to analyze`);

  let fixedCount = 0;
  let fixedListStr = '';

  // Process each file
  for (const filePath of allFiles) {
    const content = fs.readFileSync(filePath, 'utf8');
    let needsFix = false;
    let fixedContent = content;

    // Check for unused schema imports
    if (hasUnusedSchemaImport(content)) {
      console.log(`🛠️ Fixing unused schema import in ${path.relative(ROOT_DIR, filePath)}`);
      fixedContent = content.replace(
        /import\s+\*\s+as\s+schema\s+from\s+['"]@\/lib\/schema['"];\s*\n?/g,
        ''
      );
      needsFix = true;
    }
    // Check for namespace imports that should be specific
    else if (content.includes("import * as schema from '@/lib/schema'")) {
      const tablesUsed = identifyTablesUsed(content);
      if (tablesUsed.length > 0) {
        console.log(
          `🔄 Converting namespace import to specific imports in ${path.relative(ROOT_DIR, filePath)}`
        );
        console.log(`   Tables used: ${tablesUsed.join(', ')}`);
        fixedContent = convertToSpecificImports(content, tablesUsed);
        needsFix = true;
      }
    }

    // Write fixes back to file
    if (needsFix && fixedContent !== content) {
      fs.writeFileSync(filePath, fixedContent);
      fixedCount++;
      fixedListStr += `- ${path.relative(ROOT_DIR, filePath)}\n`;
    }
  }

  if (fixedCount > 0) {
    console.log(`✅ Fixed ${fixedCount} files with schema import issues:\n${fixedListStr}`);
  } else {
    console.log('✅ No schema import issues found.');
  }
};

// Run the script
run().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
