#!/usr/bin/env node

/**
 * This script fixes the $1?.$2 placeholder syntax that was introduced
 * by a previous script. It targets specific files that are causing build errors.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

// Files that are causing build errors
const criticalFiles = [
  'app/components/ImageUploader.tsx',
  'app/components/ui/ReCaptcha.tsx',
  'app/components/ui/Toast.tsx',
  'app/admin/dashboard/discount-codes/[id]/page.tsx',
  'app/api/admin/tasks/route.ts'
];

// Common replacements for different contexts
const replacements = [
  // Form handling
  { pattern: /\$1\?\.\$2\.value/g, replacement: 'e.target.value' },
  
  // DOM manipulation with refs
  { pattern: /if \(\$1\?\.\$2t\)/g, replacement: 'if (fileInputRef.current)' },
  { pattern: /\$1\?\.\$2\.value = ''/g, replacement: 'fileInputRef.current.value = \'\'' },
  
  // ReCaptcha specific
  { pattern: /if \(\$1\?\.\$2t === null\)/g, replacement: 'if (widgetId.current === null)' },
  { pattern: /\$1\?\.\$2 = window\.grecaptcha\.render/g, replacement: 'widgetId.current = window.grecaptcha.render' },
  { pattern: /\$1\?\.\$2 \+= 1/g, replacement: 'renderAttempts.current += 1' },
  
  // Toast component
  { pattern: /\$1\?\.\$2 = ToastPrimitives\.Viewport\.displayName/g, replacement: 'ToastViewport.displayName = ToastPrimitives.Viewport.displayName' },
  { pattern: /\$1\?\.\$2 = ToastPrimitives\.Action\.displayName/g, replacement: 'ToastAction.displayName = ToastPrimitives.Action.displayName' },
  
  // Discount code page
  { pattern: /const isNewCode = \$1\?\.\$2d === 'new'/g, replacement: 'const isNewCode = params.id === \'new\'' },
  { pattern: /const discountCodeId = isNewCode \? null : Number\(\$1\?\.\$2\)/g, replacement: 'const discountCodeId = isNewCode ? null : Number(params.id)' },
  { pattern: /error\$1\?\.\$2 = 'Percentage discount cannot exceed 100%'/g, replacement: 'errors.discountValue = \'Percentage discount cannot exceed 100%\'' },
  
  // Form data append
  { pattern: /\$1\?\.\$2\('file', /g, replacement: 'formData.append(\'file\', ' },
  { pattern: /\$1\?\.\$2\('folder', /g, replacement: 'formData.append(\'folder\', ' },
  
  // Error handling
  { pattern: /const errorMessage = error instanceof Error \? errorMessage : 'Internal Server Error'/g, replacement: 'const errorMessage = error instanceof Error ? error.message : \'Internal Server Error\'' },
];

// Process each file
for (const filePath of criticalFiles) {
  const fullPath = path.join(rootDir, filePath);
  
  try {
    // Read the file
    let content = fs.readFileSync(fullPath, 'utf8');
    let originalContent = content;
    
    // Apply all replacements
    for (const { pattern, replacement } of replacements) {
      content = content.replace(pattern, replacement);
    }
    
    // If content changed, write it back
    if (content !== originalContent) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`✅ Fixed: ${filePath}`);
    } else {
      console.log(`⚠️ No changes made to: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

console.log('Script completed.');
