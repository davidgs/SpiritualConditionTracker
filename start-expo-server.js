// Simple script to start Expo directly on port 3243 with no HTTP server
// This version first runs the fix-module-error.sh script to fix module issues

const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Configuration
const PORT = 3243;
const expoAppDir = path.join(__dirname, 'expo-app');

console.log('Fixing minimatch module error first...');

// Run the existing fix script first
try {
  // Check if the fix script exists
  const fixScriptPath = path.join(__dirname, 'fix-module-error.sh');
  if (fs.existsSync(fixScriptPath)) {
    console.log('Running fix-module-error.sh script...');
    execSync(`bash ${fixScriptPath}`, { stdio: 'inherit' });
    console.log('Fix script completed');
  } else {
    console.warn('Warning: fix-module-error.sh script not found');
  }
} catch (err) {
  console.error('Error running fix script:', err.message);
}

console.log(`Starting Expo directly on port ${PORT}...`);

// Set up environment variables for Expo
const env = {
  ...process.env,
  CI: '1',                          // Non-interactive mode
  PORT: PORT.toString(),            // Set port
  EXPO_WEB_PORT: PORT.toString(),   // Set Expo web port
  BROWSER: 'none',                  // Don't open browser
  DANGEROUSLY_DISABLE_HOST_CHECK: 'true'  // Allow external connections
};

// Start Expo directly
const expo = spawn('npx', [
  'expo',
  'start',
  '--web',
  '--port', PORT.toString(),
  '--host', 'lan'
], {
  cwd: expoAppDir,
  env: env,
  stdio: 'inherit'  // Direct output to terminal
});

console.log(`Started Expo with PID ${expo.pid}`);

// Handle process termination
process.on('SIGINT', () => {
  console.log('Shutting down...');
  expo.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Shutting down...');
  expo.kill();
  process.exit(0);
});