/**
 * Ultra minimal server for Spiritual Condition Tracker
 * Creates a static landing page for Apache to serve
 */

const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Configuration
const PORT = 3243;  // The port Apache is configured to proxy to
const expoAppDir = path.join(__dirname, 'expo-app');

console.log('Starting production server with fixes for module errors...');

// Run fix script first to fix all module errors
try {
  const fixScriptPath = path.join(__dirname, 'fix-all-module-errors.sh');
  if (fs.existsSync(fixScriptPath)) {
    console.log('Running fix-all-module-errors.sh script...');
    execSync(`bash ${fixScriptPath}`, { stdio: 'inherit' });
    console.log('Fix script completed');
  } else {
    console.warn('Warning: fix-all-module-errors.sh script not found');
    
    // Try the original fix script as fallback
    const oldFixScriptPath = path.join(__dirname, 'fix-module-error.sh');
    if (fs.existsSync(oldFixScriptPath)) {
      console.log('Running fix-module-error.sh script as fallback...');
      execSync(`bash ${oldFixScriptPath}`, { stdio: 'inherit' });
      console.log('Fallback fix script completed');
    } else {
      console.warn('No fix scripts found, proceeding without fixes');
    }
  }
} catch (err) {
  console.error('Error running fix script:', err.message);
}

// Ensure the Expo directory exists
if (!fs.existsSync(expoAppDir)) {
  console.error(`Error: Expo app directory not found at ${expoAppDir}`);
  process.exit(1);
}

// Start Expo
console.log(`Starting Expo app directly on port ${PORT}...`);

// Set up environment variables for Expo
const env = {
  ...process.env,
  CI: '1',  // Non-interactive mode
  BROWSER: 'none',  // Prevent opening browser
  EXPO_WEB_PORT: PORT.toString(),  // Set explicit web port
  PORT: PORT.toString(),  // For Metro
  DANGEROUSLY_DISABLE_HOST_CHECK: 'true'  // Allow external connections
};

// Start Expo with web mode on the specified port
const expoProcess = spawn('npx', [
  'expo',
  'start',
  '--web',
  '--port',
  PORT.toString(),
  '--host',
  'lan'  // Use 'lan' to make it accessible on the network
], {
  cwd: expoAppDir,
  env: env,
  stdio: 'pipe'  // Capture output
});

console.log(`Started Expo with PID ${expoProcess.pid}`);

// Pipe Expo output to console
expoProcess.stdout.on('data', (data) => {
  console.log(`Expo: ${data.toString().trim()}`);
});

expoProcess.stderr.on('data', (data) => {
  console.error(`Expo error: ${data.toString().trim()}`);
});

// Handle process exit
expoProcess.on('close', (code) => {
  console.log(`Expo process exited with code ${code}`);
  
  if (code !== 0) {
    console.log('Expo crashed. Restarting in 5 seconds...');
    setTimeout(() => {
      console.log('Restarting Expo...');
      process.exit(1);  // Exit and let the system restart the process
    }, 5000);
  }
});

// Handle process signals
process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down...');
  expoProcess.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down...');
  expoProcess.kill();
  process.exit(0);
});