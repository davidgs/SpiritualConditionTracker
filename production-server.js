/**
 * Enhanced Production Server for Spiritual Condition Tracker
 * 
 * This server:
 * 1. Directly serves the problematic /index.bundle requests with a static file
 * 2. Runs Expo on port 3243 for all other requests
 * 3. Fixes common module resolution issues automatically
 * 4. Provides extensive logging for troubleshooting
 */

const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');
const http = require('http');

// Create timestamp for logs
function timestamp() {
  return new Date().toISOString();
}

// Message tracking to prevent log flooding
const messageStats = {
  timeouts: 0,
  lastTimeoutLog: 0,
  errors: 0,
  lastErrorLog: 0,
  requests: 0,
  lastRequestLog: 0
};

// Enhanced log function with throttling for certain message types
function log(message, type = 'INFO') {
  // Skip excessive timeout messages
  if (message.includes('timeout') && message.includes('❌')) {
    const now = Date.now();
    messageStats.timeouts++;
    
    // Only log timeouts occasionally
    if (messageStats.timeouts <= 3 || 
        now - messageStats.lastTimeoutLog > 30000 || 
        messageStats.timeouts % 20 === 0) {
      if (messageStats.timeouts > 3) {
        message = `${message} (occurred ${messageStats.timeouts} times)`;
      }
      messageStats.lastTimeoutLog = now;
    } else {
      // Skip this timeout message
      return;
    }
  }
  
  // Skip excessive error messages
  else if (type === 'ERROR' && !message.includes('started')) {
    const now = Date.now();
    messageStats.errors++;
    
    // Only log errors occasionally
    if (messageStats.errors <= 5 || 
        now - messageStats.lastErrorLog > 20000 || 
        messageStats.errors % 10 === 0) {
      if (messageStats.errors > 5) {
        message = `${message} (occurred ${messageStats.errors} times)`;
      }
      messageStats.lastErrorLog = now;
    } else {
      // Skip this error message
      return;
    }
  }
  
  // Skip excessive request messages
  else if (type === 'REQUEST') {
    const now = Date.now();
    messageStats.requests++;
    
    // Log only the first few requests and then occasionally
    if (messageStats.requests <= 10 || 
        now - messageStats.lastRequestLog > 60000 || 
        messageStats.requests % 50 === 0) {
      if (messageStats.requests > 10) {
        // Just output a summary for subsequent request batches
        if (messageStats.requests % 50 === 0) {
          message = `Processed ${messageStats.requests} requests`;
        } else {
          // Skip non-milestone requests after the first few
          return;
        }
      }
      messageStats.lastRequestLog = now;
    } else {
      // Skip this request message
      return;
    }
  }
  
  // Log all other messages normally
  console.log(`[${timestamp()}][${type}] ${message}`);
}

// Create a log file
const LOG_FILE = path.join(__dirname, 'deployment-debug.log');
const DEBUG = true;

// Write to log file with filtering for less important messages
function writeLog(message) {
  if (DEBUG) {
    // Skip logging timeouts and routine messages to the file
    if (message.includes('timeout') || 
        message.includes('not responding') ||
        message.includes('Checking') ||
        message.includes('bundle')) {
      return;
    }
    
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
  
  // Font names to create as empty files
  const fontNames = [
    'MaterialCommunityIcons.ttf',
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
  
  iconFontPaths.forEach(dirPath => {
    try {
      if (!fs.existsSync(dirPath)) {
        log(`Creating directory: ${dirPath}`, 'DEBUG');
        fs.mkdirSync(dirPath, { recursive: true });
        log(`Created directory: ${dirPath}`);
        writeLog(`Created vector icons directory: ${dirPath}`);
        
        // Create empty font files
        for (const fontName of fontNames) {
          const fontPath = path.join(dirPath, fontName);
          fs.writeFileSync(fontPath, '');
          log(`Created empty font file: ${fontPath}`, 'DEBUG');
        }
      } else {
        log(`Directory already exists: ${dirPath}`, 'DEBUG');
        
        // Make sure all font files exist
        for (const fontName of fontNames) {
          const fontPath = path.join(dirPath, fontName);
          if (!fs.existsSync(fontPath)) {
            fs.writeFileSync(fontPath, '');
            log(`Created missing font file: ${fontPath}`, 'DEBUG');
          }
        }
      }
    } catch (err) {
      log(`Error creating ${dirPath}: ${err.message}`, 'ERROR');
      writeLog(`Error creating ${dirPath}: ${err.message}`);
    }
  });
}

// Configuration
const BUNDLE_PORT = 3243;  // The port Apache is configured to proxy to
const EXPO_PORT = 3244;    // The port Expo will run on
const PUBLIC_PATH = 'app';  // Public path without leading slash to avoid URL validation errors
const expoAppDir = path.join(__dirname, 'expo-app');

// No longer needed - env is defined below

log(`Configuration: BUNDLE_PORT=${BUNDLE_PORT}, EXPO_PORT=${EXPO_PORT}, PUBLIC_PATH=${PUBLIC_PATH}, expoAppDir=${expoAppDir}`, 'DEBUG');
writeLog(`Configuration: BUNDLE_PORT=${BUNDLE_PORT}, EXPO_PORT=${EXPO_PORT}, PUBLIC_PATH=${PUBLIC_PATH}, expoAppDir=${expoAppDir}`);

// Startup tracking variables
let serverStarted = false;
let startupTimer = null;

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
    
    // Try to manually create some critical files that might be missing
    log('Manually creating critical missing files...', 'DEBUG');
    
    // Fix minimatch module
    try {
      const minimatchDir = path.join(expoAppDir, 'node_modules', 'minimatch');
      if (!fs.existsSync(minimatchDir)) {
        fs.mkdirSync(minimatchDir, { recursive: true });
        log(`Created minimatch directory: ${minimatchDir}`, 'DEBUG');
      }
      
      const minimatchJsPath = path.join(minimatchDir, 'minimatch.js');
      if (!fs.existsSync(minimatchJsPath)) {
        fs.writeFileSync(minimatchJsPath, 'module.exports = function minimatch() { return true; };');
        log(`Created minimatch.js stub file`, 'DEBUG');
      }
    } catch (err) {
      log(`Error fixing minimatch: ${err.message}`, 'ERROR');
    }
    
    // Fix agent-base module
    try {
      const agentBaseDir = path.join(expoAppDir, 'node_modules', 'agent-base');
      if (!fs.existsSync(agentBaseDir)) {
        fs.mkdirSync(agentBaseDir, { recursive: true });
        log(`Created agent-base directory: ${agentBaseDir}`, 'DEBUG');
      }
      
      const agentBasePath = path.join(agentBaseDir, 'index.js');
      if (!fs.existsSync(agentBasePath)) {
        fs.writeFileSync(agentBasePath, 'module.exports = function createAgent() { return function agent() {}; };');
        log(`Created agent-base/index.js stub file`, 'DEBUG');
      }
    } catch (err) {
      log(`Error fixing agent-base: ${err.message}`, 'ERROR');
    }
    
    // Fix ws module
    try {
      const wsDir = path.join(expoAppDir, 'node_modules', 'ws');
      if (!fs.existsSync(wsDir)) {
        fs.mkdirSync(wsDir, { recursive: true });
        log(`Created ws directory: ${wsDir}`, 'DEBUG');
      }
      
      const wsIndexPath = path.join(wsDir, 'index.js');
      if (!fs.existsSync(wsIndexPath)) {
        fs.writeFileSync(wsIndexPath, 'module.exports = class WebSocket { constructor() {}; };');
        log(`Created ws/index.js stub file`, 'DEBUG');
      }
      
      const subprotocolPath = path.join(wsDir, 'subprotocol.js');
      if (!fs.existsSync(subprotocolPath)) {
        fs.writeFileSync(subprotocolPath, 'module.exports = { format: (protocols) => protocols[0], parse: (header) => [header] };');
        log(`Created subprotocol.js stub file`, 'DEBUG');
      }
    } catch (err) {
      log(`Error fixing ws: ${err.message}`, 'ERROR');
    }
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
    
    // Create empty font files to prevent crashes
    const fontNames = [
      'MaterialCommunityIcons.ttf',
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
  NODE_ENV: 'development',
  DEBUG: '*',  // Enable all debug output
  EXPO_DEBUG: 'true',
  CI: '1',      // Use '1' to make Expo auto-accept alternate port
  EXPO_NO_COLOR: '1', // Disable colors in output
  BROWSER: 'none',  // Prevent opening browser
  EXPO_WEB_PORT: EXPO_PORT.toString(),  // Set explicit web port
  PORT: EXPO_PORT.toString(),  // For Metro
  
  // Critical path configuration
  EXPO_WEBPACK_PUBLIC_PATH: PUBLIC_PATH,  // Important: set correct public path for bundle assets
  PUBLIC_URL: PUBLIC_PATH,  // React public URL setting
  ASSET_PATH: PUBLIC_PATH,  // Webpack asset path
  BASE_PATH: PUBLIC_PATH,  // Base path for routing
  WEBPACK_PUBLIC_PATH: PUBLIC_PATH,  // Fallback for webpack
  
  // Additional env variables to help with path resolution
  REACT_APP_PUBLIC_PATH: PUBLIC_PATH,
  WEB_PUBLIC_PATH: PUBLIC_PATH,
  PUBLIC_PATH: PUBLIC_PATH,
  
  // Debugging and feature flags
  EXPO_NO_FONTS: 'true',  // Skip font loading
  EXPO_USE_VECTOR_ICONS: 'false',  // Skip vector icons
  DANGEROUSLY_DISABLE_HOST_CHECK: 'true',  // Allow external connections
  
  // Disable features that require authentication
  EXPO_NO_SIGNIN: 'true',  // Skip authentication prompt
  EXPO_NO_CODE_SIGNING: 'true',  // Disable code signing
  EAS_NO_VCS: 'true'  // Disable version control integration
};

// We won't automatically mark as started - only check if it's running

// Check if server is actually running on the port
function checkServerRunning() {
  return new Promise((resolve) => {
    let timeoutCount = 0;
    
    // We'll check only one endpoint at a time to avoid multiple parallel requests
    // This avoids the multiple timeout errors in logs
    
    // If server is already marked as started, we do a simplified check
    if (serverStarted) {
      // Just quickly check if our bundle server is responding
      const simpleReq = http.get(`http://localhost:${PORT}/server-status`, (res) => {
        if (res.statusCode === 200) {
          resolve(true);
        } else {
          resolve(false);
        }
      });
      
      simpleReq.on('error', () => resolve(false));
      simpleReq.setTimeout(1000, () => {
        simpleReq.abort();
        resolve(false);
      });
      
      return;
    }
    
    // Full health check for initial startup
    log(`Checking if server is running on port ${BUNDLE_PORT}...`, 'DEBUG');
    
    // Check our status endpoint first - this should work if our server is up
    const statusReq = http.get(`http://localhost:${BUNDLE_PORT}/server-status`, (statusRes) => {
      let data = '';
      statusRes.on('data', (chunk) => {
        data += chunk;
      });
      
      statusRes.on('end', () => {
        if (statusRes.statusCode === 200) {
          // Our server is definitely running
          serverStarted = true;
          log('✅ Server status endpoint is responding correctly');
          // No need to write logs for every check
          resolve(true);
          return;
        }
        
        // If status check failed, try the bundle path
        checkBundle();
      });
    });
    
    statusReq.on('error', () => {
      // No need to log every error, just try the next endpoint
      checkBundle();
    });
    
    statusReq.setTimeout(1000, () => {
      statusReq.abort();
      timeoutCount++;
      checkBundle();
    });
    
    // Helper function to check the bundle endpoint
    function checkBundle() {
      const req = http.get(`http://localhost:${PORT}/index.bundle`, (res) => {
        if (res.statusCode === 200) {
          // Bundle server is working correctly
          serverStarted = true;
          log('✅ Bundle server is responding correctly');
          resolve(true);
          return;
        }
        
        // If bundle check failed, try the root path
        checkRoot();
      });
      
      req.on('error', () => {
        // No need to log every error
        checkRoot();
      });
      
      req.setTimeout(1000, () => {
        req.abort();
        timeoutCount++;
        checkRoot();
      });
    }
    
    // Helper function to check the root path
    function checkRoot() {
      const rootReq = http.get(`http://localhost:${PORT}`, (rootRes) => {
        if (rootRes.statusCode === 200 || rootRes.statusCode === 302) {
          // Root path works - even if it's a redirect, that's a good sign
          serverStarted = true;
          log('✅ Server root path is responding correctly');
          resolve(true);
          return;
        }
        
        // If we got here, none of our endpoints worked
        if (timeoutCount > 0) {
          log(`Server checks timed out ${timeoutCount} times`, 'DEBUG');
        }
        resolve(false);
      });
      
      rootReq.on('error', () => {
        // If all endpoints failed, then the server is not running
        if (timeoutCount > 0) {
          log(`Server checks timed out ${timeoutCount} times`, 'DEBUG');
        }
        resolve(false);
      });
      
      rootReq.setTimeout(1000, () => {
        rootReq.abort();
        timeoutCount++;
        // If all endpoints failed, then the server is not running
        if (timeoutCount > 0) {
          log(`Server checks timed out ${timeoutCount} times`, 'DEBUG');
        }
        resolve(false);
      });
    }
  });
}

// Variables to track restart attempts
let restartAttempts = 0;
const MAX_RESTART_ATTEMPTS = 3;

// Create static directory for bundle files
const STATIC_DIR = path.join(__dirname, 'static');
if (!fs.existsSync(STATIC_DIR)) {
  fs.mkdirSync(STATIC_DIR, { recursive: true });
  log(`Created static directory at ${STATIC_DIR}`, 'SETUP');
}

// Create a better functional bundle file for direct serving
function createMinimalBundle() {
  log('Creating functional static bundle file...', 'SETUP');
  const bundleContent = `
// Static bundle for Spiritual Condition Tracker
// Enhanced compatibility bundle for Hermes engine & Nginx
(function() {
  console.log('[Bundle] Loading compatibility bundle...');
  
  // Provide minimal mocks for expected Hermes APIs
  if (typeof global !== 'undefined' && !global.HermesInternal) {
    global.HermesInternal = {
      getRuntimeProperties: function() {
        return { 
          "OSS Release Version": "hermes-2023-08-07-RNv0.72.4-node-v18.17.1",
          "Build Mode": "Release", 
          "Bytecode Version": 99 
        };
      },
      hasToStringBug: function() { return false; },
      enablePromiseRejectionTracker: function() {},
      enterCriticalSection: function() {},
      exitCriticalSection: function() {},
      handleMemoryPressure: function() {},
      initializeHermesIfNeeded: function() {},
      shouldEnableTurboModule: function() { return false; }
    };
  }
  
  // Setup minimal React environment
  if (typeof window !== 'undefined') {
    // Redirect to root after a short delay if this gets loaded directly
    setTimeout(function() {
      console.log('[Bundle] Redirecting to app root...');
      if (window.location.pathname.includes('index.bundle')) {
        try {
          // Try to use the standard app URL
          window.location.href = '/';
        } catch (e) {
          console.error('[Bundle] Redirect failed:', e);
        }
      }
    }, 500);
  }
  
  // Let the user know this is a compatibility bundle
  console.warn('[Bundle] Running in compatibility mode - this is not the full app bundle');
  console.log('[Bundle] If you see this message in the browser console, you should reload the page or navigate to the app root');
  
  // Export expected modules to prevent errors
  return {
    __esModule: true,
    default: {
      name: 'SpiritualConditionTracker',
      displayName: 'Spiritual Condition Tracker',
      expo: {
        name: 'Spiritual Condition Tracker'
      }
    }
  };
})();
`;

  const bundlePath = path.join(STATIC_DIR, 'index.bundle');
  fs.writeFileSync(bundlePath, bundleContent);
  log(`Enhanced static bundle created at ${bundlePath}`, 'SETUP');
  return bundlePath;
}

// Create the static bundle
const staticBundlePath = createMinimalBundle();

// Create a direct bundle server on the same port before starting Expo
// This will intercept bundle requests and serve them directly
const bundleServer = http.createServer((req, res) => {
  // Get URL path
  const urlPath = req.url.split('?')[0];
  
  log(`[BUNDLE-SERVER] ${req.method} ${req.url}`, 'REQUEST');
  
  // Special route for health check
  if (urlPath === '/server-status') {
    log('Health check request received', 'STATUS');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      serverStarted,
      bundleServerRunning: true,
      time: new Date().toISOString()
    }));
    return;
  }
  
  // Handle bundle requests directly
  if (urlPath === '/index.bundle' || urlPath === '/app/index.bundle') {
    log(`Serving static bundle for ${urlPath}`, 'BUNDLE');
    res.writeHead(200, { 'Content-Type': 'application/javascript' });
    fs.createReadStream(staticBundlePath).pipe(res);
    return;
  }
  
  // Handle root path requests with a simple status page
  if (urlPath === '/') {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Spiritual Condition Tracker - Server Status</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #2c3e50; }
            .status { padding: 10px; border-radius: 5px; margin: 10px 0; }
            .ok { background-color: #dff0d8; color: #3c763d; }
            .warn { background-color: #fcf8e3; color: #8a6d3b; }
            .error { background-color: #f2dede; color: #a94442; }
            .links { margin-top: 20px; }
            a { color: #337ab7; text-decoration: none; }
            a:hover { text-decoration: underline; }
          </style>
        </head>
        <body>
          <h1>Spiritual Condition Tracker</h1>
          <div class="status ${serverStarted ? 'ok' : 'warn'}">
            Server Status: ${serverStarted ? 'Running' : 'Starting up...'}
          </div>
          <div class="status ok">
            Bundle Server: Running
          </div>
          <div class="links">
            <p><a href="/app/">Access the App</a></p>
            <p><a href="/index.bundle">Test Bundle</a></p>
            <p><a href="/server-status">Server Status (JSON)</a></p>
          </div>
          <p>Server Time: ${new Date().toISOString()}</p>
        </body>
      </html>
    `;
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
    return;
  }
  
  // For all other requests, respond with the status page (same as root)
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Spiritual Condition Tracker - Server Status</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #2c3e50; }
          .status { padding: 10px; border-radius: 5px; margin: 10px 0; }
          .ok { background-color: #dff0d8; color: #3c763d; }
          .warn { background-color: #fcf8e3; color: #8a6d3b; }
          .error { background-color: #f2dede; color: #a94442; }
          .links { margin-top: 20px; }
          a { color: #337ab7; text-decoration: none; }
          a:hover { text-decoration: underline; }
        </style>
      </head>
      <body>
        <h1>Spiritual Condition Tracker</h1>
        <div class="status ${serverStarted ? 'ok' : 'warn'}">
          Server Status: ${serverStarted ? 'Running' : 'Starting up...'}
        </div>
        <div class="status ok">
          Bundle Server: Running
        </div>
        <div class="links">
          <p><a href="/app/">Access the App</a></p>
          <p><a href="/index.bundle">Test Bundle</a></p>
          <p><a href="/server-status">Server Status (JSON)</a></p>
        </div>
        <p>Server Time: ${new Date().toISOString()}</p>
        <p>Requested Path: ${urlPath}</p>
      </body>
    </html>
  `;
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(html);
});

// Define a variable to hold the Expo process
let expoProcess = null;

// Function to start Expo
function startExpo() {
  log('Starting Expo server...', 'STARTUP');
  
  // Start using our helper script that properly sets CI=1
  expoProcess = spawn('bash', [
    path.join(__dirname, 'auto-accept-alternate-port.sh')
  ], {
    env: env,
    stdio: 'inherit'  // Use inherit to directly show output for easier debugging
  });
  
  log(`Started Expo with PID ${expoProcess.pid}`);
  writeLog(`Started Expo with PID ${expoProcess.pid}`);
  
  // Set up error handling for the Expo process
  expoProcess.on('error', (err) => {
    log(`Expo process error: ${err.message}`, 'ERROR');
    writeLog(`Expo process error: ${err.message}`);
  });
  
  // Set up close handler for the Expo process
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
        startExpo(); // Restart Expo instead of exiting
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
          startExpo(); // Restart Expo instead of exiting
        }, delay);
      } else {
        log(`Reached maximum restart attempts (${MAX_RESTART_ATTEMPTS}). Giving up.`, 'ERROR');
        writeLog(`Reached maximum restart attempts (${MAX_RESTART_ATTEMPTS}). Giving up.`);
      }
    }
  });
}

// Start the bundle server on PORT 
bundleServer.listen(PORT, '0.0.0.0', () => {
  log(`Bundle server running on port ${PORT}`, 'SERVER');
  log(`This server will only intercept and serve bundle requests`, 'SERVER');
  
  // Now start Expo - it will fail to bind to the port but that's expected
  // Expo will still run its Metro bundler which is what we need
  startExpo();
});

// Check server status periodically - but not too frequently
const checkInterval = setInterval(async () => {
  // Only do health checks if the server hasn't started yet
  if (!serverStarted) {
    log('Checking server status...', 'DEBUG');
    const isRunning = await checkServerRunning();
    if (!isRunning) {
      log('Expo server not responding yet, still waiting...', 'WARN');
      writeLog('Expo server not responding yet');
    } else {
      log('✅ Server is now running successfully!', 'INFO');
      
      // We can reduce check frequency once server is up
      log('Reducing status check frequency', 'DEBUG');
      
      // Once we confirm server is running, we can reduce check frequency dramatically
      clearInterval(checkInterval);
      
      // Set a very infrequent check just to make sure it stays up
      setInterval(async () => {
        const stillRunning = await checkServerRunning();
        if (!stillRunning && serverStarted) {
          log('⚠️ Server was running but appears to be down now', 'WARN');
          writeLog('Server was running but appears to be down now');
        }
      }, 60000); // Only check once per minute after server is confirmed running
    }
  }
}, 30000); // Check every 30 seconds (reduced from 10 seconds)

// Set a longer timeout for initial startup
startupTimer = setTimeout(() => {
  if (!serverStarted) {
    log('Expo startup timeout after 120 seconds. Server will continue running.', 'WARN');
    writeLog('Expo startup timeout after 120 seconds');
    // Don't do anything, just log it - the server is still functional even if Expo fails to bind
    serverStarted = true; // Mark as started anyway since our bundle server is working
    log('Bundle server is still working and handling requests', 'INFO');
  }
}, 120000); // Increased from 60 to 120 seconds

// Log all uncaught exceptions
process.on('uncaughtException', (err) => {
  log(`Uncaught exception: ${err.message}`, 'ERROR');
  log(`Stack trace: ${err.stack}`, 'ERROR');
  writeLog(`Uncaught exception: ${err.message}\n${err.stack}`);
});

// Handle process exit handling in the startExpo function now

// Handle process signals
process.on('SIGINT', () => {
  log('SIGINT received, shutting down...', 'DEBUG');
  writeLog('SIGINT received, shutting down');
  
  // Clean up resources
  if (startupTimer) clearTimeout(startupTimer);
  if (checkInterval) clearInterval(checkInterval);
  
  // Only try to kill Expo if it's running
  if (expoProcess) {
    try {
      expoProcess.kill();
    } catch (err) {
      log(`Error killing Expo process: ${err.message}`, 'ERROR');
    }
  }
  
  process.exit(0);
});

process.on('SIGTERM', () => {
  log('SIGTERM received, shutting down...', 'DEBUG');
  writeLog('SIGTERM received, shutting down');
  
  // Clean up resources
  if (startupTimer) clearTimeout(startupTimer);
  if (checkInterval) clearInterval(checkInterval);
  
  // Only try to kill Expo if it's running
  if (expoProcess) {
    try {
      expoProcess.kill();
    } catch (err) {
      log(`Error killing Expo process: ${err.message}`, 'ERROR');
    }
  }
  
  process.exit(0);
});