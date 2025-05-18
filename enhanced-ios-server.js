/**
 * Simple HTTP server optimized for iOS WebView compatibility
 * Addresses common issues with blank screens in iOS simulators
 */

const http = require('http');
const path = require('path');
const fs = require('fs');
const url = require('url');
const PORT = process.env.PORT || 5000;

// MIME type mapping
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'font/otf'
};

// Function to serve a file with the appropriate MIME type
function serveFile(filePath, res) {
  // Get file extension and corresponding MIME type
  const ext = path.extname(filePath);
  const contentType = mimeTypes[ext] || 'application/octet-stream';
  
  // Read and serve the file
  fs.readFile(filePath, (err, data) => {
    if (err) {
      console.error(`Error reading file ${filePath}:`, err);
      
      // If file not found, return 404
      if (err.code === 'ENOENT') {
        res.writeHead(404);
        res.end('File not found');
        return;
      }
      
      // For other errors, return 500
      res.writeHead(500);
      res.end('Server error');
      return;
    }
    
    // Set iOS-friendly headers
    res.writeHead(200, {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Surrogate-Control': 'no-store'
    });
    
    // Send the file data
    res.end(data);
  });
}
    // Set correct MIME types for different file extensions
    // This is crucial for iOS WebViews to properly interpret files
    const ext = path.extname(filePath).toLowerCase();
    switch (ext) {
      case '.js':
        res.setHeader('Content-Type', 'application/javascript');
        break;
      case '.css':
        res.setHeader('Content-Type', 'text/css');
        break;
      case '.json':
        res.setHeader('Content-Type', 'application/json');
        break;
      case '.png':
        res.setHeader('Content-Type', 'image/png');
        break;
      case '.jpg':
      case '.jpeg':
        res.setHeader('Content-Type', 'image/jpeg');
        break;
      case '.svg':
        res.setHeader('Content-Type', 'image/svg+xml');
        break;
      case '.html':
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        break;
    }
  }
}));

// Enhanced path handling for iOS capacitor paths
app.get('/app/*', (req, res) => {
  // Remove the /app prefix and serve from root
  const actualPath = req.path.replace(/^\/app\//, '/');
  console.log(`iOS path remapping: ${req.path} -> ${actualPath}`);
  
  // First try to serve from root
  const filePath = path.join(__dirname, actualPath);
  if (fs.existsSync(filePath)) {
    return res.sendFile(filePath);
  }
  
  // Then try to serve from /dist if root fails
  const distPath = path.join(__dirname, 'dist', actualPath);
  if (fs.existsSync(distPath)) {
    return res.sendFile(distPath);
  }
  
  // Finally fallback to index.html for SPA routing
  console.log(`File not found, serving index.html instead of ${req.path}`);
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Special route for capacitor plugins
app.get('/plugins/*', (req, res) => {
  console.log(`iOS plugin request: ${req.path}`);
  // Capacitor plugins are always served from index.html in our setup
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Default route handler - serves index.html for SPA
app.get('*', (req, res) => {
  console.log(`Serving index.html for path: ${req.path}`);
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Enhanced iOS server running on port ${PORT}`);
  console.log(`App available at http://localhost:${PORT}/`);
});