/**
 * Direct Expo starter - Starts Expo directly on port 3243
 * Simple script that just starts Expo on the port that Apache proxies to
 * First runs fix-module-error.sh to fix minimatch module issues
 */

const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Create missing vector icons directories to prevent crashes
function fixVectorIcons() {
  console.log('Creating missing vector icons directories...');
  const iconFontPaths = [
    path.join(__dirname, 'expo-app', 'node_modules', '@expo', 'vector-icons', 'build', 'vendor', 'react-native-vector-icons', 'Fonts'),
    path.join(__dirname, 'node_modules', '@expo', 'vector-icons', 'build', 'vendor', 'react-native-vector-icons', 'Fonts')
  ];
  
  iconFontPaths.forEach(dirPath => {
    try {
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`Created directory: ${dirPath}`);
      }
    } catch (err) {
      console.warn(`Warning: Could not create ${dirPath}:`, err.message);
    }
  });
}

// Configuration
const PORT = 3243;  // The port Apache is configured to proxy to
const expoAppDir = path.join(__dirname, 'expo-app');

// Startup tracking variables
let serverStarted = false;
let startupTimer = null;

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

// Fix vector icons issue
fixVectorIcons();

// Create _node_modules directory for compatibility
const nodeModulesDir = path.join(__dirname, 'expo-app', '_node_modules');
if (!fs.existsSync(nodeModulesDir)) {
  try {
    fs.mkdirSync(nodeModulesDir, { recursive: true });
    console.log(`Created _node_modules directory: ${nodeModulesDir}`);

    // Create @expo directory
    const expoDir = path.join(nodeModulesDir, '@expo');
    fs.mkdirSync(expoDir, { recursive: true });
    
    // Create vector-icons/build/vendor/react-native-vector-icons/Fonts directory
    const iconFontsDir = path.join(expoDir, 'vector-icons', 'build', 'vendor', 'react-native-vector-icons', 'Fonts');
    fs.mkdirSync(iconFontsDir, { recursive: true });
    console.log(`Created vector icons directory: ${iconFontsDir}`);
    
    // Create empty font file to prevent crashes
    const missingFontFile = path.join(iconFontsDir, 'MaterialCommunityIcons.ttf');
    fs.writeFileSync(missingFontFile, '');
    console.log(`Created empty font file: ${missingFontFile}`);
  } catch (err) {
    console.warn(`Warning: Could not create required directories:`, err.message);
  }
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
  NODE_ENV: 'development',
  DEBUG: '*',  // Enable all debug output
  EXPO_DEBUG: 'true',
  CI: 'false',  // Must be 'false' string to be properly parsed as boolean
  BROWSER: 'none',  // Prevent opening browser
  EXPO_WEB_PORT: PORT.toString(),  // Set explicit web port
  PORT: PORT.toString(),  // For Metro
  EXPO_WEBPACK_PUBLIC_PATH: '/',  // Important: set correct public path for bundle assets
  EXPO_NO_FONTS: 'true',  // Skip font loading
  EXPO_USE_VECTOR_ICONS: 'false',  // Skip vector icons
  DANGEROUSLY_DISABLE_HOST_CHECK: 'true'  // Allow external connections
};

// Start Expo with web mode on the specified port 
console.log(`Running: npx expo start --web --port ${PORT} --host lan --no-dev in ${expoAppDir}`);
const expoProcess = spawn('npx', [
  'expo',
  'start',
  '--web',
  '--port',
  PORT.toString(),
  '--host',
  'lan',  // Use 'lan' to make it accessible on the network
  '--no-dev'  // Use production mode to reduce potential issues
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
    
    // Mark server as started when we see this line
    if (output.includes('Logs for your project will appear below')) {
      serverStarted = true;
      console.log('✅ Expo server has started successfully');
    }
    
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

// Set a longer timeout for initial startup
startupTimer = setTimeout(() => {
  if (!serverStarted) {
    console.log('Expo startup timeout after 60 seconds. Not restarting automatically.');
    // Keep the process running, just log the issue
  }
}, 60000);

// Handle process exit
expoProcess.on('close', (code) => {
  console.log(`Expo process exited with code ${code}`);
  
  // Clear the startup timer if it's still running
  if (startupTimer) {
    clearTimeout(startupTimer);
  }
  
  if (serverStarted) {
    // If server was previously running but crashed, restart it
    console.log('Expo crashed after successful startup. Restarting in 5 seconds...');
    setTimeout(() => {
      console.log('Restarting Expo...');
      process.exit(1);  // Exit and let the system restart the process
    }, 5000);
  } else {
    // If server never started successfully, log but don't auto-restart
    console.log('Expo crashed during startup. Please check logs for errors.');
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