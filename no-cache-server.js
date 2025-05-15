const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 5000;

// Create a simple HTTP server with no caching headers
const server = http.createServer((req, res) => {
  console.log(`Request for ${req.url}`);
  
  // Set default content type
  let contentType = 'text/html';
  
  // Add no-cache headers to all responses
  const noCacheHeaders = {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Surrogate-Control': 'no-store'
  };
  
  // Normalize URL to handle both /app and /app/
  const url = req.url === '/app' ? '/app/' : req.url;
  
  // Handle root path - use the original landing page
  if (url === '/') {
    fs.readFile(path.join(__dirname, 'app', 'landing-page.html'), (err, content) => {
      if (err) {
        res.writeHead(500, noCacheHeaders);
        res.end(`Error loading landing page: ${err.code}`);
      } else {
        res.writeHead(200, { 
          'Content-Type': contentType,
          ...noCacheHeaders 
        });
        res.end(content, 'utf-8');
      }
    });
    return;
  }
  
  // Handle app path
  if (url === '/app/') {
    fs.readFile(path.join(__dirname, 'app', 'index.html'), (err, content) => {
      if (err) {
        res.writeHead(500, noCacheHeaders);
        res.end(`Error loading app/index.html: ${err.code}`);
      } else {
        res.writeHead(200, { 
          'Content-Type': contentType,
          ...noCacheHeaders
        });
        res.end(content, 'utf-8');
      }
    });
    return;
  }
  
  // Get the file path
  let filePath;
  
  if (url.startsWith('/app/')) {
    // For app routes, serve from app directory
    filePath = path.join(__dirname, url);
  } else {
    // For other routes, serve from root directory
    filePath = path.join(__dirname, url);
  }
  
  // Get file extension
  const extname = String(path.extname(filePath)).toLowerCase();
  
  // Set content type based on extension
  const contentTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml'
  };
  
  contentType = contentTypes[extname] || 'application/octet-stream';
  
  // Read file
  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        if (url.startsWith('/app/')) {
          // For app routes, fallback to app/index.html for SPA routing
          fs.readFile(path.join(__dirname, 'app', 'index.html'), (err, content) => {
            if (err) {
              res.writeHead(500, noCacheHeaders);
              res.end(`Error loading app/index.html: ${err.code}`);
            } else {
              res.writeHead(200, { 
                'Content-Type': 'text/html',
                ...noCacheHeaders
              });
              res.end(content, 'utf-8');
            }
          });
        } else {
          // For other routes, return 404
          res.writeHead(404, noCacheHeaders);
          res.end('Not Found');
        }
      } else {
        // Server error
        res.writeHead(500, noCacheHeaders);
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      // Success
      res.writeHead(200, { 
        'Content-Type': contentType,
        ...noCacheHeaders
      });
      res.end(content, 'utf-8');
    }
  });
});

// Start server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
  console.log(`App is available at http://0.0.0.0:${PORT}/app`);
  console.log(`Landing page is at http://0.0.0.0:${PORT}/`);
  console.log(`All responses include no-cache headers`);
});