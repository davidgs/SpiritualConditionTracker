const http = require('http');

// Create a proxy server
const server = http.createServer((req, res) => {
  const options = {
    hostname: 'localhost',
    port: 3243,
    path: req.url,
    method: req.method,
    headers: req.headers
  };

  console.log(`Proxying request: ${req.method} ${req.url}`);

  // Create request to target server
  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });

  // Handle error
  proxyReq.on('error', (err) => {
    console.error('Proxy error:', err);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Proxy error connecting to Expo server');
  });

  // Pipe original request data to proxy request
  req.pipe(proxyReq);
});

// Start the server
const PORT = 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Simple Expo Proxy Server running on http://0.0.0.0:${PORT}`);
  console.log(`Proxying requests to Expo server at http://localhost:3243`);
});