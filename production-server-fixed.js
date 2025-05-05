/**
 * Ultra minimal Expo starter for Apache proxy setup
 * Just starts Expo on the correct port - Apache handles the rest
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Configuration - this must match Apache's proxy target port
const EXPO_PORT = 3243;

// Start Expo
async function startExpo() {
  console.log('Starting Expo on port ' + EXPO_PORT);
  
  try {
    // Check if directory exists
    const expoAppDir = path.join(__dirname, 'expo-app');
    if (!fs.existsSync(expoAppDir)) {
      console.error('Error: expo-app directory not found');
      process.exit(1);
    }
    
    // Cleanup existing processes
    try {
      console.log('Cleaning up existing processes...');
      spawn('pkill', ['-f', 'expo'], { stdio: 'ignore' });
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (err) {
      console.log('No processes to clean up');
    }
    
    // Environment for Expo
    const expoEnv = {
      ...process.env,
      DANGEROUSLY_DISABLE_HOST_CHECK: 'true',  // Allow external connections
      EXPO_NO_DEPENDENCY_VALIDATION: 'true',   // Skip validation
      CI: 'true',                              // Reduce verbose output
      PUBLIC_URL: '/',                         // Root URL
      NODE_ENV: 'production'                   // Production mode
    };
    
    // Start Expo directly on the target port
    console.log('Starting Expo process...');
    const expoProcess = spawn('npx', [
      'expo', 'start', 
      '--no-dev',
      '--web',
      '--port', 
      EXPO_PORT
    ], {
      cwd: expoAppDir,
      env: expoEnv,
      stdio: 'inherit'  // Direct output to console for easy debugging
    });
    
    console.log(`Started Expo with PID ${expoProcess.pid}`);
    
    // Handle process exit
    expoProcess.on('close', (code) => {
      console.log(`Expo process exited with code ${code}`);
      if (code !== 0) {
        console.log('Restarting Expo...');
        startExpo();
      }
    });
    
    // Handle SIGTERM signal
    process.on('SIGTERM', () => {
      console.log('SIGTERM received, shutting down...');
      expoProcess.kill();
      process.exit(0);
    });
    
    // Keep the process running
    console.log(`
==========================================================
Spiritual Condition Tracker - Expo Running
==========================================================
Expo is now running directly on port ${EXPO_PORT}
Apache should proxy requests to http://localhost:${EXPO_PORT}
The app should be accessible through your website
==========================================================
    `);
    
  } catch (err) {
    console.error('Fatal error:', err);
    process.exit(1);
  }
}

// Start everything
startExpo();