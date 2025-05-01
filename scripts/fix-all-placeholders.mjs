#!/usr/bin/env node

/**
 * This script attempts to fix all instances of $1?.$2 placeholders
 * across the entire codebase by using common patterns and context detection.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

// Get all TypeScript and TSX files
const getAllTsFiles = () => {
  try {
    const result = execSync('Get-ChildItem -Path . -Recurse -Include *.tsx,*.ts | Select-String -Pattern "\\$1\\?\.\\$2" | Select-Object -ExpandProperty Path -Unique', 
      { cwd: rootDir, shell: 'powershell.exe' });
    
    return result.toString().trim().split('\n')
      .map(line => line.trim())
      .filter(Boolean)
      .map(filePath => filePath.replace(/^\.[\\/]/, ''));
  } catch (error) {
    console.error('Error finding files:', error.message);
    return [];
  }
};

// Common replacements based on context
const contextReplacements = [
  // React Router navigation
  { 
    context: /import.*useRouter.*from.*next\/navigation/,
    pattern: /\$1\?\.\$2\(['"]([^'"]+)['"]\)/g, 
    replacement: 'router.push(\'$1\')' 
  },
  
  // Form handling
  { 
    context: /onChange/,
    pattern: /\$1\?\.\$2\.value/g, 
    replacement: 'e.target.value' 
  },
  
  // Array mapping
  { 
    context: /\{.*\}/,
    pattern: /\$1\?\.\$2\((.*?)\s*=>\s*(.*?)\)/g, 
    replacement: 'items.map(($1) => $2)' 
  },
  
  // React refs
  { 
    context: /useRef/,
    pattern: /\$1\?\.\$2\.current/g, 
    replacement: 'ref.current' 
  },
  
  // Component displayName
  { 
    context: /displayName/,
    pattern: /\$1\?\.\$2\s*=\s*([^;]+)\.displayName/g, 
    replacement: 'Component.displayName = $1.displayName' 
  },
];

// Generic fallback replacements when context can't be determined
const genericReplacements = [
  // Common function calls
  { pattern: /\$1\?\.\$2\(\)/g, replacement: 'functionName()' },
  
  // Property access
  { pattern: /\$1\?\.\$2/g, replacement: 'object.property' },
];

// Process a single file
const processFile = (filePath) => {
  const fullPath = path.join(rootDir, filePath);
  
  try {
    // Read the file
    let content = fs.readFileSync(fullPath, 'utf8');
    let originalContent = content;
    let replacementsMade = 0;
    
    // First try context-aware replacements
    for (const { context, pattern, replacement } of contextReplacements) {
      if (context.test(content)) {
        content = content.replace(pattern, (match) => {
          replacementsMade++;
          return replacement;
        });
      }
    }
    
    // If no context replacements were made, try generic ones
    if (replacementsMade === 0) {
      console.log(`⚠️ Using generic replacements for: ${filePath}`);
      
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
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`✅ Fixed ${replacementsMade} instances in: ${filePath}`);
      return true;
    } else {
      console.log(`ℹ️ No changes made to: ${filePath}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
};

// Main execution
console.log('Finding files with $1?.$2 placeholders...');
const files = getAllTsFiles();

if (files.length === 0) {
  console.log('No files found with placeholders.');
  process.exit(0);
}

console.log(`Found ${files.length} files with placeholders.`);
console.log('Processing files...');

let fixedCount = 0;
for (const file of files) {
  if (processFile(file)) {
    fixedCount++;
  }
}

console.log(`Script completed. Fixed ${fixedCount} out of ${files.length} files.`);
console.log('Please review the changes and manually fix any remaining issues.');
