/**
 * Expo server with platform header handling
 * This server starts Expo and handles the expo-platform header issue
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Configuration
const PORT = 5000;
const EXPO_PORT = 19000;

// Check if index.html exists
if (fs.existsSync('./index.html')) {
  console.log('Found index.html file, serving it directly');
}

// Create a proxy server to add headers
const server = http.createServer((req, res) => {
  console.log(`Request for: ${req.url}`);
  
  // Check if we should serve index.html directly
  if (req.url === '/' || req.url === '/index.html') {
    try {
      const indexContent = fs.readFileSync('./index.html');
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(indexContent);
      return;
    } catch (err) {
      console.error('Error reading index.html:', err);
      // Fall through to proxying
    }
  }
  
  // Create a new request to the Expo server with added headers
  const options = {
    hostname: 'localhost',
    port: EXPO_PORT,
    path: req.url,
    method: req.method,
    headers: {
      ...req.headers,
      'expo-platform': 'web'  // Add the required header
    }
  };
  
  // Make the proxied request
  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });
  
  // Handle errors
  proxyReq.on('error', (err) => {
    console.error('Proxy request error:', err);
    
    // Send a basic response if proxy fails
    res.writeHead(500, { 'Content-Type': 'text/html' });
    res.end(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Spiritual Condition Tracker</title>
        </head>
        <body>
          <h1>Spiritual Condition Tracker</h1>
          <p>Error connecting to Expo server: ${err.message}</p>
          <p>The server is probably still starting up. Please refresh in a moment.</p>
        </body>
      </html>
    `);
  });
  
  // End the proxy request
  req.pipe(proxyReq, { end: true });
});

// Start the server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  
  // Start Expo on a different port
  console.log(`Starting Expo on port ${EXPO_PORT}...`);
  
  // Launch Expo with the right settings
  const expo = spawn('npx', [
    'expo', 
    'start',
    '--web',
    '--port', EXPO_PORT.toString(),
    '--host', 'localhost'
  ], {
    stdio: 'inherit',
    env: {
      ...process.env,
      BROWSER: 'none',
      FORCE_COLOR: '1',
      EXPO_NO_DOCTOR: 'true',
      EXPO_PLATFORM_HEADER: 'web'
    }
  });
  
  // Handle errors
  expo.on('error', (err) => {
    console.error('Error starting Expo:', err);
  });
  
  // Handle exit
  expo.on('exit', (code) => {
    console.log(`Expo process exited with code ${code}`);
  });
});

// Handle cleanup
process.on('SIGINT', () => {
  console.log('Shutting down...');
  process.exit(0);
});