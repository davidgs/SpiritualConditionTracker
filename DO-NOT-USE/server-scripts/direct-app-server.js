/**
 * Direct server for Spiritual Condition Tracker app
 * Serves the app at /app without any unnecessary middleware
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 5005;

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
  
  let url = req.url;
  
  // No caching
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
  // Serve landing page at root
  if (url === '/' || url === '') {
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
  
  // Serve logo file
  if (url === '/logo.jpg') {
    fs.readFile(path.join(__dirname, 'logo.jpg'), (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end('Logo not found');
        return;
      }
      
      res.writeHead(200, { 'Content-Type': 'image/jpeg' });
      res.end(data);
    });
    return;
  }
  
  // Serve the app
  if (url === '/app' || url === '/app/') {
    fs.readFile(path.join(__dirname, 'app/index.html'), (err, data) => {
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
  
  // For app assets, js files, css, etc.
  if (url.startsWith('/app/')) {
    const filePath = path.join(__dirname, url);
    const extname = path.extname(filePath);
    const contentType = contentTypes[extname] || 'application/octet-stream';
    
    fs.readFile(filePath, (err, data) => {
      if (err) {
        // If a file isn't found but it's a client route, serve the app
        if (!url.match(/\.(js|css|png|jpg|jpeg|gif|svg)$/)) {
          fs.readFile(path.join(__dirname, 'app/index.html'), (err2, data2) => {
            if (err2) {
              res.writeHead(500);
              res.end('Error loading app');
              return;
            }
            
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data2);
          });
          return;
        }
        
        res.writeHead(404);
        res.end(`File not found: ${url}`);
        return;
      }
      
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    });
    return;
  }
  
  // Handle any other paths
  res.writeHead(302, { 'Location': '/app' });
  res.end();
});

// Start server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Direct app server running at http://localhost:${PORT}/`);
  console.log(`App available at http://localhost:${PORT}/app`);
});