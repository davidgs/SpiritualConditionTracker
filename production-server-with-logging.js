/**
 * Enhanced production server with extensive logging
 * This version includes maximum debug information
 */

const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const http = require('http');
const os = require('os');

// Create timestamp for logs
function timestamp() {
  return new Date().toISOString();
}

// Enhanced log function
function log(message, type = 'INFO') {
  console.log(`[${timestamp()}][${type}] ${message}`);
}

// Create a log file
const LOG_FILE = path.join(__dirname, 'deployment-debug.log');
const DEBUG = true;

// Write to log file
function writeLog(message) {
  if (DEBUG) {
    try {
      fs.appendFileSync(LOG_FILE, `${timestamp()}: ${message}\n`);
    } catch (err) {
      console.error(`Could not write to log file: ${err.message}`);
    }
  }
}

// Start with system info
log('=== STARTING DEPLOYMENT SERVER WITH DEBUG LOGGING ===', 'DEBUG');
log(`Node.js version: ${process.version}`, 'DEBUG');
log(`Operating system: ${os.type()} ${os.release()}`, 'DEBUG');
log(`CPU architecture: ${os.arch()}`, 'DEBUG');
log(`Total memory: ${Math.round(os.totalmem() / (1024 * 1024))} MB`, 'DEBUG');
log(`Free memory: ${Math.round(os.freemem() / (1024 * 1024))} MB`, 'DEBUG');
log(`Current working directory: ${process.cwd()}`, 'DEBUG');
writeLog('Server started with debug logging');

// Create missing vector icons directories to prevent crashes
function fixVectorIcons() {
  log('Creating vector icons directories...', 'DEBUG');
  // Standard node_modules path
  const iconFontPaths = [
    path.join(__dirname, 'expo-app', 'node_modules', '@expo', 'vector-icons', 'build', 'vendor', 'react-native-vector-icons', 'Fonts'),
    path.join(__dirname, 'node_modules', '@expo', 'vector-icons', 'build', 'vendor', 'react-native-vector-icons', 'Fonts')
  ];
  
  iconFontPaths.forEach(dirPath => {
    try {
      if (!fs.existsSync(dirPath)) {
        log(`Creating directory: ${dirPath}`, 'DEBUG');
        fs.mkdirSync(dirPath, { recursive: true });
        log(`Created directory: ${dirPath}`);
      } else {
        log(`Directory already exists: ${dirPath}`, 'DEBUG');
      }
    } catch (err) {
      log(`Error creating ${dirPath}: ${err.message}`, 'ERROR');
      writeLog(`Error creating ${dirPath}: ${err.message}`);
    }
  });
}

// Configuration
const PORT = 3243;  // The port Apache is configured to proxy to
const expoAppDir = path.join(__dirname, 'expo-app');

log(`Configuration: PORT=${PORT}, expoAppDir=${expoAppDir}`, 'DEBUG');
writeLog(`Configuration: PORT=${PORT}, expoAppDir=${expoAppDir}`);

// Startup tracking variables
let serverStarted = false;
let startupTimer = null;
let checkInterval = null;
let restartAttempts = 0;
const MAX_RESTART_ATTEMPTS = 3;

// Run fix-module-error.sh first to fix the minimatch module issue
log('Running fix-module-error.sh...', 'DEBUG');
try {
  const fixScriptPath = path.join(__dirname, 'fix-module-error.sh');
  
  if (fs.existsSync(fixScriptPath)) {
    log(`Found fix script at ${fixScriptPath}`, 'DEBUG');
    log('Executing fix-module-error.sh...', 'DEBUG');
    
    writeLog('Running fix-module-error.sh');
    const output = execSync(`bash ${fixScriptPath}`, { encoding: 'utf8' });
    log('Fix script output: ' + output.substring(0, 1000) + '...', 'DEBUG');
    writeLog('Fix script completed');
    
    log('Fix script completed successfully');
  } else {
    log(`Warning: fix-module-error.sh not found at ${fixScriptPath}`, 'WARN');
    writeLog(`Warning: fix-module-error.sh not found at ${fixScriptPath}`);
  }
} catch (err) {
  log(`Error running fix script: ${err.message}`, 'ERROR');
  log(`Error stack: ${err.stack}`, 'ERROR');
  writeLog(`Error running fix script: ${err.message}\n${err.stack}`);
}

// Ensure the Expo directory exists
if (!fs.existsSync(expoAppDir)) {
  log(`Fatal error: Expo app directory not found at ${expoAppDir}`, 'ERROR');
  writeLog(`Fatal error: Expo app directory not found at ${expoAppDir}`);
  process.exit(1);
} else {
  log(`Found Expo app directory at ${expoAppDir}`, 'DEBUG');
  
  // Check contents of expo app dir
  try {
    const expoAppContents = fs.readdirSync(expoAppDir);
    log(`Expo app directory contents: ${expoAppContents.join(', ')}`, 'DEBUG');
    writeLog(`Expo app directory contents: ${expoAppContents.join(', ')}`);
  } catch (err) {
    log(`Error reading Expo app directory: ${err.message}`, 'ERROR');
  }
  
  // Check if package.json exists
  const packageJsonPath = path.join(expoAppDir, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    log('Found package.json in Expo app directory', 'DEBUG');
    
    try {
      const packageJson = require(packageJsonPath);
      log(`package.json name: ${packageJson.name}`, 'DEBUG');
      log(`package.json dependencies: ${Object.keys(packageJson.dependencies).join(', ')}`, 'DEBUG');
    } catch (err) {
      log(`Error reading package.json: ${err.message}`, 'ERROR');
    }
  } else {
    log('Warning: No package.json found in Expo app directory', 'WARN');
  }
}

// Fix vector icons issue
fixVectorIcons();

// Create _node_modules directory for compatibility
const nodeModulesDir = path.join(__dirname, 'expo-app', '_node_modules');
log(`Creating _node_modules directory at ${nodeModulesDir}`, 'DEBUG');

if (!fs.existsSync(nodeModulesDir)) {
  try {
    fs.mkdirSync(nodeModulesDir, { recursive: true });
    log(`Created _node_modules directory: ${nodeModulesDir}`);
    writeLog(`Created _node_modules directory: ${nodeModulesDir}`);

    // Create @expo directory
    const expoDir = path.join(nodeModulesDir, '@expo');
    fs.mkdirSync(expoDir, { recursive: true });
    log(`Created @expo directory: ${expoDir}`, 'DEBUG');
    
    // Create vector-icons/build/vendor/react-native-vector-icons/Fonts directory
    const iconFontsDir = path.join(expoDir, 'vector-icons', 'build', 'vendor', 'react-native-vector-icons', 'Fonts');
    fs.mkdirSync(iconFontsDir, { recursive: true });
    log(`Created vector icons directory: ${iconFontsDir}`);
    writeLog(`Created vector icons directory: ${iconFontsDir}`);
    
    // Create empty font file to prevent crashes
    const missingFontFile = path.join(iconFontsDir, 'MaterialCommunityIcons.ttf');
    fs.writeFileSync(missingFontFile, '');
    log(`Created empty font file: ${missingFontFile}`);
    writeLog(`Created empty font file: ${missingFontFile}`);
    
    // Create empty files for all other common font files
    const fontNames = [
      'AntDesign.ttf',
      'Entypo.ttf',
      'EvilIcons.ttf',
      'Feather.ttf',
      'FontAwesome.ttf',
      'FontAwesome5_Brands.ttf',
      'FontAwesome5_Regular.ttf',
      'FontAwesome5_Solid.ttf',
      'Foundation.ttf',
      'Ionicons.ttf',
      'MaterialIcons.ttf',
      'Octicons.ttf',
      'SimpleLineIcons.ttf',
      'Zocial.ttf'
    ];
    
    for (const fontName of fontNames) {
      const fontPath = path.join(iconFontsDir, fontName);
      fs.writeFileSync(fontPath, '');
      log(`Created empty font file: ${fontPath}`, 'DEBUG');
    }
  } catch (err) {
    log(`Error creating required directories: ${err.message}`, 'ERROR');
    log(`Error stack: ${err.stack}`, 'ERROR');
    writeLog(`Error creating required directories: ${err.message}\n${err.stack}`);
  }
} else {
  log(`_node_modules directory already exists at ${nodeModulesDir}`, 'DEBUG');
}

// Check if server is actually running on the port
function checkServerRunning() {
  return new Promise((resolve) => {
    log(`Checking if server is running on port ${PORT}...`, 'DEBUG');
    const req = http.get(`http://localhost:${PORT}`, (res) => {
      log(`Server responded with status code: ${res.statusCode}`, 'DEBUG');
      if (res.statusCode === 200) {
        serverStarted = true;
        log('✅ Expo server is running and responding on port ' + PORT);
        writeLog('Expo server is running and responding successfully');
        resolve(true);
      } else {
        log(`Server responded with non-200 status code: ${res.statusCode}`, 'WARN');
        writeLog(`Server responded with non-200 status code: ${res.statusCode}`);
        resolve(false);
      }
    });
    
    req.on('error', (err) => {
      log(`❌ Could not connect to server: ${err.message}`, 'ERROR');
      writeLog(`Could not connect to server: ${err.message}`);
      resolve(false);
    });
    
    req.setTimeout(5000, () => {
      req.abort();
      log('❌ Server connection timeout', 'ERROR');
      writeLog('Server connection timeout after 5s');
      resolve(false);
    });
  });
}

// Start Expo
log(`Starting Expo app directly on port ${PORT}...`, 'DEBUG');
writeLog(`Starting Expo app directly on port ${PORT}`);

// Clean up any existing processes
try {
  log('Cleaning up existing Expo processes...', 'DEBUG');
  execSync('pkill -f expo || true', { stdio: 'ignore' });
} catch (err) {
  log('Error during cleanup (can be safely ignored)', 'DEBUG');
}

// Set up environment variables for Expo
const env = {
  ...process.env,
  NODE_ENV: 'development',  // NOTE: Using development to get more detailed error messages
  DEBUG: '*',  // Enable all debug output
  EXPO_DEBUG: 'true',
  CI: 'false',  // Must be 'false' string to be properly parsed as boolean
  BROWSER: 'none',  // Prevent opening browser
  EXPO_WEB_PORT: PORT.toString(),  // Set explicit web port
  PORT: PORT.toString(),  // For Metro
  EXPO_WEBPACK_PUBLIC_PATH: '/',  // Important: set correct public path for bundle assets
  EXPO_NO_FONTS: 'true',  // Skip font loading
  EXPO_USE_VECTOR_ICONS: 'false',  // Skip vector icons
  DANGEROUSLY_DISABLE_HOST_CHECK: 'true',  // Allow external connections
  NODE_OPTIONS: '--max-old-space-size=4096'  // Increase memory limit for Node.js
};

log(`Environment variables: ${JSON.stringify(env, (k, v) => k.startsWith('npm_') ? undefined : v)}`, 'DEBUG');

// Log the exact command we're running
const expoCommand = `npx expo start --web --port ${PORT} --host lan --no-dev`;
log(`Running command: ${expoCommand} in directory ${expoAppDir}`, 'DEBUG');
writeLog(`Running command: ${expoCommand} in directory ${expoAppDir}`);

// Start Expo with web mode on the specified port 
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
  stdio: 'inherit'  // Use inherit to directly show output for easier debugging
});

log(`Started Expo with PID ${expoProcess.pid}`);
writeLog(`Started Expo with PID ${expoProcess.pid}`);

// Check server status periodically
checkInterval = setInterval(async () => {
  const isRunning = await checkServerRunning();
  if (!isRunning && !serverStarted) {
    log('Expo server not responding yet, still waiting...', 'WARN');
    writeLog('Expo server not responding yet');
  }
}, 10000); // Check every 10 seconds

// Set a longer timeout for initial startup
startupTimer = setTimeout(() => {
  if (!serverStarted) {
    log('Expo startup timeout after 60 seconds. Not restarting automatically.', 'ERROR');
    writeLog('Expo startup timeout after 60 seconds');
    // Keep the process running, just log the issue
  }
}, 60000);

// Handle process exit
expoProcess.on('close', (code) => {
  log(`Expo process exited with code ${code}`, 'ERROR');
  writeLog(`Expo process exited with code ${code}`);
  
  // Clean up resources
  if (startupTimer) {
    clearTimeout(startupTimer);
  }
  
  if (checkInterval) {
    clearInterval(checkInterval);
  }
  
  if (serverStarted) {
    // If server was previously running but crashed, restart it
    log('Expo crashed after successful startup. Restarting in 5 seconds...', 'WARN');
    writeLog('Expo crashed after successful startup. Attempting restart.');
    
    setTimeout(() => {
      log('Restarting Expo...', 'DEBUG');
      writeLog('Restarting Expo after crash');
      process.exit(1);  // Exit and let the system restart the process
    }, 5000);
  } else {
    // If server never started successfully, attempt a restart with increasing delay
    restartAttempts++;
    
    if (restartAttempts < MAX_RESTART_ATTEMPTS) {
      const delay = 5000 * Math.pow(2, restartAttempts - 1);  // Exponential backoff
      
      log(`Expo crashed during startup (attempt ${restartAttempts}/${MAX_RESTART_ATTEMPTS}). Will restart in ${delay/1000} seconds...`, 'WARN');
      writeLog(`Expo crashed during startup (attempt ${restartAttempts}/${MAX_RESTART_ATTEMPTS}). Will restart in ${delay/1000} seconds.`);
      
      // Collect system information before restart
      log(`Free memory before restart: ${Math.round(os.freemem() / (1024 * 1024))} MB`, 'DEBUG');
      
      setTimeout(() => {
        log(`Restarting Expo (attempt ${restartAttempts + 1})...`, 'DEBUG');
        writeLog(`Restarting Expo (attempt ${restartAttempts + 1})`);
        process.exit(1);  // Exit and let the system restart the process
      }, delay);
    } else {
      log(`Reached maximum restart attempts (${MAX_RESTART_ATTEMPTS}). Giving up.`, 'ERROR');
      writeLog(`Reached maximum restart attempts (${MAX_RESTART_ATTEMPTS}). Giving up.`);
      
      // Dump extended diagnostics
      try {
        log('Collecting extended diagnostics...', 'DEBUG');
        const nodeModulesPath = path.join(expoAppDir, 'node_modules');
        
        if (fs.existsSync(nodeModulesPath)) {
          log(`node_modules exists at ${nodeModulesPath}`, 'DEBUG');
          
          // Check for critical Expo packages
          const criticalPackages = [
            '@expo/vector-icons',
            'expo',
            'react',
            'react-dom',
            'react-native',
            'react-native-web'
          ];
          
          for (const pkg of criticalPackages) {
            const pkgPath = path.join(nodeModulesPath, pkg);
            if (fs.existsSync(pkgPath)) {
              log(`Found critical package: ${pkg}`, 'DEBUG');
            } else {
              log(`Missing critical package: ${pkg}`, 'ERROR');
            }
          }
        } else {
          log(`node_modules directory missing at ${nodeModulesPath}`, 'ERROR');
        }
      } catch (err) {
        log(`Error during diagnostics: ${err.message}`, 'ERROR');
      }
      
      process.exit(2);  // Exit with a different code to indicate permanent failure
    }
  }
});

// Handle process signals
process.on('SIGINT', () => {
  log('SIGINT received, shutting down...', 'DEBUG');
  writeLog('SIGINT received, shutting down');
  
  // Clean up resources
  if (startupTimer) clearTimeout(startupTimer);
  if (checkInterval) clearInterval(checkInterval);
  
  expoProcess.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  log('SIGTERM received, shutting down...', 'DEBUG');
  writeLog('SIGTERM received, shutting down');
  
  // Clean up resources
  if (startupTimer) clearTimeout(startupTimer);
  if (checkInterval) clearInterval(checkInterval);
  
  expoProcess.kill();
  process.exit(0);
});

// Log all uncaught exceptions
process.on('uncaughtException', (err) => {
  log(`Uncaught exception: ${err.message}`, 'ERROR');
  log(`Stack trace: ${err.stack}`, 'ERROR');
  writeLog(`Uncaught exception: ${err.message}\n${err.stack}`);
});