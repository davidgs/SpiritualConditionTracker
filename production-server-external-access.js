/**
 * Enhanced production server with network interface configuration
 * Modified to allow external access to properly support nginx proxy
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { startAsync } = require('@expo/cli');

// Configure paths
const LOG_DIR = path.join(__dirname, 'logs');
const LOG_FILE = path.join(LOG_DIR, 'production-server.log');

// Create logs directory if it doesn't exist
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// Timestamp function for logging
function timestamp() {
  return new Date().toISOString();
}

// Log to console and file
function log(message, type = 'INFO') {
  const timestampedMessage = `[${timestamp()}][${type}] ${message}`;
  console.log(timestampedMessage);
  writeLog(timestampedMessage);
}

// Write to log file
function writeLog(message) {
  fs.appendFileSync(LOG_FILE, message + '\n');
}

// Fix vector icons directory to prevent crashes
function fixVectorIcons() {
  log('Checking vector icons directory...', 'DEBUG');
  
  const vectorIconsDir = path.join(__dirname, 'node_modules/react-native-vector-icons/Fonts');
  if (!fs.existsSync(vectorIconsDir)) {
    log('Creating vector icons directory', 'DEBUG');
    fs.mkdirSync(vectorIconsDir, { recursive: true });
    
    // Create an empty font file to prevent errors
    fs.writeFileSync(path.join(vectorIconsDir, 'FontAwesome.ttf'), '');
    log('Created empty font file to prevent crashes', 'DEBUG');
  }
}

// Check if server is already running
function checkServerRunning() {
  return new Promise((resolve) => {
    exec('lsof -i :3243', (error, stdout) => {
      if (stdout && stdout.includes('LISTEN')) {
        log('Server is already running on port 3243', 'WARNING');
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
}

// Main function
async function main() {
  log('Starting production server...', 'INFO');
  
  try {
    // Fix vector icons to prevent crashes
    fixVectorIcons();
    
    // Check if server is already running
    const isRunning = await checkServerRunning();
    if (isRunning) {
      log('Terminating: Server already running on port 3243', 'ERROR');
      process.exit(1);
    }
    
    log('Starting Expo server on port 3243', 'INFO');
    
    // Disable code signing to prevent authentication prompts
    process.env.EXPO_NO_DOCTOR = '1';
    process.env.EXPO_NO_FONTS = '1';
    process.env.CI = 'false';
    
    // Start Expo with explicit network binding
    const options = {
      dev: true,
      minify: false,
      https: false,
      port: 3243,
      host: '0.0.0.0', // Bind to all interfaces instead of just localhost
      lan: true,       // Enable LAN access
      localhost: false, // Disable binding only to localhost
    };
    
    log(`Starting Expo with options: ${JSON.stringify(options)}`, 'DEBUG');
    
    try {
      await startAsync(options);
      log('Expo server started successfully', 'INFO');
    } catch (err) {
      log(`Failed to start Expo server: ${err.message}`, 'ERROR');
      console.error(err);
      process.exit(1);
    }
    
  } catch (error) {
    log(`Error in server startup: ${error.message}`, 'ERROR');
    console.error(error);
    process.exit(1);
  }
}

// Handle process termination
process.on('SIGINT', () => {
  log('Received SIGINT signal. Shutting down...', 'INFO');
  process.exit(0);
});

process.on('SIGTERM', () => {
  log('Received SIGTERM signal. Shutting down...', 'INFO');
  process.exit(0);
});

// Start the server
main();