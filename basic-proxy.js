/**
 * Basic Express server for Spiritual Condition Tracker
 * This server just serves static files and proxies Expo requests
 */

const express = require('express');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');
const fs = require('fs');

// Configuration
const PORT = 5005;
const EXPO_PORT = 3243;

// Create Express app
const app = express();

// Serve static files from web directory
app.use(express.static(path.join(__dirname, 'web')));

// Proxy all requests to Expo
app.use('/', createProxyMiddleware({
  target: `http://localhost:${EXPO_PORT}`,
  changeOrigin: true,
  ws: true,
  pathRewrite: {
    '^/app': '/'
  },
  onProxyReq: (proxyReq, req, res) => {
    // Log all requests
    console.log(`Proxying ${req.method} ${req.url} to Expo`);
  }
}));

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Proxy server running on http://0.0.0.0:${PORT}`);
  console.log(`Forwarding to Expo at http://localhost:${EXPO_PORT}`);
});