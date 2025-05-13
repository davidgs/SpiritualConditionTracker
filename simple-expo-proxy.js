const http = require('http');
const httpProxy = require('http-proxy');

// Create a proxy server
const proxy = httpProxy.createProxy({
  target: 'http://localhost:3243',
  ws: true
});

// Create the server that uses the proxy
const server = http.createServer((req, res) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  
  // Forward the request to the target
  proxy.web(req, res, {}, (err) => {
    if (err) {
      console.error('Proxy error:', err);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Proxy error connecting to Expo server');
    }
  });
});

// Listen for the `upgrade` event and proxy websockets
server.on('upgrade', (req, socket, head) => {
  console.log(`[${new Date().toLocaleTimeString()}] Websocket upgrade: ${req.url}`);
  proxy.ws(req, socket, head);
});

// Start the server
const PORT = 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Expo Proxy Server running on http://0.0.0.0:${PORT}`);
  console.log(`Proxying requests to Expo server at http://localhost:3243`);
});