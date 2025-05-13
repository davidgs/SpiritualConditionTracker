/**
 * Simple server for running the Spiritual Condition Tracker app
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn, execSync } = require('child_process');
const { createProxyServer } = require('http-proxy');

// Configuration
const PORT = 5000;
const EXPO_PORT = 3243;

// Create a proxy for Expo
const proxy = createProxyServer({
  ws: true,
  changeOrigin: true
});

// Handle proxy errors
proxy.on('error', function(err, req, res) {
  console.error('Proxy error:', err);
  if (res && !res.headersSent) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Proxy error: ' + err.toString());
  }
});

// Make version-injector.js read-only
function makeVersionInjectorReadOnly() {
  const versionInjectorPath = path.join(__dirname, 'web', 'version-injector.js');
  
  try {
    if (fs.existsSync(versionInjectorPath)) {
      execSync(`chmod 444 ${versionInjectorPath}`);
      console.log('Made version-injector.js read-only');
      return true;
    }
    return false;
  } catch (err) {
    console.error('Error making version-injector.js read-only:', err);
    return false;
  }
}

// Start Expo in the background
async function startExpoApp() {
  console.log('Starting Expo app...');
  
  try {
    // Clean up existing processes
    try {
      execSync('pkill -f "expo start" || true', { stdio: 'ignore' });
      execSync('pkill -f "npm run" || true', { stdio: 'ignore' });
    } catch (err) {
      // Ignore errors from process killing
    }
    
    // Make version-injector.js read-only
    makeVersionInjectorReadOnly();
    
    // Start the Expo process
    const expoProcess = spawn('node', ['run-expo-only.js'], {
      env: { 
        ...process.env, 
        CI: '1',
        EXPO_WEB_PORT: EXPO_PORT.toString(),
        DANGEROUSLY_DISABLE_HOST_CHECK: 'true',
        PUBLIC_URL: '/'
      },
      stdio: 'pipe'
    });
    
    expoProcess.stdout.on('data', (data) => {
      console.log(`Expo: ${data}`);
    });
    
    expoProcess.stderr.on('data', (data) => {
      console.error(`Expo error: ${data}`);
    });
    
    console.log(`Waiting for Expo to start on port ${EXPO_PORT}...`);
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    return expoProcess;
  } catch (err) {
    console.error('Error starting Expo:', err);
    throw err;
  }
}

// Main function
async function main() {
  try {
    // Start the Expo app
    const expoProcess = await startExpoApp();
    
    // Create HTTP server
    const server = http.createServer((req, res) => {
      console.log(`Request: ${req.method} ${req.url}`);
      
      // Set CORS headers
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      
      if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
      }
      
      // Proxy all requests directly to Expo
      proxy.web(req, res, { target: `http://localhost:${EXPO_PORT}` });
    });
    
    // Handle WebSocket connections
    server.on('upgrade', function(req, socket, head) {
      console.log(`WebSocket upgrade: ${req.url}`);
      proxy.ws(req, socket, head, { target: `http://localhost:${EXPO_PORT}` });
    });
    
    // Start the server
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running at http://0.0.0.0:${PORT}`);
      console.log(`Proxying all requests to Expo at http://localhost:${EXPO_PORT}`);
    });
    
    // Handle process termination
    process.on('SIGINT', () => {
      console.log('Shutting down server...');
      if (expoProcess) expoProcess.kill();
      server.close();
      process.exit(0);
    });
    
    process.on('SIGTERM', () => {
      console.log('Terminating server...');
      if (expoProcess) expoProcess.kill();
      server.close();
      process.exit(0);
    });
  } catch (err) {
    console.error('Server error:', err);
    process.exit(1);
  }
}

// Start the server
main();