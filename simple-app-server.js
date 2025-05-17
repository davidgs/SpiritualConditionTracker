/**
 * Simple HTTP server for the Spiritual Condition Tracker app
 * No build required - directly serves from src directory
 */

const http = require('http');
const path = require('path');
const fs = require('fs');

const PORT = process.env.PORT || 5000;

// Define content types for file extensions
const contentTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.ttf': 'font/ttf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

// Create the server
const server = http.createServer((req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  
  // Parse the URL
  let url = req.url;
  
  // Set no-cache headers for all responses
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
  // Handle root path - serve landing page
  if (url === '/' || url === '') {
    serveFile(path.join(__dirname, 'app/landing-page.html'), 'text/html', res);
    return;
  }
  
  // Route handling for app
  if (url === '/app' || url === '/app/') {
    serveFile(path.join(__dirname, 'app/index.html'), 'text/html', res);
    return;
  }
  
  // Handle app bundle
  if (url === '/app/dist/bundle.js') {
    // Check if actual bundle exists
    const bundlePath = path.join(__dirname, 'app/dist/bundle.js');
    const fallbackPath = path.join(__dirname, 'app/src/index.js');
    
    fs.access(bundlePath, fs.constants.F_OK, (err) => {
      if (!err) {
        serveFile(bundlePath, 'application/javascript', res);
      } else {
        serveFile(fallbackPath, 'application/javascript', res);
      }
    });
    return;
  }
  
  // SQLite loader
  if (url === '/app/sqliteLoader.js') {
    serveFile(path.join(__dirname, 'app/sqliteLoader.js'), 'application/javascript', res);
    return;
  }
  
  // Special route for sqlite-test
  if (url === '/sqlite-test') {
    const buildPath = path.join(__dirname, 'app/build/sqlite-test.html');
    
    fs.access(buildPath, fs.constants.F_OK, (err) => {
      if (!err) {
        serveFile(buildPath, 'text/html', res);
      } else {
        // Simple HTML response
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end('<html><body><h1>SQLite Test Page</h1><p>Build the app to see the full test page.</p></body></html>');
      }
    });
    return;
  }
  
  // Handle app/src files (JavaScript, CSS, etc.)
  if (url.startsWith('/app/src/')) {
    const filePath = path.join(__dirname, url);
    serveFileWithType(filePath, res);
    return;
  }
  
  // Handle app/assets
  if (url.startsWith('/app/assets/')) {
    const filePath = path.join(__dirname, url);
    serveFileWithType(filePath, res);
    return;
  }
  
  // Handle other app routes by returning the app shell
  if (url.startsWith('/app/')) {
    serveFile(path.join(__dirname, 'app/index.html'), 'text/html', res);
    return;
  }
  
  // If nothing matches, return 404
  res.writeHead(404);
  res.end('404 Not Found');
});

// Helper function to serve a file with a known content type
function serveFile(filePath, contentType, res) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end(`File not found: ${filePath}`);
      return;
    }
    
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
}

// Helper function to serve a file with content type based on extension
function serveFileWithType(filePath, res) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end(`File not found: ${filePath}`);
      return;
    }
    
    const extname = path.extname(filePath);
    const contentType = contentTypes[extname] || 'application/octet-stream';
    
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
}

// Start the server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Simple app server running at http://localhost:${PORT}/`);
  console.log(`App available at http://localhost:${PORT}/app`);
});