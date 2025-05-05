/**
 * Simple and reliable server for Spiritual Condition Tracker app
 * This server serves the landing page and proxies requests to the Expo app
 */

const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const http = require('http');
const httpProxy = require('http-proxy');

const app = express();
const PORT = process.env.PORT || 3000;
const EXPO_PORT = 5001;

// Create a proxy server
const proxy = httpProxy.createProxyServer({
  ws: true,
  changeOrigin: true
});

// Handle proxy errors
proxy.on('error', (err, req, res) => {
  console.error('Proxy error:', err);
  if (res.writeHead) {
    res.writeHead(500);
    res.end(`Proxy error: ${err.message}`);
  }
});

// Serve static files from public directory first (for landing page assets)
app.use(express.static(path.join(__dirname, 'public')));

// Serve static files from root directory
app.use(express.static(path.join(__dirname)));

// Root route - serve the landing page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Simple route to check if server is running
app.get('/health', (req, res) => {
  res.status(200).send('Server is healthy');
});

// Forward all app related requests to Expo
app.use('/app', (req, res) => {
  console.log(`Proxying ${req.method} request to /app: ${req.url}`);
  proxy.web(req, res, { target: `http://localhost:${EXPO_PORT}` });
});

// Handle assets and bundle requests
app.use(['/assets', '/static'], (req, res) => {
  console.log(`Proxying asset request: ${req.url}`);
  proxy.web(req, res, { target: `http://localhost:${EXPO_PORT}` });
});

// Start the Expo app in the background
async function startExpoApp() {
  console.log('Starting Expo app...');
  
  // Kill any existing processes
  try {
    console.log('Cleaning up existing processes...');
    spawn('pkill', ['-f', 'npx expo'], { stdio: 'ignore' });
    await new Promise(resolve => setTimeout(resolve, 1000));
  } catch (err) {
    console.log('No existing processes to clean up');
  }
  
  // Start Expo
  const expoProcess = spawn('npx', [
    'expo', 
    'start', 
    '--offline', 
    '--web', 
    '--port', 
    EXPO_PORT,
    '--non-interactive'
  ], {
    cwd: path.join(__dirname, 'expo-app'),
    env: { ...process.env, CI: '1' },
    stdio: 'pipe'
  });
  
  console.log(`Started Expo process with PID ${expoProcess.pid}`);
  
  expoProcess.stdout.on('data', (data) => {
    console.log(`Expo: ${data}`);
  });
  
  expoProcess.stderr.on('data', (data) => {
    console.error(`Expo error: ${data}`);
  });
  
  // Wait for Expo to start
  console.log(`Waiting for Expo...`);
  await new Promise(resolve => setTimeout(resolve, 5000));
  console.log('Expo should be ready now');
  
  return expoProcess;
}

// Create HTTP server and handle WebSockets
const server = http.createServer(app);

server.on('upgrade', (req, socket, head) => {
  console.log(`WebSocket upgrade: ${req.url}`);
  proxy.ws(req, socket, head, { 
    target: `http://localhost:${EXPO_PORT}` 
  });
});

// Start the server
async function main() {
  try {
    // Start Expo in the background
    const expoProcess = await startExpoApp();
    
    // Start the HTTP server
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`- Landing page: http://localhost:${PORT}/`);
      console.log(`- Main app: http://localhost:${PORT}/app/`);
    });
    
    // Handle shutdown
    process.on('SIGTERM', () => {
      console.log('Shutting down...');
      server.close(() => {
        console.log('HTTP server closed');
        if (expoProcess) expoProcess.kill();
      });
    });
    
  } catch (err) {
    console.error('Server error:', err);
    process.exit(1);
  }
}

// Start everything
main();