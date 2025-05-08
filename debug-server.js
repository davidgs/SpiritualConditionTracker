const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 4999;

// Create a simple HTTP server
const server = http.createServer((req, res) => {
  if (req.url === '/' || req.url === '/index.html') {
    // Serve the debug page
    fs.readFile(path.join(__dirname, 'debug-icon-logging.html'), (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end('Error loading debug page');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
  } else {
    // Return 404 for other requests
    res.writeHead(404);
    res.end('Not found');
  }
});

// Start the server
server.listen(PORT, () => {
  console.log(`Debug server running at http://localhost:${PORT}`);
});