// Simple script to start Expo directly on port 3243 with no HTTP server

const { spawn } = require('child_process');
const path = require('path');

// Configuration
const PORT = 3243;
const expoAppDir = path.join(__dirname, 'expo-app');

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