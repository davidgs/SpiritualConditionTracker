/**
 * Simple and reliable server for Spiritual Condition Tracker app
 * Designed for deployment behind an Apache reverse proxy
 */

const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const http = require('http');
const httpProxy = require('http-proxy');
const fs = require('fs');
const cors = require('cors');

// Configuration
const PORT = 3243; // Your server port
const EXPO_PORT = 5001;

// Create Express app and server
const app = express();
const server = http.createServer(app);

// Enable CORS for all routes - needed for reverse proxy
app.use(cors());

// Create a proxy for Expo with better settings for reverse proxy environments
const proxy = httpProxy.createProxyServer({
  ws: true,
  changeOrigin: true,
  xfwd: true, // Forward client IP
  secure: false // Don't verify SSL certs
});

// Better error handling for the proxy
proxy.on('error', (err, req, res) => {
  console.error(`Proxy error: ${err.message}`);
  if (!res.headersSent && res.writeHead) {
    res.writeHead(500);
    res.end(`Proxy error: ${err.message}`);
  }
});

// Ensure logo is in both locations
function ensureLogoExists() {
  try {
    // Copy logo to public directory if needed
    if (fs.existsSync('logo.jpg') && fs.existsSync('public')) {
      fs.copyFileSync('logo.jpg', path.join('public', 'logo.jpg'));
      console.log('Logo file copied to public directory');
    }
  } catch (err) {
    console.error('Error copying logo:', err);
  }
}

// Fix HTML paths to work with a reverse proxy
function fixHtmlPaths() {
  try {
    const indexPath = path.join(__dirname, 'public', 'index.html');
    if (fs.existsSync(indexPath)) {
      let html = fs.readFileSync(indexPath, 'utf8');
      
      // Make all paths absolute
      html = html.replace(/src="(?!http|\/)/g, 'src="/');
      html = html.replace(/href="(?!http|\/|#)/g, 'href="/');
      
      // Fix specific logo path (this is critical)
      html = html.replace(/src="[^"]*logo\.jpg"/g, 'src="/logo.jpg"');
      
      // Fix app link
      html = html.replace(/href="\/app"/, 'href="/app/"');
      
      fs.writeFileSync(indexPath, html);
      console.log('Fixed paths in index.html');
    } else {
      console.error('index.html not found in public directory');
    }
  } catch (err) {
    console.error('Error fixing HTML paths:', err);
  }
}

// Start Expo in the background
async function startExpoApp() {
  console.log('Starting Expo app...');
  
  // Verify the expo-app directory exists
  const expoAppDir = path.join(__dirname, 'expo-app');
  if (!fs.existsSync(expoAppDir)) {
    console.error('Error: expo-app directory not found');
    throw new Error('expo-app directory not found');
  }
  
  // Kill any existing Expo processes
  try {
    console.log('Cleaning up existing processes...');
    spawn('pkill', ['-f', 'npx expo'], { stdio: 'ignore' });
    await new Promise(resolve => setTimeout(resolve, 1000));
  } catch (err) {
    console.log('No processes to clean up');
  }
  
  // Environment variables for Expo behind a reverse proxy
  const expoEnv = { 
    ...process.env, 
    CI: '1',
    // Critical for reverse proxy
    DANGEROUSLY_DISABLE_HOST_CHECK: 'true',
    // For proper path handling
    PUBLIC_URL: '/',
    // For Metro bundler behind reverse proxy
    NODE_ENV: 'production'
  };
  
  // Start Expo with the correct flags
  const expoProcess = spawn('npx', [
    'expo',
    'start',
    '--offline',
    '--web',
    '--non-interactive',
    '--port',
    EXPO_PORT
  ], {
    cwd: expoAppDir,
    env: expoEnv,
    stdio: 'pipe'
  });
  
  console.log(`Started Expo with PID ${expoProcess.pid}`);
  
  // Capture and log Expo output
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
    // Auto-restart if it crashes
    if (code !== 0) {
      console.log('Attempting to restart Expo...');
      setTimeout(() => startExpoApp(), 5000);
    }
  });
  
  // Wait for Expo to start
  console.log('Waiting for Expo to initialize...');
  await new Promise(resolve => setTimeout(resolve, 15000));
  
  return expoProcess;
}

// Main function
async function main() {
  try {
    // Prepare files
    ensureLogoExists();
    fixHtmlPaths();
    
    // Serve static files from both locations
    app.use(express.static(path.join(__dirname)));
    app.use('/public', express.static(path.join(__dirname, 'public')));
    
    // Home page route
    app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });
    
    // Test page route to verify the server is running
    app.get('/server-test', (req, res) => {
      res.send(`
        <html><head><title>Server Test</title></head>
        <body>
          <h1>Server is running properly!</h1>
          <p>This confirms that the Express server is working.</p>
          <p><a href="/">Go to home page</a></p>
          <p><a href="/app">Go to app</a></p>
        </body></html>
      `);
    });
    
    // Show environment info for debugging
    app.get('/server-info', (req, res) => {
      res.send(`
        <pre>
Server running on port: ${PORT}
Environment: ${process.env.NODE_ENV}
Headers: ${JSON.stringify(req.headers, null, 2)}
        </pre>
      `);
    });
    
    // Start Expo
    const expoProcess = await startExpoApp();
    
    // Handle all requests to /app/* by proxying to Expo
    // Using a wildcard to capture all sub-routes
    app.all('/app*', (req, res) => {
      const targetUrl = `http://localhost:${EXPO_PORT}`;
      console.log(`Proxying: ${req.method} ${req.url} → ${targetUrl}`);
      
      // Add headers that might be missing from the reverse proxy
      req.headers['host'] = `localhost:${EXPO_PORT}`;
      
      // Proxy the request
      proxy.web(req, res, { 
        target: targetUrl,
        ignorePath: false
      });
    });
    
    // Handle WebSocket connections - critical for hot reloading
    server.on('upgrade', (req, socket, head) => {
      if (req.url.startsWith('/app') || req.url.includes('hot-update') || req.url.includes('sockjs-node')) {
        console.log(`WebSocket upgrade: ${req.url}`);
        proxy.ws(req, socket, head, { 
          target: `http://localhost:${EXPO_PORT}`
        });
      }
    });
    
    // Start the server
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`
==========================================================
Spiritual Condition Tracker Server Running
==========================================================
Server port: ${PORT}
Expo port: ${EXPO_PORT}
Home page: http://localhost:${PORT}/
App: http://localhost:${PORT}/app
Test page: http://localhost:${PORT}/server-test
==========================================================
`);
    });
    
    // Handle graceful shutdown
    process.on('SIGTERM', () => {
      console.log('Shutting down server...');
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