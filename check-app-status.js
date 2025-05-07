/**
 * Simple status check server for Spiritual Condition Tracker
 * 
 * This script:
 * 1. Serves a status page on port 5000
 * 2. Forwards requests to the Expo server on port 3243
 */

const express = require('express');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = 5000;

// Configure a proxy for the Expo app
const proxyOptions = {
  target: 'http://localhost:3243',
  changeOrigin: true,
  ws: true,
  pathRewrite: (path) => path,
  logLevel: 'debug'
};

// Serve our status page
app.get('/status', (req, res) => {
  try {
    const statusHtml = fs.readFileSync(path.join(__dirname, 'app-status.html'), 'utf8');
    res.send(statusHtml);
  } catch (error) {
    res.status(500).send(`Error reading status page: ${error.message}`);
  }
});

// Serve the main index.html
app.get('/', (req, res) => {
  try {
    const indexHtml = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
    res.send(indexHtml);
  } catch (error) {
    res.status(500).send(`Error reading index page: ${error.message}`);
  }
});

// Check if the Expo server is running
app.get('/check-expo', (req, res) => {
  http.get('http://localhost:3243/app', (expoRes) => {
    let data = '';
    expoRes.on('data', (chunk) => {
      data += chunk;
    });
    expoRes.on('end', () => {
      res.send({
        status: 'ok',
        statusCode: expoRes.statusCode,
        dataLength: data.length,
        message: 'Expo server is running'
      });
    });
  }).on('error', (err) => {
    res.status(500).send({
      status: 'error',
      message: `Error connecting to Expo: ${err.message}`
    });
  });
});

// Forward /app path to the Expo server
app.use('/app', createProxyMiddleware(proxyOptions));

// Also forward assets and other paths
app.use('/assets', createProxyMiddleware(proxyOptions));
app.use('/index.bundle', createProxyMiddleware(proxyOptions));

// Start the server
app.listen(PORT, () => {
  console.log(`Status check server running on port ${PORT}`);
  console.log(`Access the status page at: http://localhost:${PORT}/status`);
  console.log(`Access the app at: http://localhost:${PORT}/app`);
});