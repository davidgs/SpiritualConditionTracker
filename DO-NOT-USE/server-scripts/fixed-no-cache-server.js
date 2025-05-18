/**
 * Simple HTTP server for Spiritual Condition Tracker app
 * Fixed version without problematic middleware
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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

// Prepare iOS build files
console.log('Preparing iOS build files...');
try {
  execSync('node prepare-ios-build.js', { stdio: 'inherit' });
  console.log('iOS build preparation completed successfully');
} catch (error) {
  console.error('iOS build preparation failed:', error.message);
}

// Create server
const server = http.createServer((req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  
  let url = req.url;
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  
  // No caching headers
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
  // Handle OPTIONS method for CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // Root redirects to app
  if (url === '/' || url === '') {
    res.writeHead(302, { 'Location': '/app' });
    res.end();
    return;
  }
  
  // Serve the app from the build directory for iOS
  if (url === '/app' || url === '/app/') {
    fs.readFile(path.join(__dirname, 'app/build/index.html'), (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end('Error loading app');
        return;
      }
      
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
    return;
  }
  
  // Serve landing page
  if (url === '/landing') {
    fs.readFile(path.join(__dirname, 'app/landing-page.html'), (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end('Error loading landing page');
        return;
      }
      
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
    return;
  }
  
  // For app routes (non-asset URLs), serve the app HTML
  if (url.startsWith('/app/') && !url.match(/\.(js|css|png|jpg|jpeg|gif|svg|json)$/)) {
    fs.readFile(path.join(__dirname, 'app/build/index.html'), (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end('Error loading app');
        return;
      }
      
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
    return;
  }
  
  // For static assets in /app
  if (url.startsWith('/app/')) {
    // Remove the /app prefix to find files in the build directory
    const assetPath = url.replace(/^\/app\//, '');
    const filePath = path.join(__dirname, 'app/build', assetPath);
    const extname = path.extname(filePath);
    const contentType = contentTypes[extname] || 'application/octet-stream';
    
    fs.readFile(filePath, (err, data) => {
      if (err) {
        console.error(`File not found: ${filePath}`);
        res.writeHead(404);
        res.end(`File not found: ${url}`);
        return;
      }
      
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    });
    return;
  }
  
  // Fallback for any other path - serve landing page
  fs.readFile(path.join(__dirname, 'app/landing-page.html'), (err, data) => {
    if (err) {
      res.writeHead(500);
      res.end('Error loading landing page');
      return;
    }
    
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(data);
  });
});

// Start server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT}/app to access the application`);
  console.log(`Landing page is available at http://localhost:${PORT}/landing`);
});