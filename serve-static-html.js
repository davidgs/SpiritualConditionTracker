/**
 * Simple static HTML server
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 5173;

const server = http.createServer((req, res) => {
  const filePath = path.join(__dirname, 'simple-web-app.html');
  
  // Read and serve the HTML file
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500);
      res.end(`Error loading file: ${err.code}`);
      return;
    }
    
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(content, 'utf-8');
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});