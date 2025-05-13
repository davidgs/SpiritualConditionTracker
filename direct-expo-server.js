/**
 * Direct Expo server on port 5000 with header fix
 * This is a minimal wrapper to make the expo-platform header work correctly
 */

const http = require('http');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Configuration for direct access
const PORT = 5000;
const WEBPACK_PORT = 19006;

// Spawn Expo in the background
console.log('Starting Expo bundler in the background...');

// Start Expo web on port 19006
const expo = spawn('npx', [
  'expo',
  'start',
  '--web',
  '--no-dev',
  '--port', '3243', // Use a different port for native, we'll use webpack port
  '--host', '0.0.0.0'
], {
  stdio: 'inherit',
  env: {
    ...process.env,
    BROWSER: 'none',
    CI: '1',
    EXPO_WEB_PORT: WEBPACK_PORT.toString()
  }
});

console.log(`Started Expo on webpack port ${WEBPACK_PORT}`);

// Our proxy server will add the expo-platform header
const server = http.createServer((req, res) => {
  const options = {
    hostname: 'localhost',
    port: WEBPACK_PORT,
    path: req.url,
    method: req.method,
    headers: {
      ...req.headers,
      host: `localhost:${WEBPACK_PORT}`,
      'expo-platform': 'web'  // This is the key header Expo requires
    }
  };

  // Create proxy request
  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    console.error(`Proxy error: ${err.message}`);
    
    if (err.code === 'ECONNREFUSED') {
      // Expo is still starting up
      res.writeHead(503);
      res.end('Expo is starting up, please try again in a moment...');
    } else {
      res.writeHead(500);
      res.end(`Server error: ${err.message}`);
    }
  });

  // Forward POST/PUT body
  if (req.method === 'POST' || req.method === 'PUT') {
    req.pipe(proxyReq);
  } else {
    proxyReq.end();
  }
});

// Listen on port 5000
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Forwarding requests to Expo web on port ${WEBPACK_PORT}`);
});

// Handle cleanup
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  expo.kill();
  server.close();
  process.exit(0);
});