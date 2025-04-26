const { execSync } = require('child_process');

// Function to execute shell commands and log output
function runCommand(command) {
  console.log(`Running: ${command}`);
  try {
    const output = execSync(command, { encoding: 'utf8' });
    console.log(output);
    return output;
  } catch (error) {
    console.error(`Error executing command: ${command}`);
    console.error(error.message);
    return null;
  }
}

// Main function to fix Git branches
async function fixGitBranches() {
  console.log('Starting Git branch cleanup...');

  // 1. Add changes to next.config.cjs
  runCommand('git add next.config.cjs');

  // 2. Commit changes
  runCommand(
    'git commit -m "Fix: Update next.config.cjs experimental options to fix Vercel build warnings"'
  );

  // 3. Push to master
  runCommand('git push origin master');

  console.log('Git branch cleanup completed!');
}

// Run the main function
fixGitBranches().catch(console.error);
