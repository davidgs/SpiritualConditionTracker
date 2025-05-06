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

// Create a new log file (overwriting existing)
const logStream = fs.createWriteStream(logFile, { flags: 'w' });

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

// Log system information
const nodeVersion = process.version;
const platform = process.platform;
const arch = process.arch;
log(`Node.js version: ${nodeVersion}`);
log(`Platform: ${platform}`);
log(`Architecture: ${arch}`);

// Check if expo-app directory exists
if (!fs.existsSync(expoAppDir)) {
  log(`ERROR: Expo app directory '${expoAppDir}' does not exist!`);
  process.exit(1);
}

// List package.json content
try {
  const packageJsonPath = path.join(expoAppDir, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    log('Found package.json - dependencies:');
    log(JSON.stringify(packageJson.dependencies, null, 2));
  } else {
    log('WARNING: No package.json found in expo-app directory!');
  }
} catch (err) {
  log(`Error reading package.json: ${err.message}`);
}

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
log(`Command: npx expo start --web --port ${PORT} --host lan --no-dev`);

const expoProcess = spawn('npx', [
  'expo',
  'start',
  '--web',
  '--port',
  PORT.toString(),
  '--host',
  'lan',
  '--no-dev'  // Try with production mode to reduce potential issues
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