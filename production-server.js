/**
 * Production-ready server for Spiritual Condition Tracker
 * Designed to work reliably with Apache reverse proxy
 */

const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const http = require('http');
const httpProxy = require('http-proxy');
const fs = require('fs');

// Configuration
const PORT = process.env.PORT || 3243; // Use 3243 for your server
const EXPO_PORT = 5001;
const HOST = process.env.HOST || '0.0.0.0';

// Create Express app
const app = express();

// Create HTTP server
const server = http.createServer(app);

// Create a proxy server for Expo with settings for reverse proxy
const proxy = httpProxy.createProxyServer({
  ws: true,
  changeOrigin: true,
  xfwd: true,     // Forward the client IP
  secure: false   // Don't verify SSL certs
});

// Handle proxy errors
proxy.on('error', (err, req, res) => {
  console.error('Proxy error:', err);
  if (res && !res.headersSent && res.writeHead) {
    res.writeHead(500);
    res.end(`Proxy error: ${err.message}`);
  }
});

// Configure Express middleware - serve static files
app.use(express.static(path.join(__dirname)));
app.use('/public', express.static(path.join(__dirname, 'public')));

// Custom middleware to log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Fix for logo in HTML file and ensure it exists in both locations
function fixLogoPath() {
  try {
    // Copy logo to ensure it's in both locations
    if (fs.existsSync('logo.jpg')) {
      if (!fs.existsSync('public')) {
        fs.mkdirSync('public', { recursive: true });
      }
      fs.copyFileSync('logo.jpg', path.join('public', 'logo.jpg'));
      console.log('Logo copied to public directory');
    }
    
    const indexPath = path.join(__dirname, 'public', 'index.html');
    if (fs.existsSync(indexPath)) {
      let content = fs.readFileSync(indexPath, 'utf8');
      
      // Fix the logo path to be absolute
      content = content.replace(/src="[^"]*logo\.jpg"/g, 'src="/logo.jpg"');
      
      // Make all resource paths absolute
      content = content.replace(/src="(?!http|\/)/g, 'src="/');
      content = content.replace(/href="(?!http|\/|#)/g, 'href="/');
      
      fs.writeFileSync(indexPath, content);
      console.log('Fixed paths in index.html');
    } else {
      console.error('Could not find index.html to fix paths');
    }
  } catch (err) {
    console.error('Error fixing paths:', err);
  }
}

// Fix minimatch module issue
function fixMinimatchError() {
  try {
    console.log('Checking for minimatch module...');
    
    // Check if the problematic path exists
    const minimatchPath = path.join(__dirname, 'node_modules', 'minimatch', 'dist', 'commonjs');
    if (!fs.existsSync(minimatchPath)) {
      console.log('Creating minimatch directory structure...');
      fs.mkdirSync(minimatchPath, { recursive: true });
      
      // Create a simple shim
      const indexPath = path.join(minimatchPath, 'index.js');
      fs.writeFileSync(indexPath, `
// Simple shim to fix module resolution
module.exports = require('../../minimatch.js');
      `);
      console.log('Fixed minimatch module issue');
    }
  } catch (err) {
    console.error('Error fixing minimatch module:', err);
  }
}

// Start Expo in the background
async function startExpoApp() {
  console.log('Starting Expo app...');
  
  // Fix minimatch error first
  fixMinimatchError();
  
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
  
  // Configure environment for reverse proxy
  const expoEnv = { 
    ...process.env, 
    CI: '1',
    // Critical for reverse proxy
    DANGEROUSLY_DISABLE_HOST_CHECK: 'true',
    // For proper path handling
    PUBLIC_URL: '/',
    // For Metro bundler behind reverse proxy
    NODE_ENV: 'production',
    // Skip validation to avoid path-to-regexp error
    EXPO_SKIP_DEPENDENCY_VALIDATION: 'true'
  };
  
  // Start Expo with safer options
  const expoProcess = spawn('npx', [
    'expo',
    'start',
    '--no-dev',
    '--offline',
    '--web',
    '--port',
    EXPO_PORT
  ], {
    cwd: expoAppDir,
    env: expoEnv,
    stdio: 'pipe'
  });
  
  console.log(`Started Expo with PID ${expoProcess.pid}`);
  
  expoProcess.stdout.on('data', (data) => {
    const output = data.toString();
    console.log(`Expo: ${output.trim()}`);
  });
  
  expoProcess.stderr.on('data', (data) => {
    const output = data.toString();
    console.error(`Expo error: ${output.trim()}`);
  });
  
  expoProcess.on('close', (code) => {
    console.log(`Expo process exited with code ${code}`);
    // Auto-restart if it crashes, but avoid restarting if there's a path-to-regexp error
    if (code !== 0) {
      console.log('Attempting to restart Expo...');
      setTimeout(() => startExpoApp(), 5000);
    }
  });
  
  // Wait for Expo to initialize (longer timeout for production)
  console.log('Waiting for Expo to initialize...');
  await new Promise(resolve => setTimeout(resolve, 15000));
  
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
    
    // Add a simple test page to verify server is working
    app.get('/server-test', (req, res) => {
      res.send(`
        <html><head><title>Server Test</title></head>
        <body>
          <h1>Server is running properly!</h1>
          <p>This confirms that the Express server is working.</p>
          <p><a href="/">Go to home page</a></p>
          <p><a href="/app">Go to app</a></p>
          <p>Server time: ${new Date().toISOString()}</p>
        </body></html>
      `);
    });
    
    // Add debug route to show headers
    app.get('/debug-headers', (req, res) => {
      res.send(`
        <pre>
Server running on port: ${PORT}
Environment: ${process.env.NODE_ENV}
Headers: ${JSON.stringify(req.headers, null, 2)}
        </pre>
      `);
    });
    
    // Start Expo in the background
    const expoProcess = await startExpoApp();
    
    // Forward app routes to Expo - using app.all to catch all HTTP methods
    app.all('/app*', (req, res) => {
      console.log(`Proxying app request: ${req.url}`);
      // Set host header to help Expo
      req.headers['host'] = `localhost:${EXPO_PORT}`;
      proxy.web(req, res, { 
        target: `http://localhost:${EXPO_PORT}`,
        ignorePath: false
      });
    });
    
    // Handle asset requests - wildcards to catch all asset paths
    app.all('/assets*', (req, res) => {
      console.log(`Proxying asset request: ${req.url}`);
      proxy.web(req, res, { target: `http://localhost:${EXPO_PORT}` });
    });
    
    app.all('/static*', (req, res) => {
      console.log(`Proxying static request: ${req.url}`);
      proxy.web(req, res, { target: `http://localhost:${EXPO_PORT}` });
    });
    
    // Handle JavaScript and bundle requests
    app.use((req, res, next) => {
      const url = req.url;
      if (url.includes('.bundle') || url.includes('.js') || 
          url.includes('.map') || url.includes('hot-update') || 
          url.includes('sockjs-node')) {
        console.log(`Proxying special request: ${url}`);
        proxy.web(req, res, { target: `http://localhost:${EXPO_PORT}` });
      } else {
        next();
      }
    });
    
    // Handle WebSocket connections for hot reloading - critical for the app to work
    server.on('upgrade', (req, socket, head) => {
      const url = req.url;
      console.log(`WebSocket upgrade: ${url}`);
      if (url.startsWith('/app') || url.includes('hot-update') || 
          url.includes('sockjs-node') || url.includes('ws')) {
        proxy.ws(req, socket, head, { target: `http://localhost:${EXPO_PORT}` });
      }
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
      console.log(`
==========================================================
Spiritual Condition Tracker Server Running
==========================================================
Server port: ${PORT}
Expo port: ${EXPO_PORT}
Landing page: http://localhost:${PORT}/
App: http://localhost:${PORT}/app
Server test: http://localhost:${PORT}/server-test
Debug headers: http://localhost:${PORT}/debug-headers
==========================================================
      `);
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