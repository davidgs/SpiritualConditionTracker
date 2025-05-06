/**
 * Enhanced Expo runner with direct module fixes
 * First fixes the subprotocol issue and then runs Expo
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// First run our fix script
require('./fix-subprotocol.js');

console.log('Starting Expo directly on port 3243...');

// Get the project path - this is intended to work from the project root
const projectPath = path.resolve('./expo-app');

// Make this work both in /var/www/... and in the home directory
const expoAppPath = fs.existsSync(projectPath) ? projectPath : '.';

console.log(`Starting project at ${expoAppPath}`);

// Options for spawning the process
const options = {
  cwd: expoAppPath,
  env: {
    ...process.env,
    PORT: '3243',
    EXPO_PORT: '3243',
    REACT_NATIVE_PACKAGER_HOSTNAME: '0.0.0.0'
  },
  stdio: 'inherit' // Pipe stdio to parent process
};

// Command to start Expo
// We use 'lan' instead of '0.0.0.0' since Expo expects either 'lan', 'tunnel', or 'localhost'
const expo = spawn('npx', ['expo', 'start', '--port', '3243', '--host', 'lan'], options);

// Store process ID for potential cleanup
const pid = expo.pid;
console.log(`Started Expo with PID ${pid}`);

// Handle errors
expo.on('error', (error) => {
  console.error(`Expo failed to start: ${error.message}`);
  process.exit(1);
});

// Handle process exit
expo.on('close', (code) => {
  if (code !== 0) {
    console.error(`Expo exited with code ${code}`);
    process.exit(code);
  }
});

// Handle SIGINT and SIGTERM for graceful shutdown
process.on('SIGINT', () => {
  console.log('Received SIGINT. Shutting down Expo...');
  expo.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM. Shutting down Expo...');
  expo.kill('SIGTERM');
  process.exit(0);
});