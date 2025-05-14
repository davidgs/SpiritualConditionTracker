/**
 * Simple server for Spiritual Condition Tracker
 * Serves landing page at / and static app at /app
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 5000;

// Create the server
const server = http.createServer((req, res) => {
  console.log(`Received request for: ${req.url}`);
  
  // Serve landing page at root
  if (req.url === '/' || req.url === '') {
    console.log('Serving landing page');
    
    // Read the landing page
    const landingPagePath = path.join(__dirname, 'landing-page.html');
    fs.readFile(landingPagePath, (err, content) => {
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
  
  // Serve the app at /app
  if (req.url === '/app' || req.url === '/app/') {
    console.log('Serving app page');
    
    // Read the app index.html
    const appIndexPath = path.join(__dirname, 'static-bundle', 'index.html');
    fs.readFile(appIndexPath, (err, content) => {
      if (err) {
        console.error(`Error reading app index: ${err.message}`);
        res.writeHead(500);
        res.end('Error loading app');
        return;
      }
      
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(content);
    });
    return;
  }
  
  // Handle static files for the app
  if (req.url.startsWith('/app/')) {
    const filePath = req.url.substring(5); // Remove '/app/' prefix
    const staticPath = path.join(__dirname, 'static-bundle', filePath);
    
    console.log(`Serving static file: ${staticPath}`);
    
    // Check if the file exists
    fs.access(staticPath, fs.constants.F_OK, (err) => {
      if (err) {
        console.error(`File not found: ${staticPath}`);
        res.writeHead(404);
        res.end('File not found');
        return;
      }
      
      // Read and serve the file
      fs.readFile(staticPath, (err, content) => {
        if (err) {
          console.error(`Error reading file: ${err.message}`);
          res.writeHead(500);
          res.end('Error reading file');
          return;
        }
        
        // Set the appropriate content type
        const ext = path.extname(staticPath);
        let contentType = 'text/plain';
        
        switch (ext) {
          case '.html':
            contentType = 'text/html';
            break;
          case '.js':
            contentType = 'application/javascript';
            break;
          case '.css':
            contentType = 'text/css';
            break;
          case '.json':
            contentType = 'application/json';
            break;
          case '.png':
            contentType = 'image/png';
            break;
          case '.jpg':
          case '.jpeg':
            contentType = 'image/jpeg';
            break;
          case '.svg':
            contentType = 'image/svg+xml';
            break;
        }
        
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
      });
    });
    return;
  }
  
  // Handle static image files at the root level
  if (req.url.endsWith('.jpg') || req.url.endsWith('.png') || 
      req.url.endsWith('.svg') || req.url.endsWith('.ico')) {
    const staticPath = path.join(__dirname, req.url);
    
    console.log(`Serving root static file: ${staticPath}`);
    
    // Check if the file exists
    fs.access(staticPath, fs.constants.F_OK, (err) => {
      if (err) {
        console.error(`File not found: ${staticPath}`);
        res.writeHead(404);
        res.end('File not found');
        return;
      }
      
      // Read and serve the file
      fs.readFile(staticPath, (err, content) => {
        if (err) {
          console.error(`Error reading file: ${err.message}`);
          res.writeHead(500);
          res.end('Error reading file');
          return;
        }
        
        // Set the appropriate content type
        const ext = path.extname(staticPath);
        let contentType = 'image/jpeg'; // Default
        
        if (ext === '.png') contentType = 'image/png';
        if (ext === '.svg') contentType = 'image/svg+xml';
        if (ext === '.ico') contentType = 'image/x-icon';
        
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
      });
    });
    return;
  }
  
  // Default 404 response
  console.log(`Unknown route: ${req.url}`);
  res.writeHead(404);
  res.end('Not found');
});

// Start the server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Landing page available at http://localhost:${PORT}/`);
  console.log(`Application available at http://localhost:${PORT}/app/`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  server.close(() => {
    console.log('Server stopped');
    process.exit(0);
  });
});