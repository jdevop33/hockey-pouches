#!/usr/bin/env node

/**
 * Fix TypeScript errors in the codebase
 *
 * This script fixes common TypeScript errors by:
 * 1. Adding proper imports for the new utility functions
 * 2. Fixing getRows usages with proper types
 * 3. Fixing recursive error message patterns
 * 4. Converting String(x) to proper number types
 * 5. Adding missing function parameter types
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname, relative } from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const appDir = join(rootDir, 'app');

// Create a log directory
const logDir = join(rootDir, 'logs');
if (!existsSync(logDir)) {
  mkdirSync(logDir);
}

// Setup logging
const logFile = join(
  logDir,
  `typescript-fixes-${new Date().toISOString().replace(/[:.]/g, '-')}.log`
);
let logContent = `TypeScript Fixes - ${new Date().toISOString()}\n\n`;

function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  console.log(logMessage);
  logContent += logMessage + '\n';
}

// Track fixes
const stats = {
  importsAdded: 0,
  getRowsFixes: 0,
  errorMessageFixes: 0,
  typeConversionFixes: 0,
  filesTouched: new Set(),
  fileErrors: [],
};

// Helper to add imports to files
function addRequiredImports(content, filePath) {
  // Check if we need to add DB helper imports
  const needsDbTypesImport =
    content.includes('getRows(') &&
    !content.includes('import { getRows') &&
    !content.includes('import { castDbRow');

  if (needsDbTypesImport) {
    // Determine relative path to db-types
    const relPath = relative(dirname(filePath), join(appDir, 'lib'));
    const importPath = relPath.startsWith('.') ? relPath : `./${relPath}`;

    // Add the import at the top, after existing imports
    let lines = content.split('\n');
    const lastImportIndex = lines.findIndex((line, i, arr) => {
      return (
        line.trim().startsWith('import') &&
        (i === arr.length - 1 || !arr[i + 1].trim().startsWith('import'))
      );
    });

    if (lastImportIndex >= 0) {
      lines.splice(
        lastImportIndex + 1,
        0,
        `import { getRows, castDbRow, castDbRows } from '${importPath}/db-types';`
      );
      stats.importsAdded++;
      return lines.join('\n');
    }
  }

  return content;
}

// Replace getRows usage with the new pattern
function fixGetRowsUsage(content) {
  let modified = content;

  // Replace direct type assertions after getRows
  const pattern = /getRows\(([^)]+)\)\s+as\s+(?!unknown)([^;{]+)/g;
  modified = modified.replace(pattern, (match, resultVar, type) => {
    stats.getRowsFixes++;
    return `castDbRows<${type.trim()}>(getRows(${resultVar}))`;
  });

  // Replace array access with safe casting for single rows
  const singleRowPattern = /getRows\(([^)]+)\)\[(\d+)\]\s+as\s+(?!unknown)([^;{]+)/g;
  modified = modified.replace(singleRowPattern, (match, resultVar, index, type) => {
    stats.getRowsFixes++;
    return `castDbRow<${type.trim()}>(getRows(${resultVar})[${index}])`;
  });

  return modified;
}

// Fix recursive error message pattern
function fixErrorMessages(content) {
  // Fix the recursive error message pattern
  const pattern =
    /const\s+errorMessage\s*=\s*error\s+instanceof\s+Error\s*\?\s*errorMessage\s*:\s*String\(error\)/g;
  const replacement = 'const errorMessage = error instanceof Error ? error.message : String(error)';

  const matches = content.match(pattern);
  if (matches) {
    stats.errorMessageFixes += matches.length;
  }

  return content.replace(pattern, replacement);
}

// Fix String(x) to proper number types in commonly problematic spots
function fixTypeConversions(content) {
  let modified = content;

  // Common patterns for String() usage that should be numbers
  const patterns = [
    {
      regex: /productId:\s*String\(([^)]+)\)/g,
      replacement: 'productId: $1',
    },
    {
      regex: /variationId:\s*String\(([^)]+)\)/g,
      replacement: 'variationId: $1',
    },
    {
      regex: /locationId:\s*String\(([^)]+)\)/g,
      replacement: 'locationId: $1',
    },
    {
      regex: /orderId:\s*String\(([^)]+)\)/g,
      replacement: 'orderId: $1',
    },
    {
      regex: /userId:\s*String\(([^)]+)\)/g,
      replacement: 'userId: $1',
    },
    {
      regex: /parseInt\(getRows\(([^)]+)\)(?:\[(\d+)\])?\.(\w+)\)/g,
      replacement: (match, resultVar, index, prop) => {
        if (index) {
          return `Number(getRows(${resultVar})[${index}]?.${prop} || 0)`;
        }
        return `extractTotal(${resultVar})`;
      },
    },
  ];

  patterns.forEach(({ regex, replacement }) => {
    const matches = modified.match(regex);
    if (matches) {
      stats.typeConversionFixes += matches.length;
      modified = modified.replace(regex, replacement);
    }
  });

  return modified;
}

// Process files to fix TypeScript issues
async function processFile(filePath) {
  try {
    log(`Processing ${filePath}...`);
    const content = readFileSync(filePath, 'utf8');

    // Apply fixes
    let modified = content;
    modified = addRequiredImports(modified, filePath);
    modified = fixGetRowsUsage(modified);
    modified = fixErrorMessages(modified);
    modified = fixTypeConversions(modified);

    // Only write back if changes were made
    if (modified !== content) {
      stats.filesTouched.add(filePath);
      writeFileSync(filePath, modified, 'utf8');
      log(`Fixed issues in ${filePath}`);
    } else {
      log(`No issues found in ${filePath}`);
    }
  } catch (error) {
    log(`Error processing ${filePath}: ${error.message}`);
    stats.fileErrors.push({ file: filePath, error: error.message });
  }
}

// Main function
async function main() {
  try {
    log('Starting TypeScript fixes...');

    // Target files in services and other key areas
    const files = await glob([
      `${appDir}/lib/services/**/*.ts`,
      `${appDir}/lib/db.ts`,
      `${appDir}/lib/query.ts`,
      `${appDir}/store/slices/**/*.ts`,
      `${appDir}/api/**/*.ts`,
    ]);

    // Process all files
    for (const file of files) {
      await processFile(file);
    }

    // Output stats
    log('\nFix Summary:');
    log(`- Added imports: ${stats.importsAdded}`);
    log(`- Fixed getRows usages: ${stats.getRowsFixes}`);
    log(`- Fixed recursive error messages: ${stats.errorMessageFixes}`);
    log(`- Fixed type conversions: ${stats.typeConversionFixes}`);
    log(`- Total files touched: ${stats.filesTouched.size}`);
    log(`- Files with errors: ${stats.fileErrors.length}`);

    // Save log to file
    writeFileSync(logFile, logContent, 'utf8');
    log(`Log saved to: ${logFile}`);
  } catch (error) {
    log(`Fatal error: ${error.message}`);
    process.exit(1);
  }
}

main();
