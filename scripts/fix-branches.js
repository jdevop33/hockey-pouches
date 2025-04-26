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

  // 1. Make sure we're on the main branch (renamed from master)
  console.log('Current branch:');
  runCommand('git branch --show-current');

  // 2. Add changes to next.config.cjs
  runCommand('git add next.config.cjs');

  // 3. Commit changes
  runCommand(
    'git commit -m "Fix: Update next.config.cjs experimental options to fix Vercel build warnings"'
  );

  // 4. Force push to main
  runCommand('git push -f origin main');

  // 5. Delete the remote fix-analytics branch
  runCommand('git push origin --delete fix-analytics');

  // 6. Delete the remote hockey-b2c branch
  runCommand('git push origin --delete hockey-b2c');

  // 7. Delete the remote master branch
  runCommand('git push origin --delete master');

  // 8. Delete local fix-analytics branch
  runCommand('git branch -D fix-analytics');

  console.log('Git branch cleanup completed!');
}

// Run the main function
fixGitBranches().catch(console.error);
