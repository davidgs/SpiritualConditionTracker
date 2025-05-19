/**
 * Root directory server for iOS compatibility
 * Serves files from the root directory with correct paths for Capacitor on iOS
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 5001;

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

// Helper function to serve files
function serveFile(filePath, res) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      console.error(`[ root-server.js ] Error serving file ${filePath}: ${err.message}`);
      res.writeHead(404);
      res.end(`File not found: ${filePath}`);
      return;
    }
    
    // Determine content type based on file extension
    const ext = path.extname(filePath);
    const contentType = contentTypes[ext] || 'application/octet-stream';
    
    // Send file
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
}

// Create server
const server = http.createServer((req, res) => {
  console.log(`[ root-server.js ] ${new Date().toISOString()} - ${req.method} ${req.url}`);
  
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
  
  // Get URL and remove any query parameters
  let url = req.url.split('?')[0];
  
  // Handle capacitor URLs
  if (url.includes('capacitor://localhost/')) {
    const capacitorPath = url.split('capacitor://localhost/')[1];
    url = '/' + capacitorPath;
  }
  
  // Root redirects to index.html
  if (url === '/' || url === '') {
    serveFile('./index.html', res);
    return;
  }
  
  // Handle /app/ paths for backwards compatibility
  if (url.startsWith('/app/')) {
    // Map /app/dist/ to /dist/ for backwards compatibility
    if (url.startsWith('/app/dist/')) {
      url = url.replace('/app/dist/', '/dist/');
    } else {
      url = url.substring(4); // Remove /app prefix
    }
    console.log(`[ root-server.js ] Remapped /app/ path to: ${url}`);
  }
  
  // Handle direct file access by removing leading slash
  if (url.startsWith('/')) {
    url = url.substring(1);
  }
  
  // Check if file exists
  const filePath = path.join(__dirname, url);
  
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      // File doesn't exist
      if (!url.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|json)$/)) {
        // For non-resource files, serve index.html for client-side routing
        serveFile('./index.html', res);
      } else {
        // For missing resource files, return 404
        res.writeHead(404);
        res.end(`File not found: ${url}`);
      }
    } else {
      // File exists, serve it
      serveFile(filePath, res);
    }
  });
});

// Start server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`[ root-server.js ] Root directory server running on port ${PORT}`);
  console.log(`[ root-server.js ] App available at http://localhost:${PORT}/`);
});