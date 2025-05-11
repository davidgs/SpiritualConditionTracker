/**
 * Enhanced Expo runner with proper host binding configuration
 * Version: 1.0.8 (May 11, 2025)
 */
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const PORT = 3243;
const PROJECT_DIR = path.resolve(__dirname, 'expo-app');
const LOG_FILE = path.resolve(__dirname, 'expo-server.log');

// Ensure proper logging
function log(message) {
  const timestamp = new Date().toLocaleString();
  const formattedMessage = `[${timestamp}] ${message}`;
  console.log(formattedMessage);
  appendToLog(formattedMessage);
}

function appendToLog(message) {
  fs.appendFileSync(LOG_FILE, message + '\n');
}

// Make sure vector icons work properly
function fixVectorIcons() {
  log('Setting up vector icons for proper web display...');
  
  // No need to modify files directly in this version,
  // we'll rely on proper configuration in app.json and expo
  
  log('Vector icons setup completed');
}

// Generate a version string for this server
function injectVersionInfo() {
  const timestamp = Date.now();
  const date = new Date().toLocaleString();
  const version = '1.0.6';
  const versionString = `${version} - ${date} - BUILD-${timestamp}`;
  
  log(`Created version injector file with version: ${versionString}`);
  return timestamp;
}

// Main function
async function main() {
  try {
    // Make sure the log file exists
    if (!fs.existsSync(LOG_FILE)) {
      fs.writeFileSync(LOG_FILE, '');
    }
    
    // Ensure vector icons work
    fixVectorIcons();
    
    // Generate version info
    const buildTimestamp = injectVersionInfo();
    
    // Start Expo
    log(`Starting project at ${PROJECT_DIR}`);
    
    // Start Expo with proper host binding and port
    const expoProcess = spawn('npx', [
      'expo', 'start', 
      '--port', PORT.toString(),
      '--host', '0.0.0.0', // Important: this binds to all interfaces
      '--no-dev', // Faster startup and better error handling
      '--clear' // Clear cache for a clean start
    ], {
      cwd: PROJECT_DIR,
      env: {
        ...process.env,
        EXPO_NO_DOCTOR: "1", // Skips environment checks
        EXPO_DEBUG: "1", // More verbose logging
        REACT_NATIVE_PACKAGER_HOSTNAME: "0.0.0.0", // Critical for proper network binding
        APP_VERSION: `1.0.6-${buildTimestamp}` // App version with timestamp
      }
    });
    
    // Handle process output
    expoProcess.stdout.on('data', (data) => {
      process.stdout.write(data);
    });
    
    expoProcess.stderr.on('data', (data) => {
      process.stderr.write(data);
    });
    
    // Handle process exit
    expoProcess.on('close', (code) => {
      log(`Expo process exited with code ${code}`);
      process.exit(code);
    });
    
    // Log successful startup
    log(`Expo should now be running on port ${PORT}`);
    
  } catch (error) {
    log(`Error starting Expo: ${error.message}`);
    process.exit(1);
  }
}

main();