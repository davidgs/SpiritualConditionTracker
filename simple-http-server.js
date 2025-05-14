/**
 * Simple HTTP server for Spiritual Condition Tracker
 * This server serves the index.html and static files
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// Configuration
const PORT = 5000;

// MIME types for file extensions
const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.ttf': 'font/ttf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.bundle': 'text/javascript'
};

// Function to determine content type based on file extension
function getContentType(filePath) {
  const extname = path.extname(filePath).toLowerCase();
  return MIME_TYPES[extname] || 'application/octet-stream';
}

// Create HTTP server
const server = http.createServer((req, res) => {
  // Parse URL
  const parsedUrl = url.parse(req.url);
  let pathname = parsedUrl.pathname;
  
  console.log(`Request for: ${pathname}`);
  
  // Normalize pathname to find the file
  let filePath;
  if (pathname === '/') {
    filePath = path.join(__dirname, 'index.html');
  } else {
    // Remove leading slash and resolve path
    filePath = path.join(__dirname, pathname.substr(1));
  }
  
  // Check if file exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      // If file not found, serve index.html for SPA routing
      console.log(`File not found: ${filePath}, serving index.html`);
      filePath = path.join(__dirname, 'index.html');
      serveFile(filePath, res);
      return;
    }
    
    // File exists, serve it
    serveFile(filePath, res);
  });
});

// Function to serve a file
function serveFile(filePath, res) {
  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // File not found
        res.writeHead(404);
        res.end('File not found');
      } else {
        // Server error
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`);
      }
      return;
    }
    
    // Success - send file
    const contentType = getContentType(filePath);
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content, 'utf-8');
  });
}

// Start the server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT}/`);
});