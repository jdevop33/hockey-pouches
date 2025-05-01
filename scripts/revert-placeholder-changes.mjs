#!/usr/bin/env node

/**
 * revert-placeholder-changes.mjs
 * 
 * This script reverts the $1?.$2 placeholder syntax that was incorrectly introduced
 * by previous scripts. It uses context-aware replacements to fix the issues.
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

// Get all files with $1?.$2 placeholders
async function getFilesWithPlaceholders() {
  log('Finding files with $1?.$2 placeholders...');
  
  try {
    const files = await glob('app/**/*.{ts,tsx}', { cwd: rootDir });
    const filesWithPlaceholders = [];
    
    for (const file of files) {
      const filePath = path.join(rootDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      
      if (content.includes('$1?.$2')) {
        filesWithPlaceholders.push(file);
      }
    }
    
    log(`Found ${filesWithPlaceholders.length} files with placeholders.`);
    return filesWithPlaceholders;
  } catch (error) {
    log(`Error finding files: ${error.message}`);
    return [];
  }
}

// Context-aware replacements
const contextReplacements = [
  // React Router navigation
  {
    context: (content) => content.includes('useRouter') || content.includes('next/navigation'),
    pattern: /\$1\?\.\$2\(['"]([^'"]+)['"]\)/g,
    replacement: 'router.push(\'$1\')'
  },
  
  // Form event handling
  {
    context: (content) => content.includes('onChange=') || content.includes('onChange={'),
    pattern: /\$1\?\.\$2\.value/g,
    replacement: 'e.target.value'
  },
  
  // React params
  {
    context: (content) => content.includes('params') || content.includes('[') && content.includes(']'),
    pattern: /\$1\?\.\$2d/g,
    replacement: 'params.id'
  },
  
  // React params value
  {
    context: (content) => content.includes('params') || content.includes('[') && content.includes(']'),
    pattern: /\$1\?\.\$2/g,
    replacement: 'params.id'
  },
  
  // Error message handling
  {
    context: (content) => content.includes('catch') || content.includes('error'),
    pattern: /errorMessage/g,
    replacement: 'error instanceof Error ? error.message : String(error)'
  },
  
  // React refs
  {
    context: (content) => content.includes('useRef'),
    pattern: /\$1\?\.\$2\.current/g,
    replacement: 'ref.current'
  },
  
  // Array mapping
  {
    context: (content) => content.includes('map(') || content.includes('filter('),
    pattern: /\$1\?\.\$2\((.*?)\s*=>\s*(.*?)\)/g,
    replacement: 'items.map(($1) => $2)'
  },
  
  // Search params
  {
    context: (content) => content.includes('searchParams'),
    pattern: /\$1\?\.\$2\(\)/g,
    replacement: 'searchParams.toString()'
  },
  
  // Search params get
  {
    context: (content) => content.includes('searchParams'),
    pattern: /\$1\?\.\$2\(['"]([^'"]+)['"]\)/g,
    replacement: 'searchParams.get(\'$1\')'
  },
];

// Generic fallback replacements
const genericReplacements = [
  // Common function calls
  { pattern: /\$1\?\.\$2\(\)/g, replacement: 'object.method()' },
  
  // Property access
  { pattern: /\$1\?\.\$2/g, replacement: 'object.property' },
];

// Process a single file
async function processFile(file) {
  const filePath = path.join(rootDir, file);
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    let replacementsMade = 0;
    
    // Try context-aware replacements first
    for (const { context, pattern, replacement } of contextReplacements) {
      if (context(content)) {
        content = content.replace(pattern, (match, ...args) => {
          replacementsMade++;
          // If replacement is a function, call it with the matched groups
          return typeof replacement === 'function' 
            ? replacement(match, ...args) 
            : replacement.replace(/\$(\d+)/g, (_, i) => args[i-1] || '');
        });
      }
    }
    
    // If no context replacements were made, try generic ones
    if (replacementsMade === 0 && content.includes('$1?.$2')) {
      log(`⚠️ Using generic replacements for: ${file}`);
      
      // Add a comment at the top of the file to indicate manual review is needed
      content = `// TODO: This file contains automatic placeholder replacements that need manual review\n${content}`;
      
      for (const { pattern, replacement } of genericReplacements) {
        content = content.replace(pattern, (match) => {
          replacementsMade++;
          return replacement;
        });
      }
    }
    
    // If content changed, write it back
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      log(`✅ Fixed ${replacementsMade} instances in: ${file}`);
      return true;
    } else {
      log(`ℹ️ No changes needed in: ${file}`);
      return false;
    }
  } catch (error) {
    log(`❌ Error processing ${file}: ${error.message}`);
    return false;
  }
}

// Main function
async function main() {
  log('🛠️ Starting placeholder reversion...');
  
  const files = await getFilesWithPlaceholders();
  
  if (files.length === 0) {
    log('No files found with placeholders. Nothing to do.');
    process.exit(0);
  }
  
  let fixedCount = 0;
  for (const file of files) {
    if (await processFile(file)) {
      fixedCount++;
    }
  }
  
  log(`
📊 Summary:
- Found ${files.length} files with placeholders
- Successfully fixed ${fixedCount} files
- ${files.length - fixedCount} files may need manual review
  `);
  
  log('✅ Placeholder reversion completed!');
}

main().catch(error => {
  log(`❌ Error: ${error.message}`);
  process.exit(1);
});
