#!/usr/bin/env node

/**
 * fix-template-literals-all.mjs
 * 
 * This script fixes template literal syntax errors across the entire codebase
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Logger function
function log(message) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

// Fix template literals in a file
async function fixTemplateLiterals(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Fix template literals with backticks
    content = content.replace(/`([^`]*)\$\{([^}]*)\}([^`]*)`/g, '`$1${$2}$3`');
    
    // Fix SQL template literals
    content = content.replace(/sql<string>`([^`]*)\$\{([^}]*)\}([^`]*)`/g, 'sql<string>`$1${$2}$3`');
    content = content.replace(/sql<number>`([^`]*)\$\{([^}]*)\}([^`]*)`/g, 'sql<number>`$1${$2}$3`');
    
    // Fix logger template literals
    content = content.replace(/logger\.info\(`([^`]*)\$\{([^}]*)\}([^`]*)`/g, 'logger.info(`$1${$2}$3`');
    content = content.replace(/logger\.error\(`([^`]*)\$\{([^}]*)\}([^`]*)`/g, 'logger.error(`$1${$2}$3`');
    
    // Fix Error template literals
    content = content.replace(/new Error\(`([^`]*)\$\{([^}]*)\}([^`]*)`\)/g, 'new Error(`$1${$2}$3`)');
    
    // Fix String(true) to true
    content = content.replace(/String\(true\)/g, 'true');
    
    // Fix String(false) to false
    content = content.replace(/String\(false\)/g, 'false');
    
    // Write the fixed content back to the file if changed
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
      return true;
    }
    
    return false;
  } catch (err) {
    log(`❌ Error processing ${filePath}: ${err.message}`);
    return false;
  }
}

// Main function
async function main() {
  log('🛠️ Starting template literal fixer...');
  
  // Find all TypeScript files
  const files = await glob('app/**/*.{ts,tsx}', { cwd: rootDir });
  log(`Found ${files.length} TypeScript files to process.`);
  
  let fixedCount = 0;
  
  // Process each file
  for (const file of files) {
    const filePath = path.join(rootDir, file);
    const fixed = await fixTemplateLiterals(filePath);
    
    if (fixed) {
      log(`✅ Fixed template literals in ${file}`);
      fixedCount++;
    }
  }
  
  log(`
📊 Summary:
- Processed ${files.length} files
- Fixed template literals in ${fixedCount} files
  `);
  
  log('✅ Template literal fixing completed!');
}

main().catch(error => {
  log(`❌ Error: ${error.message}`);
  process.exit(1);
});
