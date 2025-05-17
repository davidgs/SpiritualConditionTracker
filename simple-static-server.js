const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 5001; // Using a different port to avoid conflicts

// Create simple static file server
const server = http.createServer((req, res) => {
  // Log request
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  
  // Get URL path
  let url = req.url;
  
  // Default to index.html for root
  if (url === '/' || url === '') {
    url = '/app/index.html';
  }
  // Serve app at /app route
  else if (url === '/app') {
    url = '/app/index.html';
  }
  
  // Determine the file path
  const filePath = path.join(__dirname, url);
  
  // Check if file exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      // File not found
      res.writeHead(404);
      res.end(`File not found: ${url}`);
      return;
    }
    
    // Determine content type based on file extension
    const extname = path.extname(filePath);
    let contentType = 'text/html';
    
    switch (extname) {
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
    
    // Read and serve the file
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end(`Server Error: ${err.message}`);
        return;
      }
      
      // Set headers and respond with file content
      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      });
      res.end(data);
    });
  });
});

// Start the server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Simple Static File Server running at http://localhost:${PORT}/`);
  console.log(`App available at http://localhost:${PORT}/app`);
});