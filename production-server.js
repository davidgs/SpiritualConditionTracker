/**
 * Simple HTTP proxy for Spiritual Condition Tracker
 * Routes requests to the Expo app running on port 19006
 */

const http = require('http');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Configuration
const PROXY_PORT = 3243;  // The port Apache is configured to proxy to
const EXPO_PORT = 19006;  // Default Expo port for web
const expoAppDir = path.join(__dirname, 'expo-app');

// Ensure the Expo directory exists
if (!fs.existsSync(expoAppDir)) {
  console.error(`Error: Expo app directory not found at ${expoAppDir}`);
  process.exit(1);
}

// Start the Expo app
function startExpo() {
  console.log('Starting Expo app...');
  
  // Kill any existing Expo processes
  try {
    console.log('Cleaning up existing processes...');
    spawn('pkill', ['-f', 'expo'], { stdio: 'ignore' });
  } catch (err) {
    // Ignore errors
  }
  
  // Set up environment for Expo
  const env = {
    ...process.env,
    CI: '1',  // Non-interactive mode
    EXPO_WEB_PORT: EXPO_PORT.toString(),
    DANGEROUSLY_DISABLE_HOST_CHECK: 'true'
  };
  
  // Start Expo with web mode
  const expoProcess = spawn('npx', [
    'expo',
    'start',
    '--web',
    '--port',
    EXPO_PORT.toString(),
    '--host',
    'lan'
  ], {
    cwd: expoAppDir,
    env: env,
    stdio: 'pipe'
  });
  
  console.log(`Started Expo with PID ${expoProcess.pid}`);
  
  // Handle Expo output
  expoProcess.stdout.on('data', (data) => {
    console.log(`Expo: ${data.toString().trim()}`);
  });
  
  expoProcess.stderr.on('data', (data) => {
    console.error(`Expo error: ${data.toString().trim()}`);
  });
  
  expoProcess.on('close', (code) => {
    console.log(`Expo process exited with code ${code}`);
    if (code !== 0 && code !== null) {
      console.log('Restarting Expo in 5 seconds...');
      setTimeout(startExpo, 5000);
    }
  });
  
  return expoProcess;
}

// Create a proxy server
function createProxyServer() {
  console.log(`Creating proxy server on port ${PROXY_PORT} -> ${EXPO_PORT}`);
  
  const server = http.createServer((req, res) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    
    // Options for the proxy request
    const options = {
      hostname: 'localhost',
      port: EXPO_PORT,
      path: req.url,
      method: req.method,
      headers: {
        ...req.headers,
        host: `localhost:${EXPO_PORT}`
      }
    };
    
    // Create the proxied request
    const proxyReq = http.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res);
    });
    
    // Handle errors
    proxyReq.on('error', (e) => {
      console.error(`Proxy error: ${e.message}`);
      
      // Send a user-friendly response if Expo is not available
      res.writeHead(500, { 'Content-Type': 'text/html' });
      res.end(`
        <html>
          <head><title>App Starting</title></head>
          <body style="font-family: sans-serif; text-align: center; padding: 50px;">
            <h1>App is starting up...</h1>
            <p>The Spiritual Condition Tracker app is currently starting up.</p>
            <p>Please try again in a few moments.</p>
            <p><a href="/">Return to Home Page</a></p>
          </body>
        </html>
      `);
    });
    
    // Forward the request body if it exists
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      req.pipe(proxyReq);
    } else {
      proxyReq.end();
    }
  });
  
  // Start listening
  server.listen(PROXY_PORT, '0.0.0.0', () => {
    console.log(`
==========================================================
Proxy server running on port ${PROXY_PORT}
Forwarding requests to Expo on port ${EXPO_PORT}
==========================================================
    `);
  });
  
  return server;
}

// Main function
function main() {
  // Start Expo first
  const expoProcess = startExpo();
  
  // Then create the proxy
  const server = createProxyServer();
  
  // Handle shutdown signals
  process.on('SIGINT', () => {
    console.log('Shutting down...');
    expoProcess.kill();
    server.close();
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    console.log('Shutting down...');
    expoProcess.kill();
    server.close();
    process.exit(0);
  });
}

// Start everything
main();