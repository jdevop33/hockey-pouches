#!/usr/bin/env node

/**
 * This script helps fix common TypeScript errors across the codebase
 *
 * Issues it addresses:
 * 1. Invalid return types of {} as SomeType
 * 2. Handling of null/undefined values without proper checks
 * 3. Error message circular references
 * 4. Rest parameter types with missing annotations
 * 5. Type casting of unknown values
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '..');
const APP_DIR = path.join(rootDir, 'app');
let filesFixed = 0;
let errorsFixed = 0;

// Common TypeScript error patterns and their fixes
const FIXES = [
  // Fix: Remove placeholder return statements with {} as Type
  {
    pattern: /return\s+\{\}\s+as\s+([^;]+);/g,
    replacement: (match, returnType) => {
      if (returnType.includes('boolean')) {
        return 'return false;';
      }
      if (returnType.includes('number')) {
        return 'return 0;';
      }
      if (returnType.includes('string')) {
        return "return '';";
      }
      return `return {
      // Default empty object for ${returnType}
    };`;
    },
    description: 'Removing placeholder `{} as Type` returns',
  },

  // Fix: Error message circular references
  {
    pattern:
      /const\s+errorMessage\s+=\s+error\s+instanceof\s+Error\s+\?\s+errorMessage\s+:\s+String\(error\);/g,
    replacement: 'const errorMessage = error instanceof Error ? error.message : String(error);',
    description: 'Fixing circular error message references',
  },

  // Fix: Properly type rest parameters
  {
    pattern: /async\s+(\w+)\(\.\.\.(args)\):/g,
    replacement: 'async $1(...$2: any[]):',
    description: 'Adding type annotations to rest parameters',
  },

  // Fix: Null safety checks for object access
  {
    pattern: /(\w+)\.(\w+)(?!\s*\?\?|\s*\?\.|\s*===|\s*!==|\s*&&|\)\s*\{)/g,
    testFunc: (file, match, obj, prop) => {
      // Only apply this fix if we detect that the object might be null/undefined
      const prevLines = file.slice(0, file.indexOf(match) + match.length);
      return (
        prevLines.includes(`${obj} = `) &&
        !prevLines.includes(`${obj}?`) &&
        !prevLines.includes(`${obj} ?`) &&
        !prevLines.includes(`!${obj}`) &&
        !prevLines.includes(`${obj} &&`) &&
        !prevLines.includes(`if (${obj})`)
      );
    },
    replacement: '$1?.$2',
    description: 'Adding null safety checks to object property access',
  },

  // Fix: Cast unknown values to appropriate types when passing to typed functions
  {
    pattern: /(\w+)\(([^)]+)\)\s*\/\/\s*.*?(number|string)/g,
    replacement: (match, func, args, type) => {
      // Convert arguments to the expected type
      if (type === 'number') {
        return `${func}(Number(${args}))`;
      } else if (type === 'string') {
        return `${func}(String(${args}))`;
      }
      return match;
    },
    description: 'Adding type casting to function arguments',
  },
];

/**
 * Process a file and apply fixes
 */
function processFile(filePath) {
  // Skip node_modules, .next, and non-TypeScript files
  if (
    filePath.includes('node_modules') ||
    filePath.includes('.next') ||
    (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx'))
  ) {
    return;
  }

  console.log(`Checking ${filePath}...`);
  let fileContent = fs.readFileSync(filePath, 'utf8');
  let originalContent = fileContent;
  let fileWasFixed = false;

  // Apply fixes
  FIXES.forEach(fix => {
    let matches = 0;

    if (fix.testFunc) {
      // For fixes that need contextual examination
      const regex = new RegExp(fix.pattern);
      let match;
      let lastIndex = 0;
      let newContent = '';

      while ((match = regex.exec(fileContent.slice(lastIndex))) !== null) {
        const fullMatch = match[0];
        const matchIndex = lastIndex + match.index;
        const beforeMatchContent = fileContent.slice(lastIndex, matchIndex);

        // Get the full file up to this point for context
        const fileUpToMatch = fileContent.slice(0, matchIndex + fullMatch.length);

        // Apply test function to see if this match should be replaced
        if (fix.testFunc(fileUpToMatch, fullMatch, ...match.slice(1))) {
          const replacement =
            typeof fix.replacement === 'function'
              ? fix.replacement(fullMatch, ...match.slice(1))
              : fix.replacement;

          newContent += beforeMatchContent + replacement;
          matches++;
        } else {
          newContent += beforeMatchContent + fullMatch;
        }

        lastIndex = matchIndex + fullMatch.length;
      }

      // Add the remaining content
      newContent += fileContent.slice(lastIndex);

      if (matches > 0) {
        fileContent = newContent;
        fileWasFixed = true;
        errorsFixed += matches;
        console.log(`  - Fixed ${matches} instances of ${fix.description}`);
      }
    } else {
      // Simple regex replacement
      const newContent = fileContent.replace(fix.pattern, (match, ...args) => {
        matches++;
        return typeof fix.replacement === 'function'
          ? fix.replacement(match, ...args)
          : fix.replacement;
      });

      if (newContent !== fileContent) {
        fileContent = newContent;
        fileWasFixed = true;
        errorsFixed += matches;
        console.log(`  - Fixed ${matches} instances of ${fix.description}`);
      }
    }
  });

  // Only write to the file if changes were made
  if (fileWasFixed) {
    fs.writeFileSync(filePath, fileContent, 'utf8');
    filesFixed++;
    console.log(`✅ Fixed ${filePath}`);
  }
}

/**
 * Walk directory recursively and process files
 */
function walkDir(dir) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory() && !filePath.includes('node_modules') && !filePath.includes('.next')) {
      walkDir(filePath);
    } else if (stat.isFile()) {
      processFile(filePath);
    }
  });
}

// Start processing
console.log('Starting TypeScript error fixes...');
walkDir(APP_DIR);

console.log(`\nFixed ${errorsFixed} errors in ${filesFixed} files.`);
console.log('Running typecheck again to see remaining issues...');

try {
  execSync('npx tsc --noEmit', { encoding: 'utf8' });
  console.log('✅ No TypeScript errors remaining!');
} catch (error) {
  console.log('Some TypeScript errors still remain:');
  console.log(error.stdout.split('\n').slice(0, 10).join('\n') + '\n...');
  console.log(`\nRun this script again or fix remaining issues manually.`);
}
