/**
 * Simple host fix for Expo server
 * Minimal changes to fix the host binding issue
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { startAsync } = require('@expo/cli');

// Configure paths
const LOG_FILE = path.join(__dirname, 'server.log');

// Log to console and file
function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  console.log(logMessage);
  fs.appendFileSync(LOG_FILE, logMessage + '\n');
}

// Create dummy vector icons to prevent crashes
function fixVectorIcons() {
  const vectorIconsDir = path.join(__dirname, 'node_modules/react-native-vector-icons/Fonts');
  if (!fs.existsSync(vectorIconsDir)) {
    fs.mkdirSync(vectorIconsDir, { recursive: true });
    fs.writeFileSync(path.join(vectorIconsDir, 'FontAwesome.ttf'), '');
  }
}

// Main function
async function main() {
  try {
    // Fix common issues
    fixVectorIcons();
    
    // Set environment variables
    process.env.EXPO_NO_DOCTOR = '1';
    process.env.EXPO_NO_FONTS = '1';
    process.env.CI = 'false';
    
    log('Starting Expo server on port 3243 bound to all interfaces...');
    
    // The key change: Set the host to 0.0.0.0 to bind to all interfaces
    // This allows the server to accept connections from other hosts/containers
    const result = await startAsync({
      port: 3243,
      host: '0.0.0.0',  // THIS IS THE CRITICAL CHANGE
      dev: true,
      minify: false,
      https: false,
    });
    
    log('Expo server started successfully');
    log('Server should now be accessible via any interface');
    
  } catch (error) {
    log(`Error: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

// Start the server
main().catch(error => {
  log(`Unhandled error: ${error.message}`);
  console.error(error);
  process.exit(1);
});