#!/usr/bin/env node

/**
 * Fix Drizzle TypeScript type issues
 *
 * This script finds and replaces common TypeScript errors caused by Drizzle ORM integration,
 * focusing on the issues identified in the codebase.
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Tracking
const totalFixes = {
  errorMessageRecursion: 0,
  typeConversion: 0,
  stringNumberFixes: 0,
  missingTypes: 0,
  sqlUnknownIssues: 0,
  fixedFiles: new Set(),
};

// Path helpers
const rootDir = join(__dirname, '..');
const srcDir = join(rootDir, 'app');
const servicesDir = join(srcDir, 'lib', 'services');

// Log with timestamp
function log(message) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

// PATTERN FIXES

// Fix recursive errorMessage definition
function fixRecursiveErrorMessage(content) {
  const pattern =
    /const\s+errorMessage\s*=\s*error\s+instanceof\s+Error\s*\?\s*errorMessage\s*:\s*String\(error\)/g;
  const replacement = 'const errorMsg = error instanceof Error ? error.message : String(error)';

  // Also fix usages of errorMessage in the same function
  let fixedContent = content.replace(pattern, replacement);

  // Find all instances where we reference the previous variable
  fixedContent = fixedContent.replace(
    /error instanceof Error \? errorMessage : ('Unknown error'|"Unknown error"|String\(error\))/g,
    'errorMsg'
  );

  const count = (content.match(pattern) || []).length;
  totalFixes.errorMessageRecursion += count;

  return fixedContent;
}

// Fix type conversion issues with String()
function fixStringCasts(content) {
  // Fix patterns like: productId: String(item.productId),
  // when it should be: productId: item.productId,
  const stringCastPattern = /(\w+)\s*:\s*String\(([^)]+)\)/g;
  let fixedContent = content;
  let match;
  let count = 0;

  // Use a regex with exec to get all matches
  while ((match = stringCastPattern.exec(content)) !== null) {
    // Check if this is likely a type mismatch issue by looking at property name
    if (['productId', 'variationId', 'userId', 'orderId', 'locationId'].includes(match[1])) {
      fixedContent = fixedContent.replace(
        `${match[1]}: String(${match[2]})`,
        `${match[1]}: ${match[2]}`
      );
      count++;
    }
  }

  totalFixes.stringNumberFixes += count;
  return fixedContent;
}

// Fix complicated conditional logic for array checks
function fixArrayConditionals(content) {
  // Replace patterns like: Array.isArray(x) ? Array.isArray(x) ? x.length : 0 : 0 === 0
  // with simpler: Array.isArray(x) ? x.length === 0 : true
  const complexArrayPattern =
    /Array\.isArray\((\w+)\)\s*\?\s*Array\.isArray\(\1\)\s*\?\s*\1\.length\s*:\s*0\s*:\s*0\s*===\s*0/g;
  let fixedContent = content.replace(
    complexArrayPattern,
    (match, group) => `Array.isArray(${group}) ? ${group}.length === 0 : true`
  );

  // Also fix array null checks like: Array.isArray(x) ? Array.isArray(x) ? x[0] : null : null
  // with simpler: Array.isArray(x) ? x[0] : null
  const complexArrayAccessPattern =
    /Array\.isArray\((\w+)\)\s*\?\s*Array\.isArray\(\1\)\s*\?\s*\1\[(\d+)\]\s*:\s*null\s*:\s*null/g;
  fixedContent = fixedContent.replace(
    complexArrayAccessPattern,
    (match, group1, group2) => `Array.isArray(${group1}) ? ${group1}[${group2}] : null`
  );

  const count =
    (content.match(complexArrayPattern) || []).length +
    (content.match(complexArrayAccessPattern) || []).length;
  totalFixes.typeConversion += count;

  return fixedContent;
}

// Fix SQL<unknown> type issues
function fixSqlUnknownTypes(content) {
  // Ensure we're checking properties on objects that might be null/undefined with optional chaining
  const unsafePropertyAccess = /(\w+)\.(\w+)(?!\?)/g;
  let fixedContent = content;

  // Replace getRows(result) as SomeType with getRows(result) as unknown as SomeType
  const asTypePattern = /(getRows\([^)]+\))\s+as\s+(?!unknown)([^;]+)/g;
  fixedContent = fixedContent.replace(asTypePattern, '$1 as unknown as $2');

  // Add null checks for potentially null objects
  fixedContent = fixedContent.replace(unsafePropertyAccess, (match, obj, prop) => {
    // Skip certain common objects that we know won't be null
    if (['item', 'items', 'params', 'options', 'tx', 'db', 'sql'].includes(obj)) {
      return match;
    }
    return `${obj}?.${prop}`;
  });

  const count = (content.match(asTypePattern) || []).length;
  totalFixes.sqlUnknownIssues += count;

  return fixedContent;
}

// Fix common success condition logic
function fixSuccessCondition(content) {
  // Replace complex success logic
  const successPattern =
    /success:\s*Array\.isArray\(errors\)\s*\?\s*Array\.isArray\(errors\)\s*\?\s*errors\.length\s*:\s*0\s*:\s*0\s*===\s*0/g;
  return content.replace(successPattern, 'success: errors.length === 0');
}

// Fix ...args parameters
function fixRestParameters(content, filename) {
  // Try to deduce parameter types from function usage
  const restParamsPattern = /async\s+(\w+)\(\.\.\.(args)\):\s*Promise<([^>]+)>/g;
  let fixedContent = content;
  let match;
  let count = 0;

  // Common parameter patterns to replace
  const commonMethodParams = {
    // Inventory methods
    getProductInventory: 'productId: string',
    getVariationInventory: 'variationId: number',
    getLocationInventory: 'locationId: string, includeVariations = false',
    getStockLocations: 'activeOnly = false',
    // Order methods
    getOrderById: 'orderId: string',
    getUserOrders:
      'userId: string, options: { page?: number; limit?: number; status?: OrderStatus } = {}',
    // General list methods
    listTasks:
      'options: { page?: number; limit?: number; status?: string; category?: string; priority?: string; assignedTo?: string } = {}',
    listApplications: 'options: { page?: number; limit?: number; status?: string } = {}',
    getApplicationById: 'applicationId: string',
  };

  while ((match = restParamsPattern.exec(content)) !== null) {
    const methodName = match[1];
    const argsParam = match[2];
    const returnType = match[3];

    if (commonMethodParams[methodName]) {
      fixedContent = fixedContent.replace(
        `async ${methodName}(...${argsParam}): Promise<${returnType}>`,
        `async ${methodName}(${commonMethodParams[methodName]}): Promise<${returnType}>`
      );
      count++;
    }
  }

  totalFixes.missingTypes += count;
  return fixedContent;
}

// MAIN PROCESSING FUNCTIONS

// Process a single file
function processFile(filepath) {
  try {
    log(`Processing ${filepath}...`);
    const content = readFileSync(filepath, 'utf8');
    let fixedContent = content;

    // Apply fixes
    fixedContent = fixRecursiveErrorMessage(fixedContent);
    fixedContent = fixStringCasts(fixedContent);
    fixedContent = fixArrayConditionals(fixedContent);
    fixedContent = fixSqlUnknownTypes(fixedContent);
    fixedContent = fixSuccessCondition(fixedContent);
    fixedContent = fixRestParameters(fixedContent, filepath);

    // Skip if no changes
    if (content === fixedContent) {
      log(`No changes needed for ${filepath}`);
      return;
    }

    // Write the changes
    writeFileSync(filepath, fixedContent, 'utf8');
    totalFixes.fixedFiles.add(filepath);
    log(`Fixed issues in ${filepath}`);
  } catch (error) {
    console.error(`Error processing ${filepath}:`, error);
  }
}

// Main execution
async function main() {
  log('Starting TypeScript type issue fixes for Drizzle...');

  // Find TypeScript files in services directory
  const servicesFiles = await glob(`${servicesDir}/**/*.ts`);
  for (const file of servicesFiles) {
    processFile(file);
  }

  // Fix db.ts and related files
  const dbFiles = [
    join(srcDir, 'lib', 'db.ts'),
    join(srcDir, 'lib', 'query.ts'),
    join(srcDir, 'store', 'slices', 'authStore.ts'),
    join(srcDir, 'products', 'ProductsContent.tsx'),
    join(srcDir, 'middleware.ts'),
  ];

  for (const file of dbFiles) {
    processFile(file);
  }

  // Report results
  log('Type issue fixes completed.');
  log(`Fixed ${totalFixes.errorMessageRecursion} recursive error message issues`);
  log(`Fixed ${totalFixes.typeConversion} type conversion issues`);
  log(`Fixed ${totalFixes.stringNumberFixes} String() to number conversions`);
  log(`Fixed ${totalFixes.missingTypes} missing parameter type definitions`);
  log(`Fixed ${totalFixes.sqlUnknownIssues} SQL<unknown> type issues`);
  log(`Total files fixed: ${totalFixes.fixedFiles.size}`);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
