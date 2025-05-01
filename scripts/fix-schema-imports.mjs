#!/usr/bin/env node
/**
 * fix-schema-imports.mjs
 *
 * This script helps fix common schema import issues:
 * 1. Removes unused schema imports
 * 2. Converts namespace imports to specific imports where possible
 * 3. Identifies correct table imports based on usage
 * 4. Fixes duplicate imports
 * 5. Ensures schema.* references maintain schema namespace import
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

// Enum types used with schema reference
const SCHEMA_ENUMS = [
  'userRoleEnum',
  'orderStatusEnum',
  'paymentStatusEnum',
  'paymentMethodEnum',
  'orderTypeEnum',
  'taskCategoryEnum',
  'taskStatusEnum',
  'taskPriorityEnum',
  'taskRelatedEntityEnum',
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

// Check if a file uses schema.* references
const usesSchemaReferences = content => {
  // Look for schema.something references
  const schemaRefs = content.match(/schema\.\w+/g);
  return schemaRefs !== null && schemaRefs.length > 0;
};

// Identify schema tables used in a file
const identifyTablesUsed = content => {
  const usedTables = [];

  // Check for namespace usage with tables
  for (const table of SCHEMA_TABLES) {
    const tableUsage = new RegExp(`schema\\.${table}\\b`, 'g');
    if (tableUsage.test(content) && !usedTables.includes(table)) {
      usedTables.push(table);
    }
  }

  // Check for namespace usage with enums
  for (const enumType of SCHEMA_ENUMS) {
    const enumUsage = new RegExp(`schema\\.${enumType}\\b`, 'g');
    if (enumUsage.test(content)) {
      // If using enums, we need to keep the global schema import
      return [];
    }
  }

  // Check for other schema references
  const otherRefs = content.match(/schema\.(\w+)/g) || [];
  for (const match of otherRefs) {
    const ref = match.replace('schema.', '');
    if (!SCHEMA_TABLES.includes(ref) && !SCHEMA_ENUMS.includes(ref) && otherRefs.length > 0) {
      // If there are other schema references we don't recognize, keep the namespace import
      return [];
    }
  }

  return usedTables;
};

// Convert namespace import to specific imports
const convertToSpecificImports = (content, usedTables) => {
  if (usedTables.length === 0) {
    // Either there are no tables used or we need to keep the namespace import
    if (usesSchemaReferences(content)) {
      // Keep the namespace import if there are schema references
      return content;
    }
    // Remove unused import
    return content.replace(/import\s+\*\s+as\s+schema\s+from\s+['"]@\/lib\/schema['"];\s*\n?/g, '');
  }

  // Replace namespace import with specific imports
  const namespaceImport = content.match(
    /import\s+\*\s+as\s+schema\s+from\s+['"]@\/lib\/schema['"];\s*\n?/
  );
  if (!namespaceImport) return content;

  const specificImports = [...new Set(usedTables)]
    .map(table => `import { ${table} } from '@/lib/schema/${table}';`)
    .join('\n');

  // Keep the schema namespace import for other schema references
  return content.replace(
    namespaceImport[0],
    `${specificImports}\nimport * as schema from '@/lib/schema'; // Keep for other schema references\n`
  );
};

// Fix duplicate imports
const fixDuplicateImports = content => {
  // Create a map to track imports by their module path
  const importsByModule = new Map();
  const importLines = content.match(/import\s+.*?from\s+['"].*?['"]/g) || [];

  for (const line of importLines) {
    const modulePath = line.match(/from\s+['"](.*?)['"]/)[1];

    if (!importsByModule.has(modulePath)) {
      importsByModule.set(modulePath, []);
    }

    importsByModule.get(modulePath).push(line);
  }

  let fixedContent = content;

  // Fix duplicate imports
  for (const [_, imports] of importsByModule.entries()) {
    if (imports.length > 1) {
      // If we have multiple imports from the same module, remove all but the first one
      for (let i = 1; i < imports.length; i++) {
        fixedContent = fixedContent.replace(imports[i] + ';', '');
        // Also remove any empty lines left behind
        fixedContent = fixedContent.replace(/\n\s*\n/g, '\n');
      }
    }
  }

  return fixedContent;
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
    let fileLogged = false;

    // Step 1: Check for unused schema imports and convert namespace imports
    if (hasUnusedSchemaImport(content)) {
      console.log(`🛠️ Fixing unused schema import in ${path.relative(ROOT_DIR, filePath)}`);
      fixedContent = content.replace(
        /import\s+\*\s+as\s+schema\s+from\s+['"]@\/lib\/schema['"];\s*\n?/g,
        ''
      );
      needsFix = true;
      fileLogged = true;
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
        fileLogged = true;
      }
    }

    // Step 2: Fix duplicate imports
    let beforeDupesFix = fixedContent;
    fixedContent = fixDuplicateImports(fixedContent);
    if (fixedContent !== beforeDupesFix) {
      if (!fileLogged) {
        console.log(`🔧 Fixing duplicate imports in ${path.relative(ROOT_DIR, filePath)}`);
        fileLogged = true;
      }
      needsFix = true;
    }

    // Step 3: Ensure schema namespace import exists if schema.* is used
    let beforeRefsFix = fixedContent;
    fixedContent = fixSchemaReferences(fixedContent);
    if (fixedContent !== beforeRefsFix) {
      if (!fileLogged) {
        console.log(`🔗 Ensuring schema references in ${path.relative(ROOT_DIR, filePath)}`);
        fileLogged = true;
      }
      needsFix = true;
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
