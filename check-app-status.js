/**
 * Simple status check server for Spiritual Condition Tracker
 * 
 * This script:
 * 1. Creates a simple HTTP server to check the status of the Expo app
 * 2. No dependencies on external modules - uses only Node.js core modules
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// Port for our status check server
const PORT = 5000;

// Function to check if the Expo server is running
function checkExpoServer(callback) {
  const options = {
    hostname: 'localhost',
    port: 3243,
    path: '/app',
    method: 'GET',
    timeout: 5000
  };
  
  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      callback({
        status: 'ok',
        statusCode: res.statusCode,
        dataLength: data.length,
        message: 'Expo server is running'
      });
    });
  });
  
  req.on('error', (err) => {
    callback({
      status: 'error',
      message: `Error connecting to Expo: ${err.message}`
    });
  });
  
  req.end();
}

// Create a simple HTTP server
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  
  console.log(`Request received: ${pathname}`);
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  
  // Serve our status page
  if (pathname === '/status') {
    try {
      const statusHtml = fs.readFileSync(path.join(__dirname, 'app-status.html'), 'utf8');
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(statusHtml);
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end(`Error reading status page: ${error.message}`);
    }
    return;
  }
  
  // Check if the Expo server is running
  if (pathname === '/check-expo') {
    checkExpoServer((result) => {
      res.writeHead(result.status === 'ok' ? 200 : 500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result, null, 2));
    });
    return;
  }
  
  // Redirect to the Expo server for /app requests
  if (pathname.startsWith('/app')) {
    // Create a custom HTML page that embeds the app in an iframe
    const iframeHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Spiritual Condition Tracker App</title>
        <style>
          body, html { margin: 0; padding: 0; height: 100%; overflow: hidden; }
          iframe { width: 100%; height: 100%; border: none; }
        </style>
      </head>
      <body>
        <iframe src="http://localhost:3243${pathname}" allow="geolocation; microphone; camera; midi; encrypted-media; fullscreen"></iframe>
      </body>
      </html>
    `;
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(iframeHtml);
    return;
  }
  
  // Serve the main index.html
  if (pathname === '/') {
    try {
      const indexHtml = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(indexHtml);
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end(`Error reading index page: ${error.message}`);
    }
    return;
  }
  
  // Default response for other paths
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not found');
});

// Start the server
server.listen(PORT, () => {
  console.log(`Status check server running on port ${PORT}`);
  console.log(`Access the status page at: http://localhost:${PORT}/status`);
  console.log(`Access the app at: http://localhost:${PORT}/app`);
  
  // Immediately check if the Expo server is running
  checkExpoServer((result) => {
    console.log(`Initial Expo server check: ${result.status}`);
    if (result.status === 'ok') {
      console.log(`Expo server is running with status code: ${result.statusCode}`);
    } else {
      console.log(`Expo server check failed: ${result.message}`);
    }
  });
});