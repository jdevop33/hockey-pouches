#!/usr/bin/env node

/**
 * fix-string-type-errors.mjs
 * 
 * This script fixes the String() type errors in the codebase
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

// Log function with timestamp
function log(message) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
}

// Fix String() type errors
async function fixStringTypeErrors() {
  log('🔍 Fixing String() type errors...');
  const tsFiles = await glob('app/**/*.{ts,tsx}', { cwd: rootDir });
  let fixedFiles = 0;

  for (const file of tsFiles) {
    const filePath = path.join(rootDir, file);
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      let modified = false;

      // Fix String(type) syntax errors
      if (content.includes('String(')) {
        // Replace String(string) with string
        content = content.replace(/(\w+):\s*String\(string\)/g, '$1: string');
        
        // Replace String(number) with string
        content = content.replace(/(\w+):\s*String\(number\)/g, '$1: string');
        
        // Fix function parameters with String()
        content = content.replace(/getRows\(([^)]+) as unknown as DbQueryResult\)/g, 'getRows($1)');
        content = content.replace(/getFirstRow\(([^)]+) as unknown as DbQueryResult\)/g, 'getFirstRow($1)');
        content = content.replace(/getRowCount\(([^)]+) as unknown as DbQueryResult\)/g, 'getRowCount($1)');
        
        modified = true;
      }

      if (modified) {
        fs.writeFileSync(filePath, content);
        log(`✅ Fixed String() type errors in ${file}`);
        fixedFiles++;
      }
    } catch (err) {
      log(`❌ Error processing ${file}: ${err.message}`);
    }
  }

  log(`Fixed String() type errors in ${fixedFiles} files`);
  return fixedFiles;
}

// Fix db-types.ts
async function fixDbTypes() {
  log('🔍 Fixing db-types.ts...');
  const dbTypesPath = path.join(rootDir, 'app/lib/db-types.ts');
  
  if (fs.existsSync(dbTypesPath)) {
    try {
      let content = fs.readFileSync(dbTypesPath, 'utf8');
      
      // Fix getRows function
      content = content.replace(
        /export function getRows\(result: DbQueryResult as unknown as DbQueryResult\): DbRow\[\] {/g,
        'export function getRows(result: DbQueryResult): DbRow[] {'
      );
      
      // Fix getFirstRow function
      content = content.replace(
        /export function getFirstRow\(result: DbQueryResult as unknown as DbQueryResult\): DbRow \| null {/g,
        'export function getFirstRow(result: DbQueryResult): DbRow | null {'
      );
      
      // Fix getRowCount function
      content = content.replace(
        /export function getRowCount\(result: DbQueryResult as unknown as DbQueryResult\): number {/g,
        'export function getRowCount(result: DbQueryResult): number {'
      );
      
      fs.writeFileSync(dbTypesPath, content);
      log(`✅ Fixed db-types.ts`);
      return 1;
    } catch (err) {
      log(`❌ Error processing db-types.ts: ${err.message}`);
      return 0;
    }
  }
  
  return 0;
}

// Main function
async function main() {
  log('🛠️ Starting String() type error fixer...');
  
  const fixedStringTypes = await fixStringTypeErrors();
  const fixedDbTypes = await fixDbTypes();
  
  log(`
📊 Summary:
- Fixed String() type errors in ${fixedStringTypes} files
- Fixed db-types.ts: ${fixedDbTypes === 1 ? 'Yes' : 'No'}
- Total files fixed: ${fixedStringTypes + fixedDbTypes}
  `);
  
  log('✅ String() type error fixing completed!');
}

main().catch(error => {
  console.error('Error running script:', error);
  process.exit(1);
});
