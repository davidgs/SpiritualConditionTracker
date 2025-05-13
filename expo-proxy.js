const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 5000;

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// Configure proxy middleware to Expo server
const proxyOptions = {
  target: 'http://localhost:3243',
  ws: true, // Enable WebSocket proxying
  changeOrigin: true,
  logLevel: 'debug'
};

// Proxy all requests to the Expo server
app.use('/', createProxyMiddleware(proxyOptions));

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Expo Proxy Server running on http://0.0.0.0:${PORT}`);
  console.log(`Proxying requests to Expo server at http://localhost:3243`);
});