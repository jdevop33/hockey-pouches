#!/usr/bin/env node

/**
 * fix-remaining-typescript-errors.mjs
 * 
 * This script fixes the remaining TypeScript errors in specific files
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

// Log function with timestamp
function log(message) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
}

// Fix calculate-commission route
async function fixCalculateCommissionRoute() {
  log('🔍 Fixing calculate-commission route...');
  const filePath = path.join(rootDir, 'app/api/orders/[orderId]/calculate-commission/route.ts');
  
  if (fs.existsSync(filePath)) {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Fix the specific error
      content = content.replace(
        /commissionId: String\(existingCommissionId \}\)/g,
        'commissionId: existingCommissionId }'
      );
      
      fs.writeFileSync(filePath, content);
      log(`✅ Fixed calculate-commission route`);
      return 1;
    } catch (err) {
      log(`❌ Error processing calculate-commission route: ${err.message}`);
      return 0;
    }
  }
  
  return 0;
}

// Fix inventory service
async function fixInventoryService() {
  log('🔍 Fixing inventory service...');
  const filePath = path.join(rootDir, 'app/lib/services/inventory-service.ts');
  
  if (fs.existsSync(filePath)) {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Fix Array<{ productId: String(number; variationId?: number; quantity: number }>
      content = content.replace(
        /items: Array<{ productId: String\(number; variationId\?: number; quantity: number }>\),/g,
        'items: Array<{ productId: number; variationId?: number; quantity: number }>,');
      
      // Fix template literals
      content = content.replace(/\`([^`]*)\$\{([^}]*)\}([^`]*)\`/g, '`$1${$2}$3`');
      
      fs.writeFileSync(filePath, content);
      log(`✅ Fixed inventory service`);
      return 1;
    } catch (err) {
      log(`❌ Error processing inventory service: ${err.message}`);
      return 0;
    }
  }
  
  return 0;
}

// Fix product service
async function fixProductService() {
  log('🔍 Fixing product service...');
  const filePath = path.join(rootDir, 'app/lib/services/product-service.ts');
  
  if (fs.existsSync(filePath)) {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Fix STOCK_LEVEL function
      content = content.replace(
        /STOCK_LEVEL: \(variationId: string, locationId: string => `stock:\${variationId}:\${locationId}`\),/g,
        'STOCK_LEVEL: (variationId: string, locationId: string) => `stock:${variationId}:${locationId}`,');
      
      // Fix TOTAL_STOCK function
      content = content.replace(
        /TOTAL_STOCK: \(variationId: string => `stock:total:\${variationId}`\),/g,
        'TOTAL_STOCK: (variationId: string) => `stock:total:${variationId}`,');
      
      // Fix template literals
      content = content.replace(/\`([^`]*)\$\{([^}]*)\}([^`]*)\`/g, '`$1${$2}$3`');
      
      // Make sure the file ends properly
      if (!content.endsWith('}')) {
        content += '\n}';
      }
      
      fs.writeFileSync(filePath, content);
      log(`✅ Fixed product service`);
      return 1;
    } catch (err) {
      log(`❌ Error processing product service: ${err.message}`);
      return 0;
    }
  }
  
  return 0;
}

// Main function
async function main() {
  log('🛠️ Starting remaining TypeScript error fixer...');
  
  const fixedCommissionRoute = await fixCalculateCommissionRoute();
  const fixedInventoryService = await fixInventoryService();
  const fixedProductService = await fixProductService();
  
  log(`
📊 Summary:
- Fixed calculate-commission route: ${fixedCommissionRoute === 1 ? 'Yes' : 'No'}
- Fixed inventory service: ${fixedInventoryService === 1 ? 'Yes' : 'No'}
- Fixed product service: ${fixedProductService === 1 ? 'Yes' : 'No'}
- Total files fixed: ${fixedCommissionRoute + fixedInventoryService + fixedProductService}
  `);
  
  log('✅ Remaining TypeScript error fixing completed!');
}

main().catch(error => {
  console.error('Error running script:', error);
  process.exit(1);
});
