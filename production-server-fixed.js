/**
 * Ultra minimal Expo starter for Apache proxy setup
 * Fixes module compatibility issues before starting
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Configuration - this must match Apache's proxy target port
const EXPO_PORT = 3243;

// Fix minimatch module issues
function fixMinimatchModule() {
  try {
    console.log('Fixing minimatch module...');
    const minimatchPath = path.join(__dirname, 'node_modules', 'minimatch');
    const packageJsonPath = path.join(minimatchPath, 'package.json');
    
    if (fs.existsSync(packageJsonPath)) {
      // Read the package.json
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      
      // Change type from "module" to "commonjs"
      if (packageJson.type === 'module') {
        packageJson.type = 'commonjs';
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
        console.log('Changed minimatch module type to commonjs');
      }
    }
  } catch (err) {
    console.error('Error fixing minimatch module:', err);
  }
}

// Start Expo
async function startExpo() {
  console.log('Starting Expo on port ' + EXPO_PORT);
  
  try {
    // Fix module issues first
    fixMinimatchModule();
    
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
      PUBLIC_URL: '/',                         // Root URL
      NODE_ENV: 'production',                  // Production mode
      SKIP_PREFLIGHT_CHECK: 'true'             // Skip React checks
    };
    
    // Try to use a compatible Expo web command that doesn't rely on problematic modules
    console.log('Starting React Native web server directly...');
    
    // Use webpack serve directly instead of Expo CLI
    const expoProcess = spawn('npx', [
      'react-native', 
      'start',
      '--port', 
      EXPO_PORT
    ], {
      cwd: expoAppDir,
      env: expoEnv,
      stdio: 'inherit'  // Direct output to console for easy debugging
    });
    
    console.log(`Started server with PID ${expoProcess.pid}`);
    
    // Handle process exit
    expoProcess.on('close', (code) => {
      console.log(`Process exited with code ${code}`);
      
      // Only restart if not killed intentionally
      if (code !== 0 && !expoProcess.killed) {
        console.log('Restarting server...');
        setTimeout(() => startExpo(), 5000); // Wait 5 seconds before restart
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
Spiritual Condition Tracker - Server Running
==========================================================
Server is now running directly on port ${EXPO_PORT}
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