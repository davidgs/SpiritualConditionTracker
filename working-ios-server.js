/**
 * Working HTTP server for iOS compatibility
 * Uses absolute file paths to ensure proper file resolution
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 5001;
const APP_DIR = path.join(__dirname, 'app');

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

// Helper function to serve a file
function serveFile(filePath, res) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      console.log(`Error reading file ${filePath}: ${err.message}`);
      res.writeHead(404);
      res.end(`File not found: ${filePath}`);
      return;
    }
    
    // Get the file extension to set the correct content type
    const ext = path.extname(filePath);
    const contentType = contentTypes[ext] || 'application/octet-stream';
    
    // Send the file
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
}

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
  
  // Get the URL and remove any query parameters
  let url = req.url.split('?')[0];
  
  // Redirect root to app
  if (url === '/' || url === '') {
    res.writeHead(302, { 'Location': '/app' });
    res.end();
    return;
  }
  
  // Handle the main app route
  if (url === '/app' || url === '/app/') {
    serveFile(path.join(APP_DIR, 'index.html'), res);
    return;
  }
  
  // Handle direct Capacitor URLs
  if (url.includes('capacitor://localhost/')) {
    // Extract the actual path from the Capacitor URL
    const capacitorPath = url.split('capacitor://localhost/')[1];
    url = '/' + capacitorPath;
  }
  
  // Handle direct file access
  if (url === '/sqliteLoader.js') {
    serveFile(path.join(APP_DIR, 'sqliteLoader.js'), res);
    return;
  }
  
  if (url === '/logo.jpg') {
    serveFile(path.join(__dirname, 'logo.jpg'), res);
    return;
  }
  
  // Handle app files
  if (url.startsWith('/app/')) {
    const filePath = path.join(__dirname, url);
    serveFile(filePath, res);
    return;
  }
  
  // Handle dist files directly
  if (url.startsWith('/dist/')) {
    const filePath = path.join(APP_DIR, url);
    serveFile(filePath, res);
    return;
  }
  
  // Handle src files directly
  if (url.startsWith('/src/')) {
    const filePath = path.join(APP_DIR, url);
    serveFile(filePath, res);
    return;
  }
  
  // Handle dist bundle files
  if (url.includes('.bundle.js')) {
    const bundleFile = path.basename(url);
    const filePath = path.join(APP_DIR, 'dist', bundleFile);
    
    if (fs.existsSync(filePath)) {
      serveFile(filePath, res);
      return;
    }
  }
  
  // For any other route, try to serve it directly from the app directory
  const filePath = path.join(__dirname, url.substring(1));
  
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      // File doesn't exist, so let's see if it's a client route
      if (!url.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico)$/)) {
        // For client routes, serve the app's index.html
        serveFile(path.join(APP_DIR, 'index.html'), res);
      } else {
        // For assets, return 404
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
  console.log(`Working iOS server running on port ${PORT}`);
  console.log(`App available at http://localhost:${PORT}/app`);
});