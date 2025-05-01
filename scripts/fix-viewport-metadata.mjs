#!/usr/bin/env node
/**
 * fix-viewport-metadata.mjs
 *
 * This script migrates viewport-related metadata (themeColor, colorScheme, viewport)
 * from the metadata export to a separate viewport export according to Next.js 15 standards.
 *
 * Usage: node scripts/fix-viewport-metadata.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');

// Files to analyze
const EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];
const IGNORE_DIRS = ['node_modules', '.next', '.vercel', 'dist'];

// Viewport properties to migrate
const VIEWPORT_PROPS = ['themeColor', 'colorScheme', 'viewport'];

// Helper to recursively find files
const findFiles = dir => {
  let results = [];

  if (IGNORE_DIRS.some(ignore => dir.includes(ignore))) {
    return results;
  }

  try {
    const list = fs.readdirSync(dir);
    for (const file of list) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        // Recursively search directories
        results = results.concat(findFiles(filePath));
      } else if (stat.isFile() && EXTENSIONS.includes(path.extname(file))) {
        results.push(filePath);
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dir}:`, error.message);
  }

  return results;
};

// Check if a file has metadata that needs to be migrated
const needsViewportMigration = content => {
  // First, check if there's a metadata export - check all common patterns
  const metadataMatch = content.match(
    /export\s+const\s+metadata\s*(?::\s*[A-Za-z]+)?\s*=\s*{[^]*?}/s
  );
  if (!metadataMatch) return false;

  // Then check if any viewport properties are in metadata
  return VIEWPORT_PROPS.some(prop => new RegExp(`${prop}\\s*:`).test(metadataMatch[0]));
};

// Add a layout file check function
const isLayoutFile = filePath => {
  return filePath.includes('layout.') || filePath.includes('page.') || filePath.includes('/app/_');
};

// Extract the type from the metadata type annotation if it exists
const extractMetadataType = content => {
  const typeMatch = content.match(/export\s+const\s+metadata\s*:\s*([A-Za-z]+)\s*=/);
  return typeMatch ? typeMatch[1] : null;
};

// Check if viewport is already imported
const hasViewportImport = content => {
  return content.includes('Viewport');
};

// Migrate viewport properties from metadata to viewport
const migrateViewport = content => {
  // Check if we need to add Viewport to imports
  const metadataType = extractMetadataType(content);
  const needsViewportImport = !hasViewportImport(content) && metadataType;

  // Update imports if needed
  let updatedContent = content;
  if (needsViewportImport) {
    // Look for existing import that includes Metadata
    const importMatch = updatedContent.match(
      /import\s+.*?\{\s*(.*?Metadata.*?)\s*\}\s*from\s+['"]next['"];?/
    );
    if (importMatch) {
      // Add Viewport to existing import
      updatedContent = updatedContent.replace(
        importMatch[0],
        importMatch[0].replace(`{ ${importMatch[1]} }`, `{ ${importMatch[1]}, Viewport }`)
      );
    } else {
      // Add new import at the top of the file
      updatedContent = `import type { Viewport } from 'next';\n${updatedContent}`;
    }
  }

  // Extract metadata object
  const metadataMatch = updatedContent.match(
    /export\s+const\s+metadata\s*(?::\s*[A-Za-z]+)?\s*=\s*({[^]*?});/s
  );
  if (!metadataMatch) return updatedContent;

  const metadataObj = metadataMatch[1];

  // Extract viewport properties from metadata
  const viewportProps = {};
  let cleanedMetadata = metadataObj;

  for (const prop of VIEWPORT_PROPS) {
    const propRegex = new RegExp(`(\\s*${prop}\\s*:\\s*[^,]*,?)`, 'g');
    const matches = [...metadataObj.matchAll(propRegex)];

    for (const match of matches) {
      // Extract property and value
      const propMatch = match[0].match(new RegExp(`\\s*${prop}\\s*:\\s*([^,]*),?`));
      if (propMatch) {
        viewportProps[prop] = propMatch[1].trim();
        // Remove the property from metadata
        cleanedMetadata = cleanedMetadata.replace(match[0], '');
      }
    }
  }

  // Clean up any consecutive commas and formatting issues
  cleanedMetadata = cleanedMetadata
    .replace(/,\s*,/g, ',')
    .replace(/,\s*}/g, '}')
    .replace(/{\s*,/g, '{');

  // Replace the metadata object with the cleaned version
  updatedContent = updatedContent.replace(metadataObj, cleanedMetadata);

  // Add the viewport export
  if (Object.keys(viewportProps).length > 0) {
    // Create the viewport object string
    let viewportString = 'export const viewport';
    if (metadataType) {
      viewportString += ': Viewport';
    }
    viewportString += ' = {\n';

    // Add each property
    for (const [prop, value] of Object.entries(viewportProps)) {
      viewportString += `  ${prop}: ${value},\n`;
    }

    viewportString += '};\n\n';

    // Find position to insert the viewport export (after metadata export)
    const metadataExportEnd =
      updatedContent.indexOf(';', updatedContent.indexOf('export const metadata')) + 1;
    updatedContent =
      updatedContent.substring(0, metadataExportEnd) +
      '\n\n' +
      viewportString +
      updatedContent.substring(metadataExportEnd);
  }

  return updatedContent;
};

// Main function
const run = async () => {
  console.log('🔍 Scanning files for viewport metadata issues...');

  // Find all relevant files
  const allFiles = findFiles(path.join(ROOT_DIR, 'app'));
  console.log(`Found ${allFiles.length} files to analyze`);

  let updatedCount = 0;
  let updatedFiles = [];

  // First process layout files which are more likely to have metadata
  const layoutFiles = allFiles.filter(isLayoutFile);
  const otherFiles = allFiles.filter(f => !isLayoutFile(f));

  console.log(`Found ${layoutFiles.length} layout/page files to prioritize`);

  // Process each file
  for (const filePath of [...layoutFiles, ...otherFiles]) {
    const content = fs.readFileSync(filePath, 'utf8');

    // Use a more aggressive check for viewport props
    const hasViewportProps = VIEWPORT_PROPS.some(prop => content.includes(`${prop}:`));

    if (hasViewportProps || needsViewportMigration(content)) {
      console.log(`🔄 Migrating viewport properties in ${path.relative(ROOT_DIR, filePath)}`);
      const updatedContent = migrateViewport(content);

      if (updatedContent !== content) {
        fs.writeFileSync(filePath, updatedContent);
        updatedCount++;
        updatedFiles.push(path.relative(ROOT_DIR, filePath));
      }
    }
  }

  if (updatedCount > 0) {
    console.log(`✅ Updated ${updatedCount} files:`);
    updatedFiles.forEach(file => console.log(`- ${file}`));
  } else {
    console.log('✅ No viewport metadata issues found.');
  }
};

// Run the script
run().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
