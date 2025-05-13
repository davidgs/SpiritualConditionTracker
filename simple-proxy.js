/**
 * Ultra-simple proxy for Spiritual Condition Tracker
 * Uses only built-in Node.js modules
 */

const http = require('http');

// Configuration
const PORT = 3000;
const EXPO_PORT = 3243;

console.log(`Starting simple proxy server on port ${PORT}...`);

// Create a simple HTTP server
const server = http.createServer((req, res) => {
  console.log(`Proxying request: ${req.method} ${req.url}`);
  
  // Options for the proxy request
  const options = {
    hostname: 'localhost',
    port: EXPO_PORT,
    path: req.url,
    method: req.method,
    headers: req.headers
  };
  
  // Create a proxy request
  const proxyReq = http.request(options, (proxyRes) => {
    // Copy status code
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    
    // Pipe the response from Expo to the client
    proxyRes.pipe(res, { end: true });
  });
  
  // Handle errors
  proxyReq.on('error', (e) => {
    console.error(`Proxy error: ${e.message}`);
    res.writeHead(502, { 'Content-Type': 'text/plain' });
    res.end(`Proxy error: ${e.message}`);
  });
  
  // Pipe the request body to the proxy request
  req.pipe(proxyReq, { end: true });
});

// Start server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Proxy server running on http://0.0.0.0:${PORT}`);
  console.log(`Forwarding requests to Expo at http://localhost:${EXPO_PORT}`);
});