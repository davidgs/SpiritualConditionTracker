/**
 * Enhanced server for Spiritual Condition Tracker
 * Serves the index.html file directly and static assets
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 5000;

// MIME types for different file extensions
const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'font/otf'
};

// Function to get content type based on file extension
function getContentType(filePath) {
  const extname = path.extname(filePath).toLowerCase();
  return MIME_TYPES[extname] || 'application/octet-stream';
}

// Function to serve a file
function serveFile(filePath, res) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // File not found
        console.log(`File not found: ${filePath}`);
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 Not Found</h1><p>The requested file could not be found.</p>');
      } else {
        // Server error
        console.error(`Error reading file: ${err}`);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
      }
      return;
    }
    
    // Determine content type
    const contentType = getContentType(filePath);
    
    // Send response
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
}

// Create HTTP server
const server = http.createServer((req, res) => {
  // Parse URL to get pathname
  const parsedUrl = url.parse(req.url);
  let pathname = parsedUrl.pathname;
  
  console.log(`Request for: ${pathname}`);
  
  // Normalize pathname
  if (pathname === '/' || pathname === '') {
    pathname = '/index.html';
  }
  
  // Map pathname to local file path
  let filePath = path.join(__dirname, pathname.substring(1));
  
  // Check if file exists and serve it
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // File doesn't exist, send index.html for SPA routing
      console.log(`File not found, serving index.html instead: ${filePath}`);
      filePath = path.join(__dirname, 'index.html');
      serveFile(filePath, res);
    } else {
      // File exists, serve it
      serveFile(filePath, res);
    }
  });
});

// Start the server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://localhost:${PORT}`);
});