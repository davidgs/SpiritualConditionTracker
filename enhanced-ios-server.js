/**
 * Simple HTTP server optimized for iOS WebView compatibility
 * Addresses common issues with blank screens in iOS simulators
 */

const http = require('http');
const path = require('path');
const fs = require('fs');
const url = require('url');
const PORT = process.env.PORT || 5000;

// MIME type mapping
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'font/otf'
};

// Function to serve a file with the appropriate MIME type
function serveFile(filePath, res) {
  // Get file extension and corresponding MIME type
  const ext = path.extname(filePath);
  const contentType = mimeTypes[ext] || 'application/octet-stream';
  
  // Read and serve the file
  fs.readFile(filePath, (err, data) => {
    if (err) {
      console.error(`[ enhanced-ios-server.js ] Error reading file ${filePath}:`, err);
      
      // If file not found, return 404
      if (err.code === 'ENOENT') {
        res.writeHead(404);
        res.end('File not found');
        return;
      }
      
      // For other errors, return 500
      res.writeHead(500);
      res.end('Server error');
      return;
    }
    
    // Set iOS-friendly headers
    res.writeHead(200, {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Surrogate-Control': 'no-store'
    });
    
    // Send the file data
    res.end(data);
  });
}
// Create the HTTP server
const server = http.createServer((req, res) => {
  let pathname = url.parse(req.url).pathname;
  
  // Default to index.html for root path
  if (pathname === '/' || pathname === '/index.html') {
    pathname = '/index.html';
  }
  
  // Rewrite paths for iOS compatibility
  if (pathname.startsWith('/app/')) {
    pathname = pathname.replace(/^\/app\//, '/');
    console.log(`iOS path remapping: ${req.url} -> ${pathname}`);
  }
  
  // Determine the file path
  let filePath = path.join(__dirname, pathname);
  
  // Special handling for bundle files - check dist directory first
  if (pathname.endsWith('.bundle.js') || pathname.endsWith('.bundle.js.map')) {
    const distPath = path.join(__dirname, 'dist', pathname);
    if (fs.existsSync(distPath)) {
      filePath = distPath;
    }
  }
  
  // Check if file exists, otherwise serve index.html for SPA routing
  if (!fs.existsSync(filePath)) {
    console.log(`File not found, serving index.html instead of ${pathname}`);
    filePath = path.join(__dirname, 'index.html');
  }
  
  // Serve the appropriate file
  serveFile(filePath, res);
});

// Add file identifiers to console logs
server.on('request', (req, res) => {
  console.log(`[ enhanced-ios-server.js ] ${req.method} ${req.url}`);
});

// Start the server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`[ enhanced-ios-server.js ] Enhanced iOS server running on port ${PORT}`);
  console.log(`[ enhanced-ios-server.js ] App available at http://localhost:${PORT}/`);
});