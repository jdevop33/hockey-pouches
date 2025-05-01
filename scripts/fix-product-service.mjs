#!/usr/bin/env node

/**
 * fix-product-service.mjs
 * 
 * This script fixes the remaining TypeScript errors in product-service.ts
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

// Fix product service
async function fixProductService() {
  log('🔍 Fixing product service...');
  const filePath = path.join(rootDir, 'app/lib/services/product-service.ts');
  
  if (fs.existsSync(filePath)) {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Fix String(true) issue
      content = content.replace(
        /columns: { productId: String\(true \}\),/g,
        'columns: { productId: true },'
      );
      
      // Fix template literals
      content = content.replace(/\`([^`]*)\$\{([^}]*)\}([^`]*)\`/g, '`$1${$2}$3`');
      
      // Fix async methods
      content = content.replace(
        /async getProductStats\(...args\): Promise<ProductStats> {/g,
        'async getProductStats(): Promise<ProductStats> {'
      );
      
      // Fix try-catch blocks
      content = content.replace(
        /const newQuantity = Math\.max\(0, stockLevel\.quantity \+ changeQuantity\);/g,
        '} catch (error) {\n      throw error;\n    }\n    const newQuantity = Math.max(0, stockLevel.quantity + changeQuantity);'
      );
      
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
  log('🛠️ Starting product service fixer...');
  
  const fixedProductService = await fixProductService();
  
  log(`
📊 Summary:
- Fixed product service: ${fixedProductService === 1 ? 'Yes' : 'No'}
  `);
  
  log('✅ Product service fixing completed!');
}

main().catch(error => {
  console.error('Error running script:', error);
  process.exit(1);
});
