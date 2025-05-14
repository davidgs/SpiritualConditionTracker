/**
 * Simple server for serving the landing page
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

// Configuration
const PORT = 5000;

// Create HTTP server
const server = http.createServer((req, res) => {
  // Serve landing page at root
  if (req.url === '/' || req.url === '') {
    fs.readFile(path.join(__dirname, 'index.html'), (err, content) => {
      if (err) {
        res.writeHead(500);
        res.end('Error loading landing page');
        return;
      }
      
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(content);
    });
    return;
  }
  
  // Serve static assets
  if (req.url.endsWith('.jpg') || req.url.endsWith('.png') || 
      req.url.endsWith('.ico') || req.url.endsWith('.svg')) {
    const filePath = path.join(__dirname, req.url);
    
    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
        res.writeHead(404);
        res.end('File not found');
        return;
      }
      
      fs.readFile(filePath, (err, content) => {
        if (err) {
          res.writeHead(500);
          res.end('Error reading file');
          return;
        }
        
        let contentType = 'application/octet-stream';
        if (req.url.endsWith('.jpg') || req.url.endsWith('.jpeg')) contentType = 'image/jpeg';
        if (req.url.endsWith('.png')) contentType = 'image/png';
        if (req.url.endsWith('.ico')) contentType = 'image/x-icon';
        if (req.url.endsWith('.svg')) contentType = 'image/svg+xml';
        
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
      });
    });
    
    return;
  }
  
  // For all other requests, return a simple 404
  res.writeHead(404);
  res.end('Not Found');
});

// Start the server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Landing page at http://localhost:${PORT}/`);
});