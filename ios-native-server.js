/**
 * Simple HTTP server optimized for iOS native WebView compatibility
 * No Express dependency, pure Node.js
 */

const http = require('http');
const path = require('path');
const fs = require('fs');
const url = require('url');
const PORT = process.env.PORT || 5002;

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
      console.error(`Error reading file ${filePath}:`, err);
      
      // If file not found, serve index.html for SPA routing
      if (err.code === 'ENOENT') {
        // Try to serve index.html as fallback
        return fs.readFile(path.join(__dirname, 'index.html'), (indexErr, indexData) => {
          if (indexErr) {
            res.writeHead(404);
            res.end('File not found');
            return;
          }
          
          res.writeHead(200, {
            'Content-Type': 'text/html',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'no-cache'
          });
          
          res.end(indexData);
        });
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
      'Cache-Control': 'no-cache'
    });
    
    // Send the file data
    res.end(data);
  });
}

// Create HTTP server
const server = http.createServer((req, res) => {
  // Parse URL to get pathname
  const parsedUrl = url.parse(req.url, true);
  let pathname = parsedUrl.pathname;
  
  // Log request for debugging
  console.log(`${new Date().toISOString()} - ${req.method} ${pathname}`);
  
  // Normalize pathname to handle iOS Capacitor paths
  if (pathname.startsWith('/app/')) {
    // Strip /app/ prefix for iOS Capacitor paths
    pathname = pathname.replace(/^\/app\//, '/');
    console.log(`iOS path remapping: ${req.url} -> ${pathname}`);
  }
  
  // Default to index.html if root path
  if (pathname === '/' || pathname === '') {
    pathname = '/index.html';
  }
  
  // Resolve file path - start with root directory
  let filePath = path.join(__dirname, pathname);
  
  // Check if file exists and serve it
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Try checking in the dist folder if not found in root
      const distPath = path.join(__dirname, 'dist', pathname);
      
      fs.stat(distPath, (distErr, distStats) => {
        if (distErr || !distStats.isFile()) {
          // Finally fallback to index.html for SPA routing
          console.log(`File not found: ${filePath} or ${distPath}, serving index.html`);
          return serveFile(path.join(__dirname, 'index.html'), res);
        }
        
        // Serve file from dist folder
        serveFile(distPath, res);
      });
      return;
    }
    
    // Serve file from root folder
    serveFile(filePath, res);
  });
});

// Start the server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`iOS Native server running on port ${PORT}`);
  console.log(`App available at http://localhost:${PORT}/`);
});