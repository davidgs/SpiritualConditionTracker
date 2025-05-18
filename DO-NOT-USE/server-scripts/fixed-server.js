/**
 * Simple HTTP server for Spiritual Condition Tracker app
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 5003;

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
  
  // Set no-cache headers
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
  // Handle root path
  if (url === '/' || url === '') {
    fs.readFile(path.join(__dirname, 'app/landing-page.html'), (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end('Landing page not found.');
        return;
      }
      
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
    return;
  }
  
  // Handle /app route
  if (url === '/app' || url === '/app/') {
    fs.readFile(path.join(__dirname, 'app/index.html'), (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end('App not found.');
        return;
      }
      
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
    return;
  }
  
  // Handle all static files
  const filePath = path.join(__dirname, url);
  
  fs.readFile(filePath, (err, data) => {
    if (err) {
      // Try to serve app/index.html for client routing
      if (url.startsWith('/app/') && !url.match(/\.(js|css|png|jpg|gif|svg|ico|ttf|woff|woff2)$/)) {
        fs.readFile(path.join(__dirname, 'app/index.html'), (err, data) => {
          if (err) {
            res.writeHead(404);
            res.end('Not found');
            return;
          }
          
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(data);
        });
        return;
      }
      
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    
    // Determine content type
    const extname = path.extname(filePath);
    const contentType = contentTypes[extname] || 'application/octet-stream';
    
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

// Start the server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Fixed server running at http://localhost:${PORT}/`);
  console.log(`App available at http://localhost:${PORT}/app`);
});