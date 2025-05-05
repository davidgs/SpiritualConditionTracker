/**
 * Very simple deployment server for Spiritual Condition Tracker
 * Designed for port 3243 in your environment
 */

const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const http = require('http');
const httpProxy = require('http-proxy');
const fs = require('fs');

// Configuration
const PORT = 3243; // Your specific port
const EXPO_PORT = 5001;

// Create Express app and server
const app = express();
const server = http.createServer(app);

// Create a proxy for Expo
const proxy = httpProxy.createProxyServer({
  ws: true,
  changeOrigin: true
});

// Basic error handling
proxy.on('error', (err, req, res) => {
  console.error(`Proxy error: ${err.message}`);
  if (res && res.writeHead) {
    res.writeHead(500);
    res.end(`Proxy error: ${err.message}`);
  }
});

// Serve static files - add this before any routes
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname)));

// Start Expo in the background
async function startExpo() {
  console.log('Starting Expo...');
  
  const expoAppDir = path.join(__dirname, 'expo-app');
  if (!fs.existsSync(expoAppDir)) {
    console.error('Error: expo-app directory not found');
    throw new Error('expo-app directory not found');
  }
  
  // Kill any existing processes
  try {
    console.log('Cleaning up existing processes...');
    spawn('pkill', ['-f', 'npx expo'], { stdio: 'ignore' });
    await new Promise(resolve => setTimeout(resolve, 1000));
  } catch (err) {
    console.log('No processes to clean up');
  }
  
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
  
  // Wait for Expo to start
  console.log('Waiting for Expo to start (15 seconds)...');
  await new Promise(resolve => setTimeout(resolve, 15000));
  
  return expoProcess;
}

// Main function
async function main() {
  try {
    // Home page route
    app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });
    
    // Start Expo
    const expoProcess = await startExpo();
    
    // Very simple '/app' proxy - all requests with /app go to Expo
    app.all('/app', (req, res) => {
      console.log('Proxying /app to Expo...');
      proxy.web(req, res, { target: `http://localhost:${EXPO_PORT}` });
    });
    
    // Simple WebSocket handling
    server.on('upgrade', (req, socket, head) => {
      console.log('WebSocket connection received');
      proxy.ws(req, socket, head, { target: `http://localhost:${EXPO_PORT}` });
    });
    
    // Start the server
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`- Home: http://localhost:${PORT}/`);
      console.log(`- App: http://localhost:${PORT}/app`);
    });
    
    // Handle graceful shutdown
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