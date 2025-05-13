/**
 * Ultra-simple status server using only built-in Node.js modules
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

// Configuration
const PORT = 4000;

// Create a simple HTTP server
const server = http.createServer((req, res) => {
  console.log(`Request: ${req.method} ${req.url}`);
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    // Handle preflight requests
    res.writeHead(204);
    res.end();
    return;
  }
  
  // Route handling
  if (req.url === '/' || req.url === '/index.html') {
    // Serve the status HTML page
    const filePath = path.join(__dirname, 'app-status.html');
    
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end(`Error loading app-status.html: ${err.message}`);
        return;
      }
      
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
  } else if (req.url === '/version-injector.js') {
    // Serve the version-injector.js file
    const filePath = path.join(__dirname, 'web', 'version-injector.js');
    
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end(`Version injector file not found: ${err.message}`);
        return;
      }
      
      res.writeHead(200, { 
        'Content-Type': 'application/javascript',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Surrogate-Control': 'no-store'
      });
      res.end(data);
    });
  } else {
    // Not found
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  }
});

// Start server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Status check server running on http://0.0.0.0:${PORT}`);
  console.log(`Access the status page at http://0.0.0.0:${PORT}/`);
});