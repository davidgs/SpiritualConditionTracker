/**
 * Unified deployment server for Spiritual Condition Tracker
 * This server handles both serving Expo and proxying requests
 */

const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const http = require('http');
const httpProxy = require('http-proxy');

const app = express();
const PORT = process.env.PORT || 5000; // Use port 5000 to work with Replit
const EXPO_PORT = 5001; // Use a different port to avoid conflicts

// Function to check if Expo is running properly
function checkExpoStatus(port, maxRetries = 30, interval = 1000) {
  return new Promise((resolve, reject) => {
    let retries = 0;
    
    const check = () => {
      const req = http.get(`http://localhost:${port}`, (res) => {
        if (res.statusCode === 200) {
          console.log(`Expo server is running on port ${port}`);
          resolve(true);
        } else {
          retry();
        }
      });
      
      req.on('error', (err) => {
        console.log(`Expo not yet ready: ${err.message}`);
        retry();
      });
      
      req.end();
    };
    
    const retry = () => {
      retries++;
      if (retries < maxRetries) {
        console.log(`Retrying Expo check ${retries}/${maxRetries}...`);
        setTimeout(check, interval);
      } else {
        console.error(`Expo server did not start after ${maxRetries} attempts`);
        reject(new Error('Expo server failed to start'));
      }
    };
    
    // Start checking
    check();
  });
}

// Start the Expo app in the background
async function startExpoApp() {
  console.log('Starting Expo app...');
  
  // Check if directory exists
  const expoAppDir = path.join(__dirname, 'expo-app');
  if (!fs.existsSync(expoAppDir)) {
    console.error('Error: expo-app directory not found!');
    throw new Error('expo-app directory not found');
  }

  // Kill any existing processes to ensure clean start
  try {
    console.log('Cleaning up existing processes...');
    spawn('pkill', ['-f', 'npx expo'], { stdio: 'ignore' });
    // Wait a moment for processes to be killed
    await new Promise(resolve => setTimeout(resolve, 1000));
  } catch (err) {
    console.log('No existing processes to clean up');
  }

  // Start Expo with web support on a specific port
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
  
  console.log(`Started Expo process with PID ${expoProcess.pid}`);

  expoProcess.stdout.on('data', (data) => {
    console.log(`Expo: ${data}`);
  });

  expoProcess.stderr.on('data', (data) => {
    console.error(`Expo error: ${data}`);
  });

  expoProcess.on('close', (code) => {
    console.log(`Expo process exited with code ${code}`);
  });
  
  // Wait for Expo to be ready
  console.log(`Waiting for Expo to be available on port ${EXPO_PORT}...`);
  try {
    // First, give it some time to start
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Then check if it's responding
    await checkExpoStatus(EXPO_PORT);
    console.log('Expo is up and running!');
  } catch (err) {
    console.error('Expo failed to start properly:', err.message);
    console.log('Continuing anyway, maybe it just needs more time...');
  }
  
  return expoProcess;
}

// Create a proxy server to forward requests to Expo
function setupProxy() {
  console.log('Setting up proxy server...');
  
  const proxy = httpProxy.createProxyServer({
    target: `http://localhost:${EXPO_PORT}`,
    ws: true
  });
  
  // Handle proxy errors
  proxy.on('error', (err, req, res) => {
    console.error('Proxy error:', err);
    if (res.writeHead) {
      res.writeHead(500);
      res.end(`Proxy error: ${err.message}`);
    }
  });
  
  return proxy;
}

// Main function to start everything
async function main() {
  try {
    // Start Expo in the background
    const expoProcess = await startExpoApp();
    
    // Set up the proxy
    const proxy = setupProxy();
    
    // Serve static files from the root directory and set public to have priority
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(express.static(path.join(__dirname)));
    
    // Root route for landing page
    app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });
    
    // Handle bundle requests directly - important for app loading
    app.use('/index.bundle', (req, res) => {
      console.log(`Proxying bundle request: ${req.url}`);
      proxy.web(req, res, {
        target: `http://localhost:${EXPO_PORT}`
      });
    });
    
    // Forward all app related requests to the Expo app
    app.use('/app', (req, res) => {
      console.log(`Proxying ${req.method} request for ${req.url}`);
      proxy.web(req, res, { 
        target: `http://localhost:${EXPO_PORT}`,
        changeOrigin: true
      });
    });
    
    // Forward specific known bundle patterns with fixed routing
    app.use('/index.bundle', (req, res) => {
      console.log(`Proxying main bundle request: ${req.url}`);
      proxy.web(req, res, {
        target: `http://localhost:${EXPO_PORT}`
      });
    });
    
    // Handle bundle requests with extensions
    app.use(function(req, res, next) {
      if (req.path.endsWith('.bundle')) {
        console.log(`Proxying bundle request with extension handler: ${req.url}`);
        proxy.web(req, res, {
          target: `http://localhost:${EXPO_PORT}`
        });
      } else {
        next();
      }
    });

    // Handle asset requests individually to avoid array syntax issues
    app.use('/assets', (req, res) => {
      console.log(`Proxying assets request: ${req.url}`);
      proxy.web(req, res, {
        target: `http://localhost:${EXPO_PORT}`
      });
    });
    
    app.use('/static', (req, res) => {
      console.log(`Proxying static request: ${req.url}`);
      proxy.web(req, res, {
        target: `http://localhost:${EXPO_PORT}`
      });
    });
    
    // Check if the URL contains bundle-related requests and proxy them
    app.use((req, res, next) => {
      const url = req.url;
      if (url.includes('bundle') || url.includes('.js') || url.includes('assets') || 
          url.includes('static') || url.includes('hot') || url.includes('.map')) {
        console.log(`Proxying bundle-related request: ${url}`);
        return proxy.web(req, res, {
          target: `http://localhost:${EXPO_PORT}`
        });
      }
      next();
    });
    
    // Catch-all route for any other requests
    app.use((req, res) => {
      console.log(`Unhandled request for ${req.url} - redirecting to home`);
      res.redirect('/');
    });
    
    // Create HTTP server
    const server = http.createServer(app);
    
    // Handle WebSocket connections
    server.on('upgrade', (req, socket, head) => {
      console.log(`WebSocket upgrade: ${req.url}`);
      if (req.url.indexOf('/app') === 0) {
        proxy.ws(req, socket, head, { 
          target: `http://localhost:${EXPO_PORT}` 
        });
      }
    });
    
    // Start the server
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`Deployment server running on port ${PORT}`);
      console.log(`App available at: http://localhost:${PORT}/app/`);
      console.log(`Landing page available at: http://localhost:${PORT}/`);
    });
    
    // Handle graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM received, shutting down...');
      server.close(() => {
        console.log('HTTP server closed.');
        if (expoProcess) {
          console.log('Terminating Expo process...');
          expoProcess.kill();
        }
      });
    });
    
  } catch (err) {
    console.error('Fatal error in main:', err);
    process.exit(1);
  }
}

// Start everything
main();