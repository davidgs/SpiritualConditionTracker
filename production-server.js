/**
 * Direct Expo starter - Starts Expo directly on port 3243
 * Simple script that just starts Expo on the port that Apache proxies to
 * First runs fix-module-error.sh to fix minimatch module issues
 */

const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Configuration
const PORT = 3243;  // The port Apache is configured to proxy to
const expoAppDir = path.join(__dirname, 'expo-app');

// Run fix-module-error.sh first to fix the minimatch module issue
console.log('Fixing module errors before starting Expo...');
try {
  const fixScriptPath = path.join(__dirname, 'fix-module-error.sh');
  if (fs.existsSync(fixScriptPath)) {
    console.log('Running fix-module-error.sh script...');
    execSync(`bash ${fixScriptPath}`, { stdio: 'inherit' });
    console.log('Fix script completed');
  } else {
    console.warn('Warning: fix-module-error.sh script not found');
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

// Clean up any existing processes
try {
  console.log('Cleaning up existing processes...');
  spawn('pkill', ['-f', 'expo'], { stdio: 'ignore' });
} catch (err) {
  // Ignore errors
}

// Set up environment variables for Expo
const env = {
  ...process.env,
  CI: 'false',  // Must be 'false' string to be properly parsed as boolean
  BROWSER: 'none',  // Prevent opening browser
  EXPO_WEB_PORT: PORT.toString(),  // Set explicit web port
  PORT: PORT.toString(),  // For Metro
  EXPO_WEBPACK_PUBLIC_PATH: '/',  // Important: set correct public path for bundle assets
  DANGEROUSLY_DISABLE_HOST_CHECK: 'true'  // Allow external connections
};

// Start Expo with web mode on the specified port 
console.log(`Running: npx expo start --web --port ${PORT} --host lan in ${expoAppDir}`);
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
  stdio: 'pipe'  // Capture output to see error details
});

console.log(`Started Expo with PID ${expoProcess.pid}`);

// Capture and log all output from Expo
if (expoProcess.stdout) {
  expoProcess.stdout.on('data', (data) => {
    const output = data.toString().trim();
    console.log(`Expo: ${output}`);
    
    // Log if we detect any known error patterns
    if (output.includes('Error:') || output.includes('error:') || 
        output.includes('Cannot find module') || output.includes('ENOENT')) {
      console.error('Error detected in Expo output:', output);
    }
  });
}

if (expoProcess.stderr) {
  expoProcess.stderr.on('data', (data) => {
    const error = data.toString().trim();
    console.error(`Expo error: ${error}`);
  });
}

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