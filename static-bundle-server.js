/**
 * Static bundle server for Expo
 * This script creates a simple Express server to serve a static bundle
 * and proxy other requests to the Expo server
 */

const express = require('express');
const fs = require('fs');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');

// Configuration
const PORT = 3243;
const EXPO_SERVER = 'http://localhost:19000';
const STATIC_DIR = path.join(__dirname, 'static');

// Create static directory if it doesn't exist
if (!fs.existsSync(STATIC_DIR)) {
  fs.mkdirSync(STATIC_DIR, { recursive: true });
}

// Create a minimal bundle file
const minimalBundle = `
// Static minimal bundle for Spiritual Condition Tracker
console.log('Loading static bundle...');

// Initialize essential React Native modules
require('react-native');
require('react');
require('expo');

// Simple placeholder for when the dynamic bundle fails
console.warn('Using static bundle - this is a fallback for when the dynamic bundle fails');
console.warn('The app may not function fully - try refreshing');
`;

// Write the minimal bundle to disk
const bundlePath = path.join(STATIC_DIR, 'index.bundle');
fs.writeFileSync(bundlePath, minimalBundle);

console.log(`Created static bundle at ${bundlePath}`);

// Create the Express app
const app = express();

// Log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Special handling for index.bundle requests
app.get('/index.bundle', (req, res) => {
  console.log('Serving static bundle');
  res.type('application/javascript');
  res.sendFile(bundlePath);
});

// Proxy all other requests to the Expo server
app.use('/', createProxyMiddleware({
  target: EXPO_SERVER,
  changeOrigin: true,
  ws: true,
  onError: (err, req, res) => {
    console.error('Proxy error:', err);
    res.status(500).send('Proxy error');
  }
}));

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Static bundle server running on port ${PORT}`);
  console.log(`Proxying other requests to ${EXPO_SERVER}`);
});