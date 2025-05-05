/**
 * Better server for Spiritual Condition Tracker
 * This server serves the landing page and proxies app requests
 */

const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const http = require('http');
const httpProxy = require('http-proxy');

const app = express();
const PORT = process.env.PORT || 5000;
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

// Serve static files from public directory
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname)));

// Root route - serve the landing page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve a simple health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('Server is running');
});

// Start Expo in the background
async function startExpoApp() {
  console.log('Starting Expo app...');
  
  // Clean up existing processes
  try {
    console.log('Cleaning up existing processes...');
    spawn('pkill', ['-f', 'npx expo'], { stdio: 'ignore' });
    await new Promise(resolve => setTimeout(resolve, 1000));
  } catch (err) {
    console.log('No processes to clean');
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
  
  console.log(`Started Expo with PID ${expoProcess.pid}`);
  
  // Log Expo output
  expoProcess.stdout.on('data', (data) => {
    console.log(`Expo: ${data}`);
  });
  
  expoProcess.stderr.on('data', (data) => {
    console.error(`Expo error: ${data}`);
  });
  
  // Wait for Expo to initialize
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  return expoProcess;
}

// Create HTTP server
const server = http.createServer(app);

// Launch the server
async function main() {
  try {
    // Start Expo
    const expoProcess = await startExpoApp();
    
    // Set up routes after Expo is started
    
    // Forward app requests to Expo
    app.use('/app', (req, res) => {
      console.log(`Proxying to app: ${req.url}`);
      proxy.web(req, res, { target: `http://localhost:${EXPO_PORT}` });
    });
    
    // Handle assets and bundles
    app.use('/assets', (req, res) => {
      console.log(`Proxying asset: ${req.url}`);
      proxy.web(req, res, { target: `http://localhost:${EXPO_PORT}` });
    });
    
    app.use('/static', (req, res) => {
      console.log(`Proxying static: ${req.url}`);
      proxy.web(req, res, { target: `http://localhost:${EXPO_PORT}` });
    });
    
    // Handle bundle requests
    app.use((req, res, next) => {
      if (req.url.includes('.bundle') || req.url.includes('.js')) {
        console.log(`Proxying bundle: ${req.url}`);
        proxy.web(req, res, { target: `http://localhost:${EXPO_PORT}` });
      } else {
        next();
      }
    });
    
    // Handle WebSocket requests
    server.on('upgrade', (req, socket, head) => {
      console.log(`WebSocket upgrade: ${req.url}`);
      proxy.ws(req, socket, head, { target: `http://localhost:${EXPO_PORT}` });
    });
    
    // Start the server
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Landing page: http://localhost:${PORT}/`);
      console.log(`App: http://localhost:${PORT}/app/`);
    });
    
    // Handle shutdown
    process.on('SIGTERM', () => {
      console.log('Shutting down...');
      if (expoProcess) expoProcess.kill();
      server.close();
    });
    
  } catch (err) {
    console.error('Server error:', err);
    process.exit(1);
  }
}

// Start everything
main();