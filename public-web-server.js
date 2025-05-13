const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 5001;
const WEB_BUILD_DIR = path.join(__dirname, 'web-build');

// MIME types for different file extensions
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
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'font/otf'
};

// Create the server
const server = http.createServer((req, res) => {
  console.log(`Received request for: ${req.url}`);
  
  // Get the file path
  let filePath = path.join(WEB_BUILD_DIR, req.url === '/' ? 'index.html' : req.url);
  
  // If the file doesn't exist or is a directory, serve index.html
  try {
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      filePath = path.join(WEB_BUILD_DIR, 'index.html');
    }
  } catch (err) {
    // File doesn't exist, serve index.html
    filePath = path.join(WEB_BUILD_DIR, 'index.html');
  }
  
  // Get the file extension
  const extname = path.extname(filePath);
  const contentType = MIME_TYPES[extname] || 'application/octet-stream';
  
  // Read the file
  fs.readFile(filePath, (err, content) => {
    if (err) {
      // If the file cannot be read for any reason, serve index.html
      fs.readFile(path.join(WEB_BUILD_DIR, 'index.html'), (err, content) => {
        if (err) {
          res.writeHead(500);
          res.end('Error loading index.html');
          return;
        }
        
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(content, 'utf-8');
      });
      return;
    }
    
    // Success - serve the file
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content, 'utf-8');
  });
});

// Start the server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
  console.log(`Serving files from: ${WEB_BUILD_DIR}`);
});