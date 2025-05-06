/**
 * Standalone Bundle Server for Spiritual Condition Tracker
 * 
 * This server completely bypasses Expo's development server and:
 * 1. Serves a static bundle for index.bundle requests
 * 2. Provides static files from the web-build directory
 * 3. Serves a custom index.html that loads the app
 * 
 * No more port conflicts or Expo server issues!
 */

const express = require('express');
const path = require('path');
const fs = require('fs');
const http = require('http');
const { spawn, execSync } = require('child_process');
const cors = require('cors');

// Configuration
const PORT = 3243;
const WEB_BUILD_DIR = path.join(__dirname, 'web-build');
const STATIC_DIR = path.join(__dirname, 'static');
const ASSETS_DIR = path.join(__dirname, 'assets');
const PUBLIC_PATH = ''; // Empty for root serving

// Create log directory if it doesn't exist
const LOG_DIR = path.join(__dirname, 'logs');
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// Setup logging
const LOG_FILE = path.join(LOG_DIR, 'bundle-server.log');
function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  console.log(logMessage);
  fs.appendFileSync(LOG_FILE, logMessage + '\n');
}

// Create the app
const app = express();

// Apply CORS for development
app.use(cors());

// Enable logging
app.use((req, res, next) => {
  log(`${req.method} ${req.url}`);
  next();
});

// Create static directories if they don't exist
if (!fs.existsSync(STATIC_DIR)) {
  fs.mkdirSync(STATIC_DIR, { recursive: true });
  log(`Created static directory at ${STATIC_DIR}`);
}

if (!fs.existsSync(ASSETS_DIR)) {
  fs.mkdirSync(ASSETS_DIR, { recursive: true });
  log(`Created assets directory at ${ASSETS_DIR}`);
}

// Check if web-build exists, if not create a temporary directory
if (!fs.existsSync(WEB_BUILD_DIR)) {
  fs.mkdirSync(WEB_BUILD_DIR, { recursive: true });
  log(`Created web-build directory at ${WEB_BUILD_DIR}`);
  
  // Create a simple index.html if it doesn't exist
  const indexPath = path.join(WEB_BUILD_DIR, 'index.html');
  if (!fs.existsSync(indexPath)) {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Spiritual Condition Tracker</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: sans-serif; margin: 0; padding: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; }
            h1 { margin-bottom: 20px; }
            .message { max-width: 600px; text-align: center; margin-bottom: 30px; line-height: 1.5; }
            .bundle-status { padding: 10px; border-radius: 5px; background-color: #f0f0f0; margin-bottom: 20px; }
            .links { margin-top: 20px; }
            a { color: #0077cc; text-decoration: none; margin: 0 10px; }
            a:hover { text-decoration: underline; }
          </style>
        </head>
        <body>
          <h1>Spiritual Condition Tracker</h1>
          <div class="message">
            <p>The standalone bundle server is running correctly.</p>
            <p>This is a placeholder page since the web-build directory hasn't been created yet.</p>
          </div>
          <div class="bundle-status">
            Bundle Status: Available at <a href="/index.bundle">/index.bundle</a>
          </div>
          <div class="links">
            <a href="/server-status">Server Status</a>
            <a href="/index.bundle">Test Bundle</a>
          </div>
        </body>
      </html>
    `;
    fs.writeFileSync(indexPath, html);
    log(`Created placeholder index.html in ${WEB_BUILD_DIR}`);
  }
}

// Create a better functional bundle file for direct serving
function createMinimalBundle() {
  log('Creating functional static bundle file...');
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
  log(`Enhanced static bundle created at ${bundlePath}`);
  return bundlePath;
}

// Create the static bundle
const staticBundlePath = createMinimalBundle();

// Copy logo to public directory if needed
function ensureLogoExists() {
  const sourceLogoPath = path.join(__dirname, 'logo.jpg');
  const destLogoPath = path.join(WEB_BUILD_DIR, 'logo.jpg');
  
  if (fs.existsSync(sourceLogoPath) && !fs.existsSync(destLogoPath)) {
    try {
      fs.copyFileSync(sourceLogoPath, destLogoPath);
      log('Logo copied to public directory');
    } catch (err) {
      log(`Error copying logo: ${err.message}`);
    }
  }
}

// Handle logo copying
ensureLogoExists();

// Explicitly handle the bundle request
app.get('/index.bundle', (req, res) => {
  log('Serving static bundle for /index.bundle');
  res.header('Content-Type', 'application/javascript');
  fs.createReadStream(staticBundlePath).pipe(res);
});

// Also handle app/index.bundle path
app.get('/app/index.bundle', (req, res) => {
  log('Serving static bundle for /app/index.bundle');
  res.header('Content-Type', 'application/javascript');
  fs.createReadStream(staticBundlePath).pipe(res);
});

// Special route for health check
app.get('/server-status', (req, res) => {
  log('Health check request received');
  res.json({
    status: 'ok',
    serverStarted: true,
    bundleServerRunning: true,
    time: new Date().toISOString()
  });
});

// Serve static files from web-build
app.use(express.static(WEB_BUILD_DIR));

// Fallback for all other routes to index.html (SPA support)
app.get('*', (req, res) => {
  // Skip if request is for a file with extension (e.g. .js, .css)
  if (path.extname(req.path) !== '') {
    log(`File not found: ${req.path}`);
    return res.status(404).send('File not found');
  }

  // Otherwise serve index.html for SPA routing
  log(`Serving index.html for path: ${req.path}`);
  res.sendFile(path.join(WEB_BUILD_DIR, 'index.html'));
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  log(`Standalone bundle server running on port ${PORT}`);
  log(`Access at http://localhost:${PORT}/`);
  log(`Bundle available at http://localhost:${PORT}/index.bundle`);
});

// Handle process termination
process.on('SIGINT', () => {
  log('Shutting down server...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  log('Shutting down server...');
  process.exit(0);
});

// If this is the first time running this file, log a success message
log('=== STANDALONE BUNDLE SERVER STARTED ===');
log(`Using web-build directory: ${WEB_BUILD_DIR}`);
log(`Using static directory: ${STATIC_DIR}`);
log(`Using assets directory: ${ASSETS_DIR}`);