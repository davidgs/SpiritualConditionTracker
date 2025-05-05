/**
 * Fixed production server for Spiritual Condition Tracker
 * Addresses deployment issues with logo paths and DNS lookup failures
 */

const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const http = require('http');
const httpProxy = require('http-proxy');
const fs = require('fs');

// Configuration - use your custom port on your own server
const PORT = process.env.PORT || 3243;
const EXPO_PORT = 5001;
const HOST = process.env.HOST || '0.0.0.0';

// Create Express app and HTTP server
const app = express();
const server = http.createServer(app);

// Create proxy for Expo app
const proxy = httpProxy.createProxyServer({ 
  ws: true, 
  changeOrigin: true,
  ignorePath: false
});

// Handle proxy errors
proxy.on('error', (err, req, res) => {
  console.error(`Proxy error: ${err.message}`);
  if (res && res.writeHead) {
    res.writeHead(500);
    res.end(`Server error: ${err.message}`);
  }
});

// Serve static files from both public and root directories
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/logo.jpg', express.static(path.join(__dirname, 'logo.jpg')));
app.use(express.static(path.join(__dirname)));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Start the Expo app in the background
async function startExpoApp() {
  console.log('Starting Expo app...');
  
  const expoAppDir = path.join(__dirname, 'expo-app');
  if (!fs.existsSync(expoAppDir)) {
    console.error('Error: expo-app directory not found');
    throw new Error('expo-app directory not found');
  }
  
  // Clean up any existing Expo processes
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
  
  expoProcess.stdout.on('data', (data) => {
    console.log(`Expo: ${data}`);
  });
  
  expoProcess.stderr.on('data', (data) => {
    console.error(`Expo error: ${data}`);
  });
  
  // Wait for Expo to initialize
  console.log('Waiting for Expo to initialize...');
  await new Promise(resolve => setTimeout(resolve, 10000));
  
  return expoProcess;
}

// Fix the logo path in the HTML
function fixHtmlPaths() {
  const indexPath = path.join(__dirname, 'public', 'index.html');
  if (fs.existsSync(indexPath)) {
    let content = fs.readFileSync(indexPath, 'utf8');
    
    // Fix logo path to be absolute (for any environment)
    content = content.replace(
      'src="/public/logo.jpg"',
      'src="/logo.jpg"'
    );
    
    // Ensure app link has proper format
    content = content.replace(
      'href="/app/"',
      'href="/app"'
    );
    
    fs.writeFileSync(indexPath, content);
    console.log('Fixed paths in index.html');
  }
}

// Set up the application routes and start the server
async function main() {
  try {
    // Fix HTML paths
    fixHtmlPaths();
    
    // Set up the landing page route
    app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });
    
    // Start Expo in the background
    const expoProcess = await startExpoApp();
    
    // Handle app route - main entry point to the Expo app
    app.use('/app', (req, res) => {
      const targetUrl = `http://localhost:${EXPO_PORT}`;
      console.log(`Proxying to Expo app: ${req.url} -> ${targetUrl}`);
      proxy.web(req, res, { target: targetUrl });
    });
    
    // Handle known Expo asset routes
    app.use('/assets', (req, res) => {
      proxy.web(req, res, { target: `http://localhost:${EXPO_PORT}` });
    });
    
    app.use('/static', (req, res) => {
      proxy.web(req, res, { target: `http://localhost:${EXPO_PORT}` });
    });
    
    // Handle bundle and JS files
    app.use((req, res, next) => {
      if (req.url.includes('.bundle') || 
          req.url.includes('.js') || 
          req.url.includes('.map') || 
          req.url.includes('hot')) {
        proxy.web(req, res, { target: `http://localhost:${EXPO_PORT}` });
      } else {
        next();
      }
    });
    
    // Handle WebSocket connections
    server.on('upgrade', (req, socket, head) => {
      console.log(`WebSocket upgrade: ${req.url}`);
      proxy.ws(req, socket, head, { target: `http://localhost:${EXPO_PORT}` });
    });
    
    // Start the server
    server.listen(PORT, HOST, () => {
      console.log(`Server running at http://${HOST}:${PORT}`);
      console.log(`- Landing page: http://localhost:${PORT}/`);
      console.log(`- Main app: http://localhost:${PORT}/app`);
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