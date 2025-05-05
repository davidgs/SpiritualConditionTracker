/**
 * Simplest possible script that runs Expo directly with no error handling
 * This is a troubleshooting script to help diagnose server issues
 */

const { spawn } = require('child_process');
const path = require('path');

// Configuration
const PORT = 3243; 
const expoAppDir = path.join(__dirname, 'expo-app');

console.log(`Starting Expo directly on port ${PORT}...`);

// Start Expo with most basic options and direct terminal output
const expo = spawn('npx', ['expo', 'start', '--web', '--port', PORT.toString()], {
  cwd: expoAppDir,
  stdio: 'inherit'  // Direct output to terminal
});

console.log(`Started Expo with PID ${expo.pid}`);

// Simple process handlers
process.on('SIGINT', () => {
  expo.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  expo.kill();
  process.exit(0);
});