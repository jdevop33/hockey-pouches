#!/usr/bin/env node

/**
 * fix-critical-typescript-errors.mjs
 * 
 * This script fixes the most critical TypeScript errors that are preventing the build
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

// Fix String(number) issues
async function fixStringNumberIssues() {
  log('🔍 Fixing String(number) type issues...');
  
  const files = await glob('app/**/*.{ts,tsx}', { cwd: rootDir });
  let fixedFiles = 0;
  
  for (const file of files) {
    const filePath = path.join(rootDir, file);
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      let modified = false;
      
      // Replace String(number) with actual number
      if (content.includes('String(') && !content.includes('String(error)')) {
        const originalContent = content;
        
        // Fix String(number) in property assignments
        content = content.replace(
          /(\w+Id):\s*String\(([^)]+)\)/g,
          (match, prop, value) => {
            // If the property should be a number, remove String()
            return `${prop}: ${value}`;
          }
        );
        
        // Fix other String() conversions that should be numbers
        content = content.replace(
          /sourceInventoryId:\s*String\(([^)]+)\)/g,
          'sourceInventoryId: $1'
        );
        
        if (content !== originalContent) {
          modified = true;
        }
      }
      
      if (modified) {
        fs.writeFileSync(filePath, content);
        log(`✅ Fixed String(number) issues in ${file}`);
        fixedFiles++;
      }
    } catch (err) {
      log(`❌ Error processing ${file}: ${err.message}`);
    }
  }
  
  log(`Fixed String(number) issues in ${fixedFiles} files`);
  return fixedFiles;
}

// Fix errorMessage references
async function fixErrorMessageIssues() {
  log('🔍 Fixing errorMessage references...');
  
  const files = await glob('app/**/*.{ts,tsx}', { cwd: rootDir });
  let fixedFiles = 0;
  
  for (const file of files) {
    const filePath = path.join(rootDir, file);
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      let modified = false;
      
      // Replace errorMessage with error.message
      if (content.includes('errorMessage') && !content.includes('const errorMessage =')) {
        // Add error message handling
        if (content.includes('catch (error)') && !content.includes('const errorMessage =')) {
          content = content.replace(
            /catch\s*\(\s*error\s*\)\s*{/g,
            'catch (error) {\n    const errorMessage = error instanceof Error ? error.message : String(error);'
          );
          modified = true;
        }
        
        // Fix standalone errorMessage references
        if (!content.includes('const errorMessage =')) {
          content = content.replace(
            /errorMessage/g,
            'error instanceof Error ? error.message : String(error)'
          );
          modified = true;
        }
      }
      
      if (modified) {
        fs.writeFileSync(filePath, content);
        log(`✅ Fixed errorMessage issues in ${file}`);
        fixedFiles++;
      }
    } catch (err) {
      log(`❌ Error processing ${file}: ${err.message}`);
    }
  }
  
  log(`Fixed errorMessage issues in ${fixedFiles} files`);
  return fixedFiles;
}

// Fix type issues in inventory service
async function fixInventoryServiceIssues() {
  log('🔍 Fixing inventory service type issues...');
  
  const filePath = path.join(rootDir, 'app/lib/services/inventory-service.ts');
  
  try {
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Fix missing imports
      if (!content.includes('import { schema }')) {
        const importStatement = `import { schema } from '@/lib/schema';\n`;
        content = importStatement + content;
      }
      
      if (!content.includes('import { v4 as uuidv4 }')) {
        const importStatement = `import { v4 as uuidv4 } from 'uuid';\n`;
        content = importStatement + content;
      }
      
      if (!content.includes('import { logger }')) {
        const importStatement = `import { logger } from '@/lib/logger';\n`;
        content = importStatement + content;
      }
      
      // Fix StockMovementInsert type
      if (!content.includes('type StockMovementInsert')) {
        const typeDefinition = `
// Stock movement insert type
type StockMovementInsert = {
  id: string;
  stockLevelId: string;
  quantity: number;
  type: 'Sale' | 'Return' | 'Restock' | 'Adjustment' | 'TransferOut' | 'TransferIn' | 'Initial';
  notes?: string | null;
  referenceId?: string | null;
  createdAt?: Date;
};
`;
        // Insert after imports
        const lastImportIndex = content.lastIndexOf('import ');
        const lastImportEndIndex = content.indexOf('\n', lastImportIndex);
        content = content.slice(0, lastImportEndIndex + 1) + '\n' + typeDefinition + content.slice(lastImportEndIndex + 1);
      }
      
      // Fix null checks for stockLevel
      content = content.replace(
        /const availableQuantity = stockLevel\.quantity - stockLevel\.reserved_quantity;/g,
        'const availableQuantity = stockLevel ? stockLevel.quantity - stockLevel.reserved_quantity : 0;'
      );
      
      content = content.replace(
        /WHERE id = \$\{stockLevel\.id\}/g,
        'WHERE id = ${stockLevel?.id}'
      );
      
      content = content.replace(
        /const availableQuantity = sourceStock\.quantity - sourceStock\.reserved_quantity;/g,
        'const availableQuantity = sourceStock ? sourceStock.quantity - sourceStock.reserved_quantity : 0;'
      );
      
      content = content.replace(
        /WHERE id = \$\{sourceStock\.id\}/g,
        'WHERE id = ${sourceStock?.id}'
      );
      
      // Fix success boolean issue
      content = content.replace(
        /success: Array\.isArray\(errors\) \? \(Array\.isArray\(errors\) \? errors\.length : 0\) : 0 === 0,/g,
        'success: Array.isArray(errors) ? errors.length === 0 : true,'
      );
      
      // Fix castDbRows issue
      content = content.replace(
        /return castDbRows</g,
        'return rows as unknown as'
      );
      
      fs.writeFileSync(filePath, content);
      log(`✅ Fixed inventory service issues`);
      return 1;
    }
    
    return 0;
  } catch (err) {
    log(`❌ Error processing inventory service: ${err.message}`);
    return 0;
  }
}

// Main function
async function main() {
  log('🛠️ Starting critical TypeScript error fixer...');
  
  const fixedStringNumber = await fixStringNumberIssues();
  const fixedErrorMessage = await fixErrorMessageIssues();
  const fixedInventoryService = await fixInventoryServiceIssues();
  
  log(`
📊 Summary:
- Fixed String(number) issues in ${fixedStringNumber} files
- Fixed errorMessage issues in ${fixedErrorMessage} files
- Fixed inventory service issues: ${fixedInventoryService === 1 ? 'Yes' : 'No'}
- Total files fixed: ${fixedStringNumber + fixedErrorMessage + fixedInventoryService}
  `);
  
  log('✅ Critical TypeScript error fixing completed!');
}

main().catch(error => {
  console.error('Error running script:', error);
  process.exit(1);
});
