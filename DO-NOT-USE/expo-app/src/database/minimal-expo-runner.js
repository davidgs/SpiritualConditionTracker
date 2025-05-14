/**
 * Ultra-minimal Expo runner with no extras
 * This is a stripped-down version designed to avoid Metro bundling hang issues
 */

const { spawn } = require('child_process');
const path = require('path');

// Configuration
const PORT = 3243;
const expoAppDir = path.join(__dirname, 'expo-app');

// No additional environment variables or custom features
const env = {
  ...process.env,
  NODE_ENV: 'development',
  BROWSER: 'none',
  EXPO_WEB_PORT: PORT,
  // Minimal env values needed for expo to work
  DANGEROUSLY_DISABLE_HOST_CHECK: 'true' // Allow external connections
};

console.log(`Starting minimal Expo server on port ${PORT}...`);

// Start Expo with minimal options
const expo = spawn('npx', [
  'expo', 
  'start', 
  '--web', 
  '--port', PORT.toString(),
  '--clear'
], {
  cwd: expoAppDir,
  env: env,
  stdio: 'inherit' // Simple output handling
});

// Only handle process exit
process.on('SIGINT', () => {
  console.log('Stopping Expo server...');
  expo.kill();
  process.exit(0);
});

console.log(`Started minimal Expo server with PID ${expo.pid}`);