/**
 * Simple HTTP server for the Spiritual Condition Tracker app
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

// Configuration
const PORT = 5000;
const APP_PATH = './app';

// Content type mapping
const CONTENT_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.ttf': 'font/ttf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

// Create HTTP server
const server = http.createServer((req, res) => {
  // Log request
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);

  // Parse URL
  let url = req.url;
  
  // Set no-cache headers
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  // Handle root path - serve landing page
  if (url === '/' || url === '') {
    serveFile(path.join(APP_PATH, 'landing-page.html'), 'text/html', res);
    return;
  }

  // Handle logo for landing page
  if (url === '/logo.jpg') {
    serveFile('./logo.jpg', 'image/jpeg', res);
    return;
  }

  // Handle /app route - serve the main application
  if (url === '/app' || url === '/app/') {
    serveFile(path.join(APP_PATH, 'index.html'), 'text/html', res);
    return;
  }

  // Handle client-side routing
  if (url.startsWith('/app/') && !url.includes('.')) {
    serveFile(path.join(APP_PATH, 'index.html'), 'text/html', res);
    return;
  }

  // Serve static files
  const filePath = path.join('.', url);
  
  // Determine content type based on file extension
  const extname = path.extname(filePath);
  const contentType = CONTENT_TYPES[extname] || 'application/octet-stream';
  
  serveFile(filePath, contentType, res);
});

// Helper function to serve files
function serveFile(filePath, contentType, res) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      // If file not found, return 404
      res.writeHead(404);
      res.end(`File not found: ${filePath}`);
      return;
    }
    
    // Return file with proper content type
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
}

// Start the server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log(`App available at http://localhost:${PORT}/app`);
});