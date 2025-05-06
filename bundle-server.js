/**
 * Minimal Bundle Server for Spiritual Condition Tracker
 * 
 * This server ONLY serves the index.bundle file on port 3243.
 * No proxying, no complex logic - just a simple file server.
 */

const express = require('express');
const fs = require('fs');
const path = require('path');
const http = require('http');

// Configuration
const PORT = 3243;

// Create a simple logger
function log(message) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

// Create the Express app
const app = express();

// Disable unnecessary headers
app.disable('x-powered-by');

// Log all requests
app.use((req, res, next) => {
  log(`${req.method} ${req.url}`);
  next();
});

// Add CORS headers for all responses
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Static bundle content
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

// Serve the bundle for /index.bundle
app.get('/index.bundle', (req, res) => {
  log('Serving bundle for /index.bundle');
  res.set('Content-Type', 'application/javascript');
  res.send(bundleContent);
});

// Serve the bundle for /app/index.bundle as well
app.get('/app/index.bundle', (req, res) => {
  log('Serving bundle for /app/index.bundle');
  res.set('Content-Type', 'application/javascript');
  res.send(bundleContent);
});

// Health check endpoint
app.get('/bundle-status', (req, res) => {
  log('Health check requested');
  res.json({
    status: 'ok',
    message: 'Bundle server is running',
    timestamp: new Date().toISOString()
  });
});

// Fallback for all other routes
app.use((req, res) => {
  log(`Unhandled route: ${req.url}`);
  res.status(404).send('Not Found - Bundle server only serves /index.bundle paths');
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  log(`Bundle server started on port ${PORT}`);
  log(`Ready to serve /index.bundle and /app/index.bundle`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  log('Shutting down server...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  log('Shutting down server...');
  process.exit(0);
});