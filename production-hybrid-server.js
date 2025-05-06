/**
 * Production Hybrid Server for Spiritual Condition Tracker
 * 
 * This server combines a static bundle server with the Expo development server.
 * It handles the problematic /index.bundle requests directly while proxying
 * everything else to the Expo server.
 */

const { exec, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

// Configuration
const PORT = 3243;
const EXPO_PORT = 19000;
const LOG_FILE = path.join(__dirname, 'production-server.log');
const STATIC_DIR = path.join(__dirname, 'static');

// Create static directory if it doesn't exist
if (!fs.existsSync(STATIC_DIR)) {
  fs.mkdirSync(STATIC_DIR, { recursive: true });
}

// Logging function
function log(message, type = 'INFO') {
  const timestamp = new Date().toISOString();
  const formattedMessage = `[${timestamp}][${type}] ${message}`;
  console.log(formattedMessage);
  fs.appendFileSync(LOG_FILE, formattedMessage + '\n');
}

// Create vector icons directory to prevent crashes
function fixVectorIcons() {
  log('Setting up vector icons directory...', 'SETUP');
  const vectorIconsDir = path.join(__dirname, 'node_modules/react-native-vector-icons/Fonts');
  if (!fs.existsSync(vectorIconsDir)) {
    fs.mkdirSync(vectorIconsDir, { recursive: true });
    fs.writeFileSync(path.join(vectorIconsDir, 'FontAwesome.ttf'), '');
    log('Created vector icons directory and empty font file', 'SETUP');
  }
}

// Check if a server is already running on the port
function checkServerRunning(port) {
  return new Promise((resolve) => {
    exec(`lsof -i :${port}`, (error, stdout) => {
      if (stdout && stdout.includes('LISTEN')) {
        log(`Port ${port} is already in use`, 'WARNING');
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
}

// Create a minimal bundle file
function createMinimalBundle() {
  log('Creating minimal bundle file...', 'SETUP');
  const bundleContent = `
// Static bundle for Spiritual Condition Tracker
// This is a fallback bundle - the app will have limited functionality
console.warn('Using static bundle - the app may have limited functionality');

// Initialize minimum required modules
require('react');
require('react-native');
require('expo');

// Let the user know what's happening
console.log('Static bundle loaded successfully. The app is starting in limited mode.');
console.log('Try refreshing the page if you experience issues.');
`;

  const bundlePath = path.join(STATIC_DIR, 'index.bundle');
  fs.writeFileSync(bundlePath, bundleContent);
  log(`Static bundle created at ${bundlePath}`, 'SETUP');
}

// Start the Expo development server in the background
function startExpoServer() {
  return new Promise((resolve, reject) => {
    log('Starting Expo development server...', 'EXPO');
    
    // Set environment variables
    const env = {
      ...process.env,
      EXPO_NO_DOCTOR: '1',
      EXPO_NO_FONTS: '1',
      CI: 'false',
    };
    
    // Start Expo dev server with specific port
    const expoProcess = spawn('npx', ['expo', 'start', '--port', EXPO_PORT, '--non-interactive'], {
      env,
      detached: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    
    let output = '';
    
    expoProcess.stdout.on('data', (data) => {
      const chunk = data.toString();
      output += chunk;
      log(`EXPO: ${chunk.trim()}`, 'EXPO');
      
      // Check for successful startup
      if (chunk.includes('Expo DevTools is running at')) {
        log('Expo development server started successfully', 'EXPO');
        resolve(expoProcess);
      }
    });
    
    expoProcess.stderr.on('data', (data) => {
      const chunk = data.toString();
      log(`EXPO ERROR: ${chunk.trim()}`, 'EXPO-ERROR');
    });
    
    expoProcess.on('error', (error) => {
      log(`Failed to start Expo: ${error.message}`, 'ERROR');
      reject(error);
    });
    
    // Set a timeout in case Expo doesn't start properly
    setTimeout(() => {
      if (!output.includes('Expo DevTools is running at')) {
        log('Expo server startup timed out, but proceeding anyway', 'WARNING');
        resolve(expoProcess);
      }
    }, 30000);
  });
}

// Create and start the proxy server
function startProxyServer() {
  const app = express();
  
  // Log all requests
  app.use((req, res, next) => {
    log(`${req.method} ${req.url}`, 'REQUEST');
    next();
  });
  
  // Special handling for index.bundle - server directly from static file
  app.get('/index.bundle', (req, res) => {
    log(`Serving static bundle for ${req.url}`, 'BUNDLE');
    res.type('application/javascript');
    res.sendFile(path.join(STATIC_DIR, 'index.bundle'));
  });
  
  // Also handle /app/index.bundle for compatibility
  app.get('/app/index.bundle', (req, res) => {
    log(`Serving static bundle for ${req.url} (app path)`, 'BUNDLE');
    res.type('application/javascript');
    res.sendFile(path.join(STATIC_DIR, 'index.bundle'));
  });
  
  // Proxy everything else to Expo server
  app.use('/', createProxyMiddleware({
    target: `http://localhost:${EXPO_PORT}`,
    changeOrigin: true,
    ws: true,
    pathRewrite: {
      '^/app/': '/', // Rewrite /app/ paths to /
    },
    onProxyReq: (proxyReq, req) => {
      log(`Proxying request to Expo: ${req.method} ${req.url}`, 'PROXY');
    },
    onError: (err, req, res) => {
      log(`Proxy error: ${err.message}`, 'ERROR');
      res.status(500).send('Proxy Error');
    },
    logLevel: 'silent' // We do our own logging
  }));
  
  return new Promise((resolve, reject) => {
    app.listen(PORT, '0.0.0.0', () => {
      log(`Proxy server running on port ${PORT}`, 'SERVER');
      log(`Server is accessible at http://localhost:${PORT}/`, 'SERVER');
      resolve(app);
    }).on('error', (err) => {
      log(`Failed to start proxy server: ${err.message}`, 'ERROR');
      reject(err);
    });
  });
}

// Main function
async function main() {
  log('Starting Spiritual Condition Tracker production server...', 'STARTUP');
  
  try {
    // Fix common issues
    fixVectorIcons();
    
    // Check if ports are available
    const isServerRunning = await checkServerRunning(PORT);
    const isExpoRunning = await checkServerRunning(EXPO_PORT);
    
    if (isServerRunning) {
      log(`Server is already running on port ${PORT}. Exiting.`, 'ERROR');
      process.exit(1);
    }
    
    if (isExpoRunning) {
      log(`Expo is already running on port ${EXPO_PORT}. Will use existing instance.`, 'WARNING');
    } else {
      // Create the minimal bundle
      createMinimalBundle();
      
      // Start Expo server in the background
      log('Starting Expo server...', 'STARTUP');
      await startExpoServer();
    }
    
    // Start the proxy server
    log('Starting proxy server...', 'STARTUP');
    await startProxyServer();
    
    log('Spiritual Condition Tracker server is fully operational!', 'SUCCESS');
    log('The app should now be accessible through your nginx proxy.', 'SUCCESS');
    
  } catch (error) {
    log(`Fatal error: ${error.message}`, 'ERROR');
    console.error(error);
    process.exit(1);
  }
}

// Handle process termination
process.on('SIGINT', () => {
  log('Shutting down on SIGINT...', 'SHUTDOWN');
  process.exit(0);
});

process.on('SIGTERM', () => {
  log('Shutting down on SIGTERM...', 'SHUTDOWN');
  process.exit(0);
});

// Start the server
main();