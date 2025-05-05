/**
 * Production server for Spiritual Condition Tracker
 * Uses webpack directly to serve the Expo app web build
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const http = require('http');

// Configuration - must match Apache's proxy target port
const PORT = 3243;
const HOST = '0.0.0.0';
const WEBPACK_PORT = 19006; // Internal webpack port

// Fix minimatch module issues
function fixMinimatchModule() {
  try {
    console.log('Fixing minimatch module...');
    const minimatchPath = path.join(__dirname, 'node_modules', 'minimatch');
    const packageJsonPath = path.join(minimatchPath, 'package.json');
    
    if (fs.existsSync(packageJsonPath)) {
      // Read the package.json
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      
      // Change type from "module" to "commonjs"
      if (packageJson.type === 'module') {
        packageJson.type = 'commonjs';
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
        console.log('Changed minimatch module type to commonjs');
      }
    }
  } catch (err) {
    console.error('Error fixing minimatch module:', err);
  }
}

// Create an HTTP proxy to forward requests to webpack
function createProxyServer(targetPort) {
  console.log(`Creating proxy from port ${PORT} to port ${targetPort}`);
  
  const server = http.createServer((req, res) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    
    // Proxy the request to webpack
    const options = {
      hostname: 'localhost',
      port: targetPort,
      path: req.url,
      method: req.method,
      headers: { ...req.headers, host: `localhost:${targetPort}` }
    };
    
    const proxyReq = http.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res);
    });
    
    proxyReq.on('error', (err) => {
      console.error('Proxy error:', err);
      
      // If connection fails, serve fallback page
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`
        <html>
          <head>
            <title>Spiritual Condition Tracker</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                text-align: center;
                padding: 50px;
                background-color: #f8f9fa;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                background-color: white;
                padding: 30px;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
              }
              h1 { color: #28a745; }
              .error { color: #dc3545; }
              p { margin-bottom: 20px; }
              a { color: #007bff; text-decoration: none; }
              a:hover { text-decoration: underline; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Spiritual Condition Tracker</h1>
              <p>The server is running, but the app is still starting up.</p>
              <p class="error">The application will be available shortly.</p>
              <hr>
              <p><small>Server started at: ${new Date().toISOString()}</small></p>
            </div>
          </body>
        </html>
      `);
    });
    
    // Handle POST/PUT/PATCH request bodies
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      req.pipe(proxyReq);
    } else {
      proxyReq.end();
    }
  });
  
  // Handle WebSocket upgrade for hot reloading
  server.on('upgrade', (req, socket, head) => {
    console.log(`WebSocket upgrade: ${req.url}`);
    
    const options = {
      hostname: 'localhost',
      port: targetPort,
      path: req.url,
      headers: req.headers,
      method: 'GET'
    };
    
    // Update host header
    options.headers.host = `localhost:${targetPort}`;
    
    const proxyReq = http.request(options);
    proxyReq.on('upgrade', (proxyRes, proxySocket, proxyHead) => {
      socket.write(
        `HTTP/1.1 101 Switching Protocols\r\n` +
        `Connection: Upgrade\r\n` +
        `Upgrade: websocket\r\n` +
        `Sec-WebSocket-Accept: ${proxyRes.headers['sec-websocket-accept']}\r\n\r\n`
      );
      
      // Connect sockets
      proxySocket.pipe(socket);
      socket.pipe(proxySocket);
      
      proxySocket.on('error', (err) => {
        console.error('Proxy socket error:', err);
        socket.destroy();
      });
      
      socket.on('error', (err) => {
        console.error('Client socket error:', err);
        proxySocket.destroy();
      });
    });
    
    proxyReq.on('error', (err) => {
      console.error('WebSocket proxy error:', err);
      socket.destroy();
    });
    
    proxyReq.end();
  });
  
  return server;
}

// Start webpack
async function startWebpack() {
  console.log('Starting webpack dev server...');
  
  try {
    // Fix module issues first
    fixMinimatchModule();
    
    // Check if directory exists
    const appDir = path.join(__dirname, 'expo-app');
    if (!fs.existsSync(appDir)) {
      console.error('Error: expo-app directory not found');
      return null;
    }
    
    // Cleanup existing processes
    try {
      console.log('Cleaning up existing processes...');
      spawn('pkill', ['-f', 'expo'], { stdio: 'ignore' });
      spawn('pkill', ['-f', 'webpack'], { stdio: 'ignore' });
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (err) {
      console.log('No processes to clean up');
    }
    
    // Try running webpack directly
    const webpackEnv = {
      ...process.env,
      DANGEROUSLY_DISABLE_HOST_CHECK: 'true',
      SKIP_PREFLIGHT_CHECK: 'true',
      PUBLIC_URL: '/',
      EXPO_NO_DEPENDENCY_VALIDATION: 'true'
    };
    
    // Use webpack-dev-server directly from node_modules
    const webpackProcess = spawn('npx', [
      'webpack-dev-server',
      '--config',
      'node_modules/expo/webpack.config.js',
      '--port',
      WEBPACK_PORT,
      '--history-api-fallback'
    ], {
      cwd: appDir,
      env: webpackEnv,
      stdio: 'inherit'
    });
    
    console.log(`Started webpack with PID ${webpackProcess.pid}`);
    
    webpackProcess.on('close', (code) => {
      console.log(`Webpack process exited with code ${code}`);
      if (code !== 0 && !webpackProcess.killed) {
        console.log('Restarting webpack...');
        setTimeout(() => startWebpack(), 5000);
      }
    });
    
    // Wait for webpack to start
    await new Promise(resolve => setTimeout(resolve, 10000));
    return webpackProcess;
  } catch (err) {
    console.error('Error starting webpack:', err);
    return null;
  }
}

// Start the server
async function main() {
  console.log('Starting server for Spiritual Condition Tracker...');
  
  // Start webpack in the background
  const webpackProcess = await startWebpack();
  
  // Create the proxy server
  const server = createProxyServer(WEBPACK_PORT);
  
  // Start the server
  server.listen(PORT, HOST, () => {
    console.log(`
==========================================================
Spiritual Condition Tracker - Server Running
==========================================================
Main server running on port ${PORT}
Webpack running on port ${WEBPACK_PORT}
Apache should proxy requests to http://localhost:${PORT}
The app should be accessible through your website
==========================================================
    `);
  });
  
  // Handle graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down...');
    if (webpackProcess) {
      webpackProcess.kill();
    }
    server.close(() => {
      console.log('HTTP server closed');
    });
  });
}

// Start everything
main();