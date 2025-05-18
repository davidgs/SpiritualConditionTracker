/**
 * Fixed HTTP server for iOS compatibility
 * Properly serves static files with correct MIME types
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 5001;

// Define content types
const contentTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml'
};

// Create server
const server = http.createServer((req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  
  // No caching
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
  // Handle OPTIONS method for CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  let url = req.url;
  
  // Normalize URL
  url = url.split('?')[0]; // Remove query parameters
  
  // Serve root or direct to app
  if (url === '/' || url === '') {
    res.writeHead(302, { 'Location': '/app' });
    res.end();
    return;
  }
  
  // Special handling for capacitor URLs
  if (url.includes('capacitor://localhost/')) {
    url = url.replace('capacitor://localhost/', '');
  }
  
  // Handle /app route
  if (url === '/app' || url === '/app/') {
    url = '/app/index.html';
  }
  
  // Handle landing page
  if (url === '/landing') {
    url = '/app/landing-page.html';
  }
  
  // Determine the file path based on the URL
  let filePath;
  
  if (url.startsWith('/app/dist/')) {
    // Direct access to dist files
    const relativePath = url.substring('/app/dist/'.length);
    filePath = path.join(__dirname, 'app', 'dist', relativePath);
  } else if (url.startsWith('/app/')) {
    // App files
    const relativePath = url.substring('/app/'.length);
    filePath = path.join(__dirname, 'app', relativePath);
  } else if (url.startsWith('/dist/')) {
    // Direct dist access
    const relativePath = url.substring('/dist/'.length);
    filePath = path.join(__dirname, 'app', 'dist', relativePath);
  } else {
    // Try to serve from root
    filePath = path.join(__dirname, url.substring(1));
  }
  
  // Check if file exists and serve it
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.log(`File not found: ${filePath}`);
      
      // If not a resource file, serve the app index.html for client-side routing
      if (!url.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|json)$/)) {
        fs.readFile(path.join(__dirname, 'app', 'index.html'), (indexErr, indexData) => {
          if (indexErr) {
            res.writeHead(500);
            res.end('Error loading app');
            return;
          }
          
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(indexData);
        });
      } else {
        // File not found
        res.writeHead(404);
        res.end(`File not found: ${url}`);
      }
      return;
    }
    
    // Read the file
    fs.readFile(filePath, (readErr, data) => {
      if (readErr) {
        res.writeHead(500);
        res.end(`Error reading file: ${readErr.message}`);
        return;
      }
      
      // Determine content type based on file extension
      const extname = path.extname(filePath);
      const contentType = contentTypes[extname] || 'application/octet-stream';
      
      // Send the file
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    });
  });
});

// Start server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Fixed iOS server running on port ${PORT}`);
  console.log(`App available at http://localhost:${PORT}/app`);
});