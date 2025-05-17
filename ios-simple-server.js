/**
 * Simple HTTP server optimized for iOS compatibility
 * Serves files with path structures that work with Capacitor on iOS
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Run path patch first
console.log('Running iOS path patch...');
try {
  execSync('node ios-paths-patch.js', { stdio: 'inherit' });
} catch (error) {
  console.error('Error running iOS path patch:', error.message);
}

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

// Create server
const server = http.createServer((req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  
  // No caching headers
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  
  // Handle OPTIONS method for CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  let url = req.url;
  
  // Handle Capacitor URLs
  if (url.includes('capacitor://localhost/')) {
    const capacitorPath = url.split('capacitor://localhost/')[1];
    console.log(`Capacitor request detected, looking for: ${capacitorPath}`);
    
    const filePath = path.join(__dirname, capacitorPath);
    serveFile(filePath, res);
    return;
  }
  
  // Root redirects to app
  if (url === '/' || url === '') {
    res.writeHead(302, { 'Location': '/app' });
    res.end();
    return;
  }
  
  // Serve the app
  if (url === '/app' || url === '/app/') {
    const indexPath = path.join(__dirname, 'app/index.html');
    serveFile(indexPath, res);
    return;
  }
  
  // Serve landing page
  if (url === '/landing') {
    const landingPath = path.join(__dirname, 'app/landing-page.html');
    serveFile(landingPath, res);
    return;
  }
  
  // Serve static files
  if (url.startsWith('/app/')) {
    let filePath;
    
    // Remove /app prefix for consistent path handling
    const relativePath = url.substring(5);
    filePath = path.join(__dirname, 'app', relativePath);
    
    serveFile(filePath, res);
    return;
  }
  
  // Special handling for chunk files in the dist directory
  if (url.includes('.bundle.js')) {
    const chunks = url.split('/');
    const chunkName = chunks[chunks.length - 1];
    const filePath = path.join(__dirname, 'app/dist', chunkName);
    
    serveFile(filePath, res);
    return;
  }
  
  // Fallback to index.html for any other route
  const indexPath = path.join(__dirname, 'app/index.html');
  serveFile(indexPath, res);
});

// Helper function to serve files
function serveFile(filePath, res) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      console.error(`Error reading file ${filePath}:`, err);
      
      // If it's not an asset, serve the index.html file for client-side routing
      if (!filePath.match(/\.(js|css|png|jpg|jpeg|gif|svg|json)$/)) {
        fs.readFile(path.join(__dirname, 'app/index.html'), (indexErr, indexData) => {
          if (indexErr) {
            res.writeHead(500);
            res.end('Error loading application');
            return;
          }
          
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(indexData);
        });
        return;
      }
      
      res.writeHead(404);
      res.end(`File not found: ${filePath}`);
      return;
    }
    
    // Serve the file with the appropriate content type
    const extname = path.extname(filePath);
    const contentType = contentTypes[extname] || 'application/octet-stream';
    
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
}

// Start server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`iOS-optimized simple server running on port ${PORT}`);
  console.log(`App available at http://localhost:${PORT}/app`);
  console.log(`Landing page available at http://localhost:${PORT}/landing`);
});