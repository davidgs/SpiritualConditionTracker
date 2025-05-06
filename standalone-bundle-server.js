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

const fs = require('fs');
const path = require('path');
const http = require('http');
const { execSync } = require('child_process');

// Configuration
const PORT = 3243;
const WEB_BUILD_DIR = path.join(__dirname, 'web-build');
const PUBLIC_DIR = path.join(__dirname, 'public');

// For logging
function log(message) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
}

// Create minimal bundle file if it doesn't exist
function createMinimalBundle() {
  // Path for our simplified bundle
  const simpleBundlePath = path.join(__dirname, 'enhanced-bundle.js');
  const bundleTargetPath = path.join(PUBLIC_DIR, 'index.bundle');
  
  // Make sure the public directory exists
  if (!fs.existsSync(PUBLIC_DIR)) {
    fs.mkdirSync(PUBLIC_DIR, { recursive: true });
    log(`Created public directory: ${PUBLIC_DIR}`);
  }
  
  // Copy our pre-made bundle
  if (fs.existsSync(simpleBundlePath)) {
    fs.copyFileSync(simpleBundlePath, bundleTargetPath);
    log(`Copied simplified bundle to ${bundleTargetPath}`);
  } else {
    log(`WARNING: Simplified bundle not found at ${simpleBundlePath}`);
  }
  
  // Create minimal index.html if it doesn't exist
  const indexPath = path.join(PUBLIC_DIR, 'index.html');
  if (!fs.existsSync(indexPath)) {
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
  <meta name="theme-color" content="#2c365e">
  <title>Spiritual Condition Tracker</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    #root {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
  </style>
</head>
<body>
  <div id="root"></div>
  
  <script src="index.bundle"></script>
  <script>
    // Simple loader for the standalone bundle
    document.addEventListener('DOMContentLoaded', function() {
      if (window.SpiritualConditionTracker) {
        const container = document.getElementById('root');
        window.SpiritualConditionTracker.createApp(container);
        console.log('App initialized with version:', window.SpiritualConditionTracker.version);
      } else {
        console.error('Application bundle not loaded correctly');
        document.getElementById('root').innerHTML = '<div style="color: red; padding: 20px;">Error loading application</div>';
      }
    });
  </script>
</body>
</html>`;
    
    fs.writeFileSync(indexPath, htmlContent);
    log(`Created index.html at ${indexPath}`);
  }
}

// Make sure we have a logo file
function ensureLogoExists() {
  const sourceLogoPath = path.join(__dirname, 'logo.jpg');
  const targetLogoPath = path.join(PUBLIC_DIR, 'logo.jpg');
  
  if (fs.existsSync(sourceLogoPath) && !fs.existsSync(targetLogoPath)) {
    fs.copyFileSync(sourceLogoPath, targetLogoPath);
    log(`Copied logo to ${targetLogoPath}`);
  }
}

// Create the server
log('Starting standalone bundle server...');

// Prepare static files
createMinimalBundle();
ensureLogoExists();

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;
  
  log(`Request: ${pathname}`);
  
  // Set cache-busting headers for all responses
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
  // Handle requests
  if (pathname === '/' || pathname === '/index.html') {
    // Serve the index.html file
    const indexPath = path.join(PUBLIC_DIR, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.setHeader('Content-Type', 'text/html');
      fs.createReadStream(indexPath).pipe(res);
    } else {
      res.statusCode = 404;
      res.end('Index file not found');
    }
  } else if (pathname === '/index.bundle') {
    // Serve the bundle file
    const bundlePath = path.join(PUBLIC_DIR, 'index.bundle');
    if (fs.existsSync(bundlePath)) {
      res.setHeader('Content-Type', 'application/javascript');
      fs.createReadStream(bundlePath).pipe(res);
    } else {
      res.statusCode = 404;
      res.end('Bundle file not found');
    }
  } else if (pathname.startsWith('/assets/')) {
    // Serve static assets
    const assetPath = path.join(PUBLIC_DIR, pathname);
    if (fs.existsSync(assetPath)) {
      // Set content type based on file extension
      const ext = path.extname(assetPath).toLowerCase();
      const contentTypes = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.css': 'text/css',
        '.js': 'application/javascript'
      };
      
      const contentType = contentTypes[ext] || 'application/octet-stream';
      res.setHeader('Content-Type', contentType);
      fs.createReadStream(assetPath).pipe(res);
    } else {
      res.statusCode = 404;
      res.end('Asset not found');
    }
  } else if (pathname === '/logo.jpg') {
    // Serve the logo file
    const logoPath = path.join(PUBLIC_DIR, 'logo.jpg');
    if (fs.existsSync(logoPath)) {
      res.setHeader('Content-Type', 'image/jpeg');
      fs.createReadStream(logoPath).pipe(res);
    } else {
      res.statusCode = 404;
      res.end('Logo not found');
    }
  } else if (pathname === '/version') {
    // Serve version info
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      version: '1.0.2 - May 6, 2025 - STANDALONE BUNDLE',
      server: 'Standalone Bundle Server',
      timestamp: new Date().toISOString()
    }));
  } else {
    // Try to serve from web-build if it exists
    if (fs.existsSync(WEB_BUILD_DIR)) {
      const webBuildPath = path.join(WEB_BUILD_DIR, pathname);
      if (fs.existsSync(webBuildPath) && fs.statSync(webBuildPath).isFile()) {
        // Set content type based on file extension
        const ext = path.extname(webBuildPath).toLowerCase();
        const contentTypes = {
          '.html': 'text/html',
          '.js': 'application/javascript',
          '.css': 'text/css',
          '.json': 'application/json',
          '.jpg': 'image/jpeg',
          '.jpeg': 'image/jpeg',
          '.png': 'image/png',
          '.gif': 'image/gif',
          '.svg': 'image/svg+xml'
        };
        
        const contentType = contentTypes[ext] || 'application/octet-stream';
        res.setHeader('Content-Type', contentType);
        fs.createReadStream(webBuildPath).pipe(res);
        return;
      }
    }
    
    // Fallback - redirect to home
    res.statusCode = 302;
    res.setHeader('Location', '/');
    res.end();
  }
});

// Start server
server.listen(PORT, '0.0.0.0', () => {
  log(`
============================================================
  STANDALONE BUNDLE SERVER RUNNING ON PORT ${PORT}
  
  This server completely bypasses Expo and Metro bundling
  and serves a static version of your app.
  
  Request index.bundle will be served from your static bundle.
  
  Open in your browser:
  http://localhost:${PORT}
============================================================
`);
});