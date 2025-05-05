/**
 * Production-ready server for Spiritual Condition Tracker
 * Designed to work reliably on external hosting environments
 */

const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const http = require('http');
const httpProxy = require('http-proxy');
const fs = require('fs');

// Configuration
const PORT = process.env.PORT || 5000; // Use configurable port (use 3243 for your own server)
const EXPO_PORT = 5001;
const HOST = process.env.HOST || '0.0.0.0';

// Create Express app
const app = express();

// Create HTTP server
const server = http.createServer(app);

// Create a proxy server for Expo
const proxy = httpProxy.createProxyServer({
  ws: true,
  changeOrigin: true
});

// Handle proxy errors
proxy.on('error', (err, req, res) => {
  console.error('Proxy error:', err);
  if (res && res.writeHead) {
    res.writeHead(500);
    res.end(`Proxy error: ${err.message}`);
  }
});

// Configure Express middleware
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname)));

// Custom middleware to log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Fix for logo in HTML file
function fixLogoPath() {
  const indexPath = path.join(__dirname, 'public', 'index.html');
  if (fs.existsSync(indexPath)) {
    let content = fs.readFileSync(indexPath, 'utf8');
    
    // Fix the logo path to be absolute
    content = content.replace(
      'src="/public/logo.jpg"', 
      'src="/logo.jpg"'
    );
    
    // Fix the app link to include a trailing slash
    content = content.replace(
      'href="/app/"',
      'href="/app"'
    );
    
    fs.writeFileSync(indexPath, content);
    console.log('Fixed paths in index.html');
  } else {
    console.error('Could not find index.html to fix paths');
  }
}

// Start Expo in the background
async function startExpoApp() {
  console.log('Starting Expo app...');
  
  // Check if directory exists
  const expoAppDir = path.join(__dirname, 'expo-app');
  if (!fs.existsSync(expoAppDir)) {
    console.error('Error: expo-app directory not found');
    throw new Error('expo-app directory not found');
  }
  
  // Clean up existing processes
  try {
    console.log('Cleaning up existing processes...');
    spawn('pkill', ['-f', 'npx expo'], { stdio: 'ignore' });
    await new Promise(resolve => setTimeout(resolve, 1000));
  } catch (err) {
    console.log('No processes to clean up');
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
  
  expoProcess.on('close', (code) => {
    console.log(`Expo process exited with code ${code}`);
  });
  
  // Wait for Expo to initialize (longer timeout for production)
  console.log('Waiting for Expo to initialize...');
  await new Promise(resolve => setTimeout(resolve, 10000));
  
  return expoProcess;
}

// Main function to start everything
async function main() {
  try {
    // Fix logo path in HTML
    fixLogoPath();
    
    // Serve the landing page at root
    app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });
    
    // Start Expo in the background
    const expoProcess = await startExpoApp();
    
    // Forward app routes to Expo
    app.use('/app', (req, res) => {
      console.log(`Proxying app request: ${req.url}`);
      proxy.web(req, res, { 
        target: `http://localhost:${EXPO_PORT}`,
        ignorePath: false
      });
    });
    
    // Handle asset requests
    app.use('/assets', (req, res) => {
      console.log(`Proxying asset request: ${req.url}`);
      proxy.web(req, res, { target: `http://localhost:${EXPO_PORT}` });
    });
    
    app.use('/static', (req, res) => {
      console.log(`Proxying static request: ${req.url}`);
      proxy.web(req, res, { target: `http://localhost:${EXPO_PORT}` });
    });
    
    // Handle JavaScript and bundle requests
    app.use((req, res, next) => {
      const url = req.url;
      if (url.includes('.bundle') || url.includes('.js') || 
          url.includes('.map') || url.includes('hot')) {
        console.log(`Proxying bundle request: ${url}`);
        proxy.web(req, res, { target: `http://localhost:${EXPO_PORT}` });
      } else {
        next();
      }
    });
    
    // Handle WebSocket connections for hot reloading
    server.on('upgrade', (req, socket, head) => {
      console.log(`WebSocket upgrade: ${req.url}`);
      proxy.ws(req, socket, head, { target: `http://localhost:${EXPO_PORT}` });
    });
    
    // Catch-all route to handle SPA routing
    app.get('*', (req, res, next) => {
      // Don't handle assets or API routes
      if (req.url.startsWith('/assets') || 
          req.url.startsWith('/static') || 
          req.url.startsWith('/api')) {
        return next();
      }
      
      // If route starts with /app, serve the Expo app
      if (req.url.startsWith('/app')) {
        console.log(`SPA route, proxying to Expo: ${req.url}`);
        return proxy.web(req, res, { target: `http://localhost:${EXPO_PORT}` });
      }
      
      // Otherwise serve the landing page
      res.sendFile(path.join(__dirname, 'public', 'index.html'));
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
      if (expoProcess) {
        console.log('Terminating Expo process...');
        expoProcess.kill();
      }
      server.close(() => {
        console.log('HTTP server closed');
      });
    });
    
  } catch (err) {
    console.error('Fatal server error:', err);
    process.exit(1);
  }
}

// Start everything
main();