/**
 * Enhanced production server with bundle error handling
 * Designed to fix the 500 error on direct bundle requests
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { startAsync } = require('@expo/cli');
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

// Configure paths
const LOG_DIR = path.join(__dirname, 'logs');
const LOG_FILE = path.join(LOG_DIR, 'production-server.log');
const SERVER_PORT = 3243;

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
    exec(`lsof -i :${SERVER_PORT}`, (error, stdout) => {
      if (stdout && stdout.includes('LISTEN')) {
        log(`Server is already running on port ${SERVER_PORT}`, 'WARNING');
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
}

// Create a direct bundle handler server that will proxy requests to Expo
// but handle special cases like the bundle request
function createBundleServer() {
  const app = express();

  // Log all requests for debugging
  app.use((req, res, next) => {
    log(`${req.method} ${req.url}`, 'DEBUG');
    next();
  });

  // Special handling for bundle requests
  app.get('/index.bundle', (req, res) => {
    log(`Handling special bundle request: ${req.url}`, 'INFO');
    
    // Send bundle from the static directory if available, otherwise proxy to Expo
    const staticBundlePath = path.join(__dirname, 'static-bundles', 'index.bundle');
    
    if (fs.existsSync(staticBundlePath)) {
      log('Serving static bundle file', 'DEBUG');
      res.setHeader('Content-Type', 'application/javascript');
      fs.createReadStream(staticBundlePath).pipe(res);
    } else {
      log('No static bundle found, creating proxy to Expo', 'DEBUG');
      
      // Create a one-time proxy for this specific request
      const bundleProxy = createProxyMiddleware({
        target: 'http://localhost:19000', // Expo's internal dev server port
        changeOrigin: true,
        pathRewrite: {
          '^/index.bundle': '/index.bundle', // Keep the path as is
        },
        onProxyReq: (proxyReq, req) => {
          log('Proxying bundle request to Expo server', 'DEBUG');
          // Add any needed headers
          proxyReq.setHeader('Accept', 'application/javascript');
        },
        onProxyRes: (proxyRes, req, res) => {
          log(`Bundle proxy response status: ${proxyRes.statusCode}`, 'DEBUG');
          
          // Force JavaScript MIME type
          proxyRes.headers['content-type'] = 'application/javascript';
          
          // If Expo returns an error, create a simple bundle
          if (proxyRes.statusCode >= 400) {
            log('Expo returned an error for bundle, sending fallback', 'WARNING');
            proxyRes.statusCode = 200;
            
            // Create a simple JS bundle as fallback
            const fallbackBundle = `
              // Fallback bundle - Expo server had issues generating the real bundle
              console.warn('Using fallback bundle - reload the page to try again');
              require('@expo/cli');
            `;
            
            // Remove existing response data
            proxyRes.headers['content-length'] = Buffer.byteLength(fallbackBundle);
            res.writeHead(200, {
              'Content-Type': 'application/javascript',
              'Content-Length': Buffer.byteLength(fallbackBundle)
            });
            res.end(fallbackBundle);
          }
        },
        logLevel: 'debug',
        logProvider: () => ({
          log: (msg) => log(msg, 'PROXY'),
          debug: (msg) => log(msg, 'PROXY:DEBUG'),
          info: (msg) => log(msg, 'PROXY:INFO'),
          warn: (msg) => log(msg, 'PROXY:WARN'),
          error: (msg) => log(msg, 'PROXY:ERROR'),
        })
      });
      
      bundleProxy(req, res, (err) => {
        if (err) {
          log(`Bundle proxy error: ${err.message}`, 'ERROR');
          res.status(500).send('Error proxying bundle request');
        }
      });
    }
  });

  // Proxy other requests to Expo server
  app.use('/', createProxyMiddleware({
    target: 'http://localhost:19000', // Expo's internal dev server port
    changeOrigin: true,
    ws: true, // Enable WebSocket proxying
    onProxyReq: (proxyReq, req) => {
      log(`Proxying request: ${req.method} ${req.url}`, 'DEBUG');
    },
    onError: (err, req, res) => {
      log(`Proxy error: ${err.message}`, 'ERROR');
      res.status(500).send('Proxy error');
    },
    logLevel: 'warn'
  }));

  return app;
}

// Main function
async function main() {
  log('Starting enhanced production server with bundle fix...', 'INFO');
  
  try {
    // Fix vector icons to prevent crashes
    fixVectorIcons();
    
    // Check if server is already running
    const isRunning = await checkServerRunning();
    if (isRunning) {
      log(`Terminating: Server already running on port ${SERVER_PORT}`, 'ERROR');
      process.exit(1);
    }
    
    // Set environment variables to prevent issues
    process.env.EXPO_NO_DOCTOR = '1';
    process.env.EXPO_NO_FONTS = '1';
    process.env.CI = 'false';
    
    // Create static-bundles directory
    const staticBundlesDir = path.join(__dirname, 'static-bundles');
    if (!fs.existsSync(staticBundlesDir)) {
      fs.mkdirSync(staticBundlesDir, { recursive: true });
    }
    
    // First start the Expo dev server on default port 19000
    log('Starting Expo development server on port 19000...', 'INFO');
    
    // Start Expo in the background
    const options = {
      dev: true,
      minify: false,
      https: false,
    };
    
    startAsync(options).then(() => {
      log('Expo development server started successfully', 'INFO');
      
      // Now create and start our bundle handler/proxy server
      const app = createBundleServer();
      app.listen(SERVER_PORT, '0.0.0.0', () => {
        log(`Bundle handler server running on port ${SERVER_PORT}`, 'INFO');
        log('Ready to handle requests!', 'SUCCESS');
      });
    }).catch(err => {
      log(`Failed to start Expo server: ${err.message}`, 'ERROR');
      console.error(err);
      process.exit(1);
    });
    
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