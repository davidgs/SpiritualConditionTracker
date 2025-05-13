// Ultra-simple server to serve the app in the preview pane
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 5000;
const EXPO_PORT = 19006;

// Helper function to forward requests to the Expo server
function proxyRequest(req, res, targetPath) {
  const options = {
    hostname: 'localhost',
    port: EXPO_PORT,
    path: targetPath || req.url,
    method: req.method,
    headers: {
      ...req.headers,
      host: `localhost:${EXPO_PORT}`,
      'expo-platform': 'web'
    }
  };

  console.log(`Proxying to: http://localhost:${EXPO_PORT}${options.path}`);

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (e) => {
    console.error(`Proxy error: ${e.message}`);
    res.writeHead(500);
    res.end(`Proxy Error: ${e.message}`);
  });

  req.pipe(proxyReq);
}

const server = http.createServer((req, res) => {
  const reqUrl = req.url;
  console.log(`Request for ${reqUrl}`);
  
  // Proxy static JS/CSS from Expo
  if (reqUrl.startsWith('/static/') || 
      reqUrl.startsWith('/_expo/') || 
      reqUrl.includes('bundle')) {
    return proxyRequest(req, res);
  }
  
  // For all other requests, serve our index.html
  const filePath = path.join(__dirname, 'index.html');
  
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500);
      res.end('Error loading index.html');
      return;
    }
    
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(content);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Preview server running at http://localhost:${PORT}`);
  console.log(`Proxying static assets to Expo server at http://localhost:${EXPO_PORT}`);
});