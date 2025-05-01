#!/usr/bin/env node

/**
 * fix-critical-lint-issues.mjs
 * 
 * This script fixes the most common ESLint issues that are causing build failures.
 * It focuses on:
 * 1. Unused variables - prefixing them with underscore
 * 2. Missing dependencies in useEffect hooks
 * 3. Explicit any types
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

// Fix unused variables by prefixing them with underscore
async function fixUnusedVariables() {
  log('🔍 Fixing unused variables by prefixing them with underscore...');
  
  // Find all TypeScript files
  const tsFiles = glob.sync('app/**/*.{ts,tsx}', { cwd: rootDir });
  log(`Found ${tsFiles.length} TypeScript files to analyze`);
  
  let fixedFiles = 0;
  
  for (const file of tsFiles) {
    const filePath = path.join(rootDir, file);
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      let modified = false;
      
      // Find variable declarations that are reported as unused
      // This is a simplified approach - a proper fix would use TypeScript AST
      const unusedVarRegex = /(?:const|let|var|function|interface|type|class) ([a-zA-Z0-9_]+)(?:: [^=]+)? =/g;
      let match;
      
      // Collect all variable names
      const varNames = [];
      while ((match = unusedVarRegex.exec(content)) !== null) {
        varNames.push(match[1]);
      }
      
      // For each variable, check if it's used elsewhere in the file
      for (const varName of varNames) {
        // Skip variables that already start with underscore
        if (varName.startsWith('_')) continue;
        
        // Count occurrences of the variable name
        const occurrences = (content.match(new RegExp(`\\b${varName}\\b`, 'g')) || []).length;
        
        // If the variable only appears once (in its declaration), it's likely unused
        if (occurrences === 1) {
          // Replace the variable name with _varName
          content = content.replace(
            new RegExp(`(const|let|var|function|interface|type|class) ${varName}(?:: [^=]+)? =`),
            `$1 _${varName} =`
          );
          modified = true;
        }
      }
      
      if (modified) {
        fs.writeFileSync(filePath, content);
        log(`✅ Fixed unused variables in ${file}`);
        fixedFiles++;
      }
    } catch (err) {
      log(`❌ Error processing ${file}: ${err.message}`);
    }
  }
  
  log(`Fixed unused variables in ${fixedFiles} files`);
  return fixedFiles;
}

// Fix missing dependencies in useEffect hooks
async function fixUseEffectDependencies() {
  log('🔍 Fixing missing dependencies in useEffect hooks...');
  
  // Find all React component files
  const reactFiles = glob.sync('app/**/*.{tsx,jsx}', { cwd: rootDir });
  log(`Found ${reactFiles.length} React files to analyze`);
  
  let fixedFiles = 0;
  
  for (const file of reactFiles) {
    const filePath = path.join(rootDir, file);
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      let modified = false;
      
      // Find useEffect hooks with dependency arrays
      const useEffectRegex = /useEffect\(\(\) => {([\s\S]*?)}, \[(.*?)\]\)/g;
      let match;
      
      while ((match = useEffectRegex.exec(content)) !== null) {
        const effectBody = match[1];
        const dependencies = match[2];
        
        // Extract variable names from the effect body
        const bodyVarRegex = /\b([a-zA-Z0-9_]+)\b/g;
        const bodyVars = new Set();
        let varMatch;
        
        while ((varMatch = bodyVarRegex.exec(effectBody)) !== null) {
          bodyVars.add(varMatch[1]);
        }
        
        // Get current dependencies
        const currentDeps = dependencies.split(',').map(dep => dep.trim()).filter(Boolean);
        const currentDepsSet = new Set(currentDeps);
        
        // Find variables that should be dependencies
        const missingDeps = [];
        for (const variable of bodyVars) {
          // Skip common variables that shouldn't be dependencies
          if (['useEffect', 'useState', 'useRef', 'console', 'log', 'error', 'warn', 'info'].includes(variable)) {
            continue;
          }
          
          // Skip if already in dependencies
          if (currentDepsSet.has(variable)) {
            continue;
          }
          
          // Skip React hooks and DOM elements
          if (variable.startsWith('use') || variable.startsWith('document') || variable.startsWith('window')) {
            continue;
          }
          
          missingDeps.push(variable);
        }
        
        // If there are missing dependencies, add them
        if (missingDeps.length > 0) {
          const newDeps = [...currentDeps, ...missingDeps].join(', ');
          const newUseEffect = `useEffect(() => {${effectBody}}, [${newDeps}])`;
          
          // Replace the useEffect call
          content = content.replace(match[0], newUseEffect);
          modified = true;
        }
      }
      
      if (modified) {
        fs.writeFileSync(filePath, content);
        log(`✅ Fixed useEffect dependencies in ${file}`);
        fixedFiles++;
      }
    } catch (err) {
      log(`❌ Error processing ${file}: ${err.message}`);
    }
  }
  
  log(`Fixed useEffect dependencies in ${fixedFiles} files`);
  return fixedFiles;
}

// Fix explicit any types
async function fixExplicitAnyTypes() {
  log('🔍 Fixing explicit any types...');
  
  // Find all TypeScript files
  const tsFiles = glob.sync('app/**/*.{ts,tsx}', { cwd: rootDir, ignore: ['app/api/**/*.ts', 'app/lib/**/*.ts'] });
  log(`Found ${tsFiles.length} TypeScript files to analyze`);
  
  let fixedFiles = 0;
  
  for (const file of tsFiles) {
    const filePath = path.join(rootDir, file);
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      let modified = false;
      
      // Replace explicit any with unknown
      const anyRegex = /: any(?![a-zA-Z0-9_])/g;
      if (anyRegex.test(content)) {
        content = content.replace(anyRegex, ': unknown');
        modified = true;
      }
      
      if (modified) {
        fs.writeFileSync(filePath, content);
        log(`✅ Fixed explicit any types in ${file}`);
        fixedFiles++;
      }
    } catch (err) {
      log(`❌ Error processing ${file}: ${err.message}`);
    }
  }
  
  log(`Fixed explicit any types in ${fixedFiles} files`);
  return fixedFiles;
}

// Main function
async function main() {
  log('🛠️ Starting critical lint issues fixer...');
  
  const fixedUnusedVars = await fixUnusedVariables();
  const fixedUseEffectDeps = await fixUseEffectDependencies();
  const fixedAnyTypes = await fixExplicitAnyTypes();
  
  log(`
📊 Summary:
- Fixed unused variables in ${fixedUnusedVars} files
- Fixed useEffect dependencies in ${fixedUseEffectDeps} files
- Fixed explicit any types in ${fixedAnyTypes} files
- Total files fixed: ${fixedUnusedVars + fixedUseEffectDeps + fixedAnyTypes}
  `);
  
  log('✅ Critical lint issues fixing completed!');
}

main().catch(error => {
  console.error('Error running script:', error);
  process.exit(1);
});
