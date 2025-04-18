/**
 * This script helps open the OpenGraph image generator in your browser
 * Run it with: node scripts/generate-og-image.js
 */

const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// Get the absolute path to the OG image generator
const ogGeneratorPath = path.join(__dirname, '..', 'public', 'images', 'og', 'create-og-image.html');

// Check if the file exists
if (!fs.existsSync(ogGeneratorPath)) {
  console.error('Error: OpenGraph image generator not found at:', ogGeneratorPath);
  process.exit(1);
}

// Convert to file URL
const fileUrl = `file://${ogGeneratorPath.replace(/\\/g, '/')}`;

// Determine the platform-specific command to open a URL
let command;
switch (process.platform) {
  case 'win32':
    command = `start "" "${fileUrl}"`;
    break;
  case 'darwin':
    command = `open "${fileUrl}"`;
    break;
  default:
    command = `xdg-open "${fileUrl}"`;
}

// Open the URL in the default browser
console.log('Opening OpenGraph image generator...');
exec(command, (error) => {
  if (error) {
    console.error('Error opening browser:', error);
    process.exit(1);
  }
  
  console.log('OpenGraph image generator opened in your browser.');
  console.log('Follow the instructions to create your OpenGraph image.');
  console.log('\nAfter creating the image:');
  console.log('1. Save it as "hockey-pouches-og.png" in public/images/og/');
  console.log('2. Update app/layout.tsx to use this image for OpenGraph and Twitter cards');
});
