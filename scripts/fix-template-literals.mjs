#!/usr/bin/env node

/**
 * fix-template-literals.mjs
 * 
 * This script fixes template literal syntax errors in the product-service.ts file
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Logger function
function log(message) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

// Fix template literals in product-service.ts
async function fixProductServiceTemplateLiterals() {
  log('🔍 Fixing template literals in product-service.ts...');
  
  const filePath = path.join(rootDir, 'app/lib/services/product-service.ts');
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
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
    
    // Fix missing function parameters
    content = content.replace(
      /async getProductById\(\.\.\.args\): Promise<ProductWithVariations \| null> {/,
      'async getProductById(productId: string): Promise<ProductWithVariations | null> {'
    );
    
    content = content.replace(
      /async getProducts\(\.\.\.args\): Promise<ProductListResult> {/,
      'async getProducts(options: ProductListOptions): Promise<ProductListResult> {'
    );
    
    content = content.replace(
      /async createProduct\(\.\.\.args\): Promise<ProductSelect> {/,
      'async createProduct(productData: ProductInsert): Promise<ProductSelect> {'
    );
    
    content = content.replace(
      /async deleteProduct\(\.\.\.args\): Promise<boolean> {/,
      'async deleteProduct(productId: string): Promise<boolean> {'
    );
    
    content = content.replace(
      /async getProductStats\(\.\.\.args\): Promise<ProductStats> {/,
      'async getProductStats(): Promise<ProductStats> {'
    );
    
    // Write the fixed content back to the file
    fs.writeFileSync(filePath, content);
    
    log('✅ Fixed template literals in product-service.ts');
    return true;
  } catch (err) {
    log(`❌ Error processing product-service.ts: ${err.message}`);
    return false;
  }
}

// Main function
async function main() {
  log('🛠️ Starting template literal fixer...');
  
  const fixedProductService = await fixProductServiceTemplateLiterals();
  
  log(`
📊 Summary:
- Fixed product-service.ts: ${fixedProductService ? 'Yes' : 'No'}
`);
  
  log('✅ Template literal fixing completed!');
}

main().catch(error => {
  log(`❌ Error: ${error.message}`);
  process.exit(1);
});
