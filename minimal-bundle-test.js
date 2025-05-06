/**
 * Extremely minimal bundle test server
 * Just serves a static JS file to test if nginx can proxy correctly
 */

const http = require('http');

const PORT = 3243;
const HOST = '0.0.0.0';

// Create a minimal bundle content
const bundleContent = `
// Test bundle
console.log('Successfully loaded test bundle!');
console.log('If you can see this message in your browser console, the nginx proxy is working correctly.');
`;

// Create a simple HTTP server
const server = http.createServer((req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  
  // Handle bundle requests
  if (req.url.startsWith('/index.bundle')) {
    console.log('Serving test bundle');
    res.writeHead(200, {
      'Content-Type': 'application/javascript',
      'Content-Length': Buffer.byteLength(bundleContent)
    });
    res.end(bundleContent);
    return;
  }
  
  // Handle root requests
  if (req.url === '/' || req.url === '/index.html') {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Bundle Test</title>
        </head>
        <body>
          <h1>Bundle Test Server</h1>
          <p>This server is running. Try accessing <a href="/index.bundle">/index.bundle</a></p>
          <script src="/index.bundle"></script>
        </body>
      </html>
    `;
    res.writeHead(200, {
      'Content-Type': 'text/html',
      'Content-Length': Buffer.byteLength(html)
    });
    res.end(html);
    return;
  }
  
  // Handle all other requests
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not found');
});

// Start the server
server.listen(PORT, HOST, () => {
  console.log(`Test server running at http://${HOST}:${PORT}/`);
  console.log('Try accessing /index.bundle to test nginx proxy configuration');
});