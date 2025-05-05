/**
 * Simple and reliable server for Spiritual Condition Tracker app
 * Designed for deployment on your own server
 */

const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const http = require('http');
const httpProxy = require('http-proxy');
const fs = require('fs');

// Configuration
const PORT = 3243; // Your specific deployment port
const EXPO_PORT = 5001;

// Create Express app and HTTP server
const app = express();
const server = http.createServer(app);

// Create proxy for Expo app
const proxy = httpProxy.createProxyServer({ 
  ws: true,
  changeOrigin: true
});

// Handle proxy errors
proxy.on('error', (err, req, res) => {
  console.error(`Proxy error: ${err.message}`);
  if (res && res.writeHead) {
    res.writeHead(500);
    res.end(`Proxy error: ${err.message}`);
  }
});

// Serve static files 
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname)));

// Start the Expo app in the background
async function startExpoApp() {
  console.log('Starting Expo app...');
  
  const expoAppDir = path.join(__dirname, 'expo-app');
  if (!fs.existsSync(expoAppDir)) {
    console.error('Error: expo-app directory not found');
    throw new Error('expo-app directory not found');
  }
  
  // Clean up any existing processes
  try {
    console.log('Cleaning up existing processes...');
    spawn('pkill', ['-f', 'npx expo'], { stdio: 'ignore' });
    await new Promise(resolve => setTimeout(resolve, 1000));
  } catch (err) {
    console.log('No processes to clean up');
  }
  
  // Start Expo with CI mode to avoid interactive prompts
  const expoProcess = spawn('npx', [
    'expo',
    'start',
    '--offline',
    '--web',
    '--port',
    EXPO_PORT,
    '--non-interactive'
  ], {
    cwd: expoAppDir,
    env: { ...process.env, CI: '1' },
    stdio: 'pipe'
  });
  
  console.log(`Started Expo with PID ${expoProcess.pid}`);
  
  // Log Expo output
  expoProcess.stdout.on('data', (data) => {
    console.log(`Expo: ${data}`);
  });
  
  expoProcess.stderr.on('data', (data) => {
    console.error(`Expo error: ${data}`);
  });
  
  // Wait for Expo to initialize (10 seconds should be enough)
  console.log('Waiting for Expo to initialize...');
  await new Promise(resolve => setTimeout(resolve, 10000));
  
  return expoProcess;
}

// Set up the application routes and start the server
async function main() {
  try {
    // Start Expo in the background
    const expoProcess = await startExpoApp();
    
    // Root route for landing page
    app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });
    
    // Redirect /app to /app/ to ensure proper path handling
    app.get('/app', (req, res) => {
      res.redirect('/app/');
    });
    
    // Main app route - proxy all requests with /app/ prefix to Expo
    app.use('/app/', (req, res) => {
      const targetUrl = `http://localhost:${EXPO_PORT}/`;
      console.log(`Proxying app request: ${req.url} -> ${targetUrl}`);
      
      // Strip the /app/ prefix when forwarding to Expo
      req.url = req.url.replace(/^\/app\//, '/');
      
      proxy.web(req, res, { 
        target: targetUrl
      });
    });
    
    // Set up explicit routes for known asset patterns
    ['/assets', '/static', '/_expo'].forEach(path => {
      app.use(path, (req, res) => {
        console.log(`Proxying ${path} request: ${req.url}`);
        proxy.web(req, res, { target: `http://localhost:${EXPO_PORT}` });
      });
    });
    
    // Catch bundle and JS files - critical for app loading
    app.use((req, res, next) => {
      const url = req.url;
      if (url.includes('.bundle') || 
          url.includes('.js') || 
          url.includes('.map') || 
          url.includes('hot')) {
        console.log(`Proxying bundle request: ${url}`);
        proxy.web(req, res, { target: `http://localhost:${EXPO_PORT}` });
      } else {
        next();
      }
    });
    
    // Fallback route
    app.use((req, res) => {
      console.log(`Fallback - unhandled request: ${req.url}`);
      res.redirect('/');
    });
    
    // Handle WebSocket connections - essential for hot reloading
    server.on('upgrade', (req, socket, head) => {
      if (req.url.startsWith('/app/')) {
        // Fix WebSocket path before proxying
        req.url = req.url.replace(/^\/app\//, '/');
      }
      
      proxy.ws(req, socket, head, { 
        target: `http://localhost:${EXPO_PORT}` 
      });
    });
    
    // Start the server
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running at http://0.0.0.0:${PORT}`);
      console.log(`- Landing page: http://localhost:${PORT}/`);
      console.log(`- Main app: http://localhost:${PORT}/app/`);
    });
    
    // Handle graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM received, shutting down...');
      if (expoProcess) expoProcess.kill();
      server.close(() => console.log('HTTP server closed'));
    });
    
  } catch (err) {
    console.error('Fatal server error:', err);
    process.exit(1);
  }
}

// Start everything
main();