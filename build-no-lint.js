const { execSync } = require('child_process');

// Set environment variable to disable ESLint
process.env.DISABLE_ESLINT_PLUGIN = 'true';

try {
  // Run the Next.js build command
  execSync('npx next build', { stdio: 'inherit' });
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}
