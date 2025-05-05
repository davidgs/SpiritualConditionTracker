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

// Configuration
const PORT = process.env.PORT || 5000; // Set to port 5000 for Replit testing
const EXPO_PORT = 5001;

// Create Express app and server
const app = express();
const server = http.createServer(app);

// Create a simple proxy for Expo
const proxy = httpProxy.createProxyServer({
  ws: true,
  changeOrigin: true
});

// Fix common proxy errors
proxy.on('error', (err, req, res) => {
  console.error(`Proxy error: ${err}`);
  if (!res.headersSent && res.writeHead) {
    res.writeHead(500);
    res.end(`Proxy error: ${err.message}`);
  }
});

// Fix paths in HTML files to handle proxy issues
function fixHtmlPaths() {
  try {
    const indexPath = path.join(__dirname, 'public', 'index.html');
    if (fs.existsSync(indexPath)) {
      let html = fs.readFileSync(indexPath, 'utf8');
      
      // Fix relative paths
      html = html.replace(/src="(?!http|\/)/g, 'src="/');
      html = html.replace(/href="(?!http|\/|#)/g, 'href="/');
      
      // Fix logo path specifically
      html = html.replace(/src="[^"]*logo\.jpg"/g, 'src="/logo.jpg"');
      
      fs.writeFileSync(indexPath, html);
      console.log('Fixed paths in index.html');
    }
  } catch (err) {
    console.error('Error fixing HTML paths:', err);
  }
}

// Copy logo to both locations to ensure it's available
try {
  if (fs.existsSync('logo.jpg')) {
    fs.copyFileSync('logo.jpg', path.join('public', 'logo.jpg'));
    console.log('Copied logo to public directory');
  }
} catch (err) {
  console.error('Error copying logo:', err);
}

// Start Expo in the background
async function startExpoApp() {
  console.log('Starting Expo app...');
  
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
  
  // Prepare Expo environment
  const expoEnv = { 
    ...process.env, 
    CI: '1',
    DANGEROUSLY_DISABLE_HOST_CHECK: 'true',
    PUBLIC_URL: '/'
  };
  
  // Start Expo with troubleshooting flags
  const expoProcess = spawn('npx', [
    'expo',
    'start',
    '--offline',
    '--web',
    '--port',
    EXPO_PORT
  ], {
    cwd: expoAppDir,
    env: expoEnv,
    stdio: 'pipe'  // Capture output
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
  
  // Wait for Expo to start
  console.log('Waiting for Expo to start...');
  await new Promise(resolve => setTimeout(resolve, 15000));
  
  return expoProcess;
}

// Main function
async function main() {
  try {
    // Fix HTML paths
    fixHtmlPaths();
    
    // Serve static files - this comes first
    app.use(express.static(path.join(__dirname)));
    app.use('/public', express.static(path.join(__dirname, 'public')));
    
    // Basic routes without complex patterns
    
    // Home page
    app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });
    
    // Start Expo
    const expoProcess = await startExpoApp();
    
    // Super simple proxy approach that avoids URL pattern complexities
    app.all('/app*', (req, res) => {
      console.log(`Proxying to Expo: ${req.url}`);
      proxy.web(req, res, { 
        target: `http://localhost:${EXPO_PORT}`,
        ignorePath: false
      });
    });
    
    // Handle WebSocket connections
    server.on('upgrade', (req, socket, head) => {
      if (req.url.startsWith('/app')) {
        console.log('Proxying WebSocket connection to Expo');
        proxy.ws(req, socket, head, { 
          target: `http://localhost:${EXPO_PORT}`
        });
      }
    });
    
    // Start the server
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`- Home page: http://localhost:${PORT}/`);
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