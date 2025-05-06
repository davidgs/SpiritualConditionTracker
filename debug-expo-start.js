/**
 * Debug version of Expo starter for troubleshooting crashes
 * This script runs Expo with maximum verbosity and saves logs
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const PORT = 3243;
const expoAppDir = path.join(__dirname, 'expo-app');
const logFile = path.join(__dirname, 'expo-debug.log');

// Create a writable stream for logging
const logStream = fs.createWriteStream(logFile, { flags: 'a' });

function log(message) {
  const timestamp = new Date().toISOString();
  const formattedMessage = `[${timestamp}] ${message}\n`;
  console.log(message);
  logStream.write(formattedMessage);
}

// Ensure we're in the right directory
process.chdir(__dirname);
log(`Current directory: ${process.cwd()}`);
log(`Expo app directory: ${expoAppDir}`);

// Enable maximum debug output from Node.js and Expo
const env = {
  ...process.env,
  NODE_ENV: 'development',
  DEBUG: '*',  // Enable all debug output
  EXPO_DEBUG: 'true',
  PORT: PORT.toString(),
  CI: '',  // Disable CI mode to ensure watching works
  DANGEROUSLY_DISABLE_HOST_CHECK: 'true'  // Allow external connections
};

log('Starting Expo with maximum debug output...');
log(`Command: npx expo start --web --port ${PORT} --host lan --no-dev --verbose`);

const expoProcess = spawn('npx', [
  'expo',
  'start',
  '--web',
  '--port',
  PORT.toString(),
  '--host',
  'lan',
  '--no-dev',  // Try with production mode to reduce potential issues
  '--verbose'  // Enable verbose logging
], {
  cwd: expoAppDir,
  env: env,
  stdio: 'pipe'  // Capture output
});

log(`Started Expo with PID ${expoProcess.pid}`);

// Capture and log all output
expoProcess.stdout.on('data', (data) => {
  const output = data.toString().trim();
  log(`[STDOUT] ${output}`);
});

expoProcess.stderr.on('data', (data) => {
  const error = data.toString().trim();
  log(`[STDERR] ${error}`);
});

// Handle process exit
expoProcess.on('close', (code) => {
  log(`Expo process exited with code ${code}`);
  
  if (code !== 0) {
    log('Expo crashed - check expo-debug.log for details');
    logStream.end();
    process.exit(1);
  }
});

// Handle process signals
process.on('SIGINT', () => {
  log('SIGINT received, shutting down...');
  expoProcess.kill();
  logStream.end();
  process.exit(0);
});

process.on('SIGTERM', () => {
  log('SIGTERM received, shutting down...');
  expoProcess.kill();
  logStream.end();
  process.exit(0);
});

log('Debug script started - all output is being saved to expo-debug.log');