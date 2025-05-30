/**
 * Basic HTTP server for Spiritual Condition Tracker app
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 5000;

// Define content types for different file extensions
const contentTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.ttf': 'font/ttf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

// Create the server
const server = http.createServer((req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  
  // Parse the URL
  let url = req.url;
  
  // Handle root path - serve landing page
  if (url === '/' || url === '') {
    fs.readFile(path.join(__dirname, 'app/landing-page.html'), (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end('Landing page not found.');
        return;
      }
      
      res.writeHead(200, { 'Content-Type': 'text/html', 'Cache-Control': 'no-cache' });
      res.end(data);
    });
    return;
  }
  
  // Route handling
  if (url === '/app' || url.startsWith('/app/')) {
    // Serve the main app
    fs.readFile(path.join(__dirname, 'app/index.html'), (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end('App not found. Make sure to build the app first.');
        return;
      }
      
      res.writeHead(200, { 'Content-Type': 'text/html', 'Cache-Control': 'no-cache' });
      res.end(data);
    });
    return;
  }
  
  // Special route for the SQLite test page
  if (url === '/sqlite-test') {
    fs.readFile(path.join(__dirname, 'app/build/sqlite-test.html'), (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end('SQLite test page not found.');
        return;
      }
      
      res.writeHead(200, { 'Content-Type': 'text/html', 'Cache-Control': 'no-cache' });
      res.end(data);
    });
    return;
  }
  
  // Serve static files from app directories
  if (url.startsWith('/static/')) {
    // Try build directory first, then src
    const buildPath = path.join(__dirname, 'app/build', url);
    const srcPath = path.join(__dirname, 'app/src', url.replace('/static/', '/'));
    
    fs.access(buildPath, fs.constants.F_OK, (err) => {
      if (!err) {
        serveStaticFile(buildPath, res);
      } else {
        serveStaticFile(srcPath, res);
      }
    });
    return;
  }
  
  // Assets for the landing page and app
  if (url.startsWith('/app/assets/')) {
    const assetPath = path.join(__dirname, url);
    serveStaticFile(assetPath, res);
    return;
  }

  // Handle src directory for js files
  if (url.startsWith('/app/src/')) {
    const srcPath = path.join(__dirname, url);
    serveStaticFile(srcPath, res);
    return;
  }
  
  // Serve static files from app/dist directory
  if (url.startsWith('/app/dist/')) {
    const filePath = path.join(__dirname, url);
    serveStaticFile(filePath, res);
    return;
  }
  
  // For any other path, check if it's a file in app directory
  const filePath = path.join(__dirname, url);
  serveStaticFile(filePath, res);
});

// Helper function to serve static files
function serveStaticFile(filePath, res) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      // If file is not found, redirect to app
      res.writeHead(302, { 'Location': '/app' });
      res.end();
      return;
    }
    
    const extname = path.extname(filePath);
    const contentType = contentTypes[extname] || 'application/octet-stream';
    
    res.writeHead(200, { 
      'Content-Type': contentType,
      'Cache-Control': 'no-cache'
    });
    res.end(data);
  });
}

// Start the server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log(`App available at http://localhost:${PORT}/app`);
  console.log(`Landing page available at http://localhost:${PORT}/landing`);
});