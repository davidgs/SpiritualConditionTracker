/**
 * Expo Proxy Server for Replit
 * This server proxies requests to the Expo dev server and adds the required platform headers
 */

const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { spawn } = require('child_process');
const path = require('path');

// Configuration
const PORT = 5000;
const EXPO_PORT = 19000;

// Create Express server
const app = express();

// Start Expo in a separate process
console.log('Starting Expo development server...');
const expo = spawn('npx', [
  'expo',
  'start',
  '--port', EXPO_PORT.toString(),
  '--host', 'localhost',
  '--no-dev',  // Use production mode for stability
  '--minify'   // Minify for better performance
], {
  stdio: 'inherit',
  env: {
    ...process.env,
    BROWSER: 'none',
    EXPO_NO_DOCTOR: 'true'
  }
});

// Wait for Expo to start before setting up proxy
setTimeout(() => {
  console.log(`Setting up proxy from port ${PORT} to Expo on port ${EXPO_PORT}...`);
  
  // Create proxy middleware
  const expoProxy = createProxyMiddleware({
    target: `http://localhost:${EXPO_PORT}`,
    changeOrigin: true,
    ws: true, // Support WebSockets
    onProxyReq: (proxyReq, req, res) => {
      // Add required headers for Expo
      proxyReq.setHeader('expo-platform', 'web');
      
      // Log the request for debugging
      console.log(`${req.method} ${req.url} -> Adding platform header`);
    },
    onError: (err, req, res) => {
      console.error('Proxy error:', err);
      res.writeHead(500, {
        'Content-Type': 'text/html'
      });
      res.end(`
        <html>
          <body style="font-family: Arial, sans-serif; padding: 20px;">
            <h1 style="color: #d32f2f;">Expo Server Error</h1>
            <p>The Expo development server is not responding. Please check the logs.</p>
            <p>Error details: ${err.message}</p>
          </body>
        </html>
      `);
    }
  });

  // Use the proxy for all requests
  app.use('/', expoProxy);
  
  // Serve a fallback for favicon to prevent errors
  app.get('/favicon.ico', (req, res) => {
    res.status(204).end(); // No content
  });
  
  // Start the server
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Proxy server running at http://localhost:${PORT}`);
    console.log(`Forwarding requests to Expo server at http://localhost:${EXPO_PORT}`);
  });
}, 10000); // Wait 10 seconds for Expo to start

// Handle process termination
process.on('SIGINT', () => {
  console.log('Shutting down...');
  if (expo) {
    expo.kill();
  }
  process.exit(0);
});