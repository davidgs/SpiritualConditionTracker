/**
 * HTTP server for Spiritual Condition Tracker app
 * Simplified version to properly serve the app
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 5000;

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
  
  // Set no-cache headers for all responses
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
  // Handle root path - serve landing page
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
  
  // Handle logo file
  if (url === '/logo.jpg') {
    fs.readFile(path.join(__dirname, 'logo.jpg'), (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end('Logo not found.');
        return;
      }
      
      res.writeHead(200, { 'Content-Type': 'image/jpeg' });
      res.end(data);
    });
    return;
  }
  
  // Main app routes
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
  
  // Handle client-side routing
  if (url.startsWith('/app/') && !url.match(/\.(js|css|png|jpg|gif|svg|ttf|woff|woff2|json)$/)) {
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
  
  // Serve static assets
  if (url.startsWith('/app/')) {
    const filePath = path.join(__dirname, url);
    const extname = path.extname(filePath);
    const contentType = contentTypes[extname] || 'application/octet-stream';
    
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end(`File not found: ${url}`);
        return;
      }
      
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    });
    return;
  }
  
  // Any other paths - redirect to app
  res.writeHead(302, { 'Location': '/app' });
  res.end();
});

// Start the server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log(`App available at http://localhost:${PORT}/app`);
  console.log(`Landing page available at http://localhost:${PORT}/`);
});