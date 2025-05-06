/**
 * Production server with Apache proxy configuration support
 * This server correctly serves Expo web bundles behind an Apache proxy
 */

const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

// Configuration
const PORT = 3243;
const expoAppDir = path.join(__dirname, 'expo-app');
const publicDir = path.join(__dirname, 'public');

// Run fix-module-error.sh first to fix the module issues
console.log('Fixing module errors before starting Expo...');
try {
  const fixScriptPath = path.join(__dirname, 'fix-module-error.sh');
  if (fs.existsSync(fixScriptPath)) {
    console.log('Running fix-module-error.sh script...');
    execSync(`bash ${fixScriptPath}`, { stdio: 'inherit' });
    console.log('Fix script completed');
  } else {
    console.warn('Warning: fix-module-error.sh script not found');
  }
} catch (err) {
  console.error('Error running fix script:', err.message);
}

// Ensure the Expo directory exists
if (!fs.existsSync(expoAppDir)) {
  console.error(`Error: Expo app directory not found at ${expoAppDir}`);
  process.exit(1);
}

// Create Express server
const app = express();
app.use(cors());

// Serve the public directory for the landing page
if (fs.existsSync(publicDir)) {
  console.log(`Serving static files from ${publicDir}`);
  app.use(express.static(publicDir));
}

// Create a proxy for all Expo web bundles and assets
const proxy = createProxyMiddleware({
  target: 'http://localhost:' + PORT,
  changeOrigin: true,
  ws: true,
  pathRewrite: {
    '^/index.bundle': '/index.bundle',
    '^/assets/': '/assets/'
  },
  onError: (err, req, res) => {
    console.error('Proxy error:', err);
    res.writeHead(500, {
      'Content-Type': 'text/plain'
    });
    res.end('Proxy error: ' + err.message);
  }
});

// Apply the proxy middleware to relevant paths
app.use('/index.bundle', proxy);
app.use('/assets', proxy);

// Create a catch-all route to forward app routes to Expo
app.use('*', proxy);

// Start the proxy server
const server = app.listen(PORT + 1, () => {
  console.log(`Proxy server running on port ${PORT + 1}`);
});

// Clean up any existing processes
try {
  console.log('Cleaning up existing processes...');
  spawn('pkill', ['-f', 'expo'], { stdio: 'ignore' });
} catch (err) {
  // Ignore errors
}

// Set up environment variables for Expo
const env = {
  ...process.env,
  CI: 'false',  // Must be 'false' string to be properly parsed as boolean
  BROWSER: 'none',  // Prevent opening browser
  EXPO_WEB_PORT: PORT.toString(),  // Set explicit web port
  PORT: PORT.toString(),  // For Metro
  EXPO_WEBPACK_PUBLIC_PATH: '/',  // Important: serve assets from root path
  DANGEROUSLY_DISABLE_HOST_CHECK: 'true'  // Allow external connections
};

// Start Expo with web mode on the specified port
console.log(`Running: npx expo start --web --port ${PORT} --host localhost in ${expoAppDir}`);
const expoProcess = spawn('npx', [
  'expo',
  'start',
  '--web',
  '--port',
  PORT.toString(),
  '--host',
  'localhost'  // Use localhost since we're proxying
], {
  cwd: expoAppDir,
  env: env,
  stdio: 'pipe'  // Capture output to see error details
});

console.log(`Started Expo with PID ${expoProcess.pid}`);

// Capture and log all output from Expo
if (expoProcess.stdout) {
  expoProcess.stdout.on('data', (data) => {
    const output = data.toString().trim();
    console.log(`Expo: ${output}`);
    
    // Log if we detect any known error patterns
    if (output.includes('Error:') || output.includes('error:') || 
        output.includes('Cannot find module') || output.includes('ENOENT')) {
      console.error('Error detected in Expo output:', output);
    }
  });
}

if (expoProcess.stderr) {
  expoProcess.stderr.on('data', (data) => {
    const error = data.toString().trim();
    console.error(`Expo error: ${error}`);
  });
}

// Handle process exit
expoProcess.on('close', (code) => {
  console.log(`Expo process exited with code ${code}`);
  
  if (code !== 0) {
    console.log('Expo crashed. Restarting in 5 seconds...');
    setTimeout(() => {
      console.log('Restarting Expo...');
      process.exit(1);  // Exit and let the system restart the process
    }, 5000);
  }
});

// Handle process signals
process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down...');
  expoProcess.kill();
  server.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down...');
  expoProcess.kill();
  server.close();
  process.exit(0);
});

console.log(`
=======================================================
Expo is running on port ${PORT} for the Metro bundler
Proxy server is running on port ${PORT + 1} for Apache to connect to
=======================================================
1. Configure Apache to proxy to: http://localhost:${PORT + 1}
2. Access the app at: https://spiritual-condition.com/
3. All assets will be correctly served with proper paths
=======================================================
`);