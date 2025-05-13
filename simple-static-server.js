// Simple HTTP server without Express
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 5003;
const WEB_BUILD_DIR = path.join(__dirname, 'web-build');

// MIME types for different file extensions
const MIME_TYPES = {
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
  '.txt': 'text/plain'
};

// Create HTTP server
const server = http.createServer((req, res) => {
  console.log(`Request for ${req.url}`);
  
  // Normalize URL path
  let filePath = path.join(WEB_BUILD_DIR, req.url === '/' ? 'index.html' : req.url);
  
  // Check if path exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      // If file not found, serve index.html (for single-page app routing)
      filePath = path.join(WEB_BUILD_DIR, 'index.html');
    }
    
    // Get file extension
    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = MIME_TYPES[extname] || 'application/octet-stream';
    
    // Read file
    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`);
        return;
      }
      
      // Serve file with proper content type
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    });
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`Web build server running at http://localhost:${PORT}`);
  console.log(`Serving files from: ${WEB_BUILD_DIR}`);
});