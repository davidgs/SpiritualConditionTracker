/**
 * Simple and reliable server for Spiritual Condition Tracker app
 * This server serves the landing page and proxies requests to the Expo app
 */

const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const http = require('http');
const httpProxy = require('http-proxy');
const fs = require('fs');

// Configuration
const PORT = process.env.PORT || 3243;
const HOST = process.env.HOST || '0.0.0.0';

// Create Express app
const app = express();
const server = http.createServer(app);

// Create a proxy for Expo
const proxy = httpProxy.createProxyServer({
  ws: true,
  changeOrigin: true
});

// Handle proxy errors
proxy.on('error', function(err, req, res) {
  console.error('Proxy error:', err);
  if (!res.headersSent) {
    res.writeHead(500);
    res.end('Proxy error');
  }
});

// Serve static files
app.use(express.static(path.join(__dirname)));
app.use('/public', express.static(path.join(__dirname, 'public')));

// Ensure the logo is available
try {
  // Create public directory if it doesn't exist
  if (!fs.existsSync('public')) {
    fs.mkdirSync('public', { recursive: true });
  }
  
  // Copy logo to public directory
  if (fs.existsSync('logo.jpg')) {
    fs.copyFileSync('logo.jpg', path.join('public', 'logo.jpg'));
    console.log('Logo copied to public directory');
  }
  
  // Fix HTML paths
  const indexPath = path.join(__dirname, 'public', 'index.html');
  if (fs.existsSync(indexPath)) {
    let html = fs.readFileSync(indexPath, 'utf8');
    html = html.replace(/src="[^"]*logo\.jpg"/g, 'src="/logo.jpg"');
    fs.writeFileSync(indexPath, html);
    console.log('Fixed paths in index.html');
  }
} catch (err) {
  console.error('Error with static files:', err);
}

// Start Expo in the background
async function startExpoApp() {
  console.log('Starting Expo app...');
  
  const expoAppDir = path.join(__dirname, 'expo-app');
  if (!fs.existsSync(expoAppDir)) {
    console.error('Error: expo-app directory not found');
    throw new Error('expo-app directory not found');
  }
  
  try {
    console.log('Cleaning up existing processes...');
    spawn('pkill', ['-f', 'npx expo'], { stdio: 'ignore' });
    await new Promise(resolve => setTimeout(resolve, 1000));
  } catch (err) {
    console.log('No processes to clean up');
  }
  
  console.log('Installing minimatch (may be needed)...');
  try {
    // Try to install minimatch separately to fix the missing module error
    spawn('npm', ['install', 'minimatch@^5.1.0', '--no-save'], {
      cwd: __dirname,
      stdio: 'inherit'
    });
    await new Promise(resolve => setTimeout(resolve, 2000));
  } catch (err) {
    console.error('Error installing minimatch:', err);
  }
  
  // Start the Expo process with proper environment variables
  const expoProcess = spawn('npx', [
    'expo',
    'start',
    '--offline',
    '--web',
    '--port',
    '5001'
  ], {
    cwd: expoAppDir,
    env: { 
      ...process.env, 
      CI: '1',
      DANGEROUSLY_DISABLE_HOST_CHECK: 'true',
      PUBLIC_URL: '/'
    },
    stdio: 'pipe'
  });
  
  expoProcess.stdout.on('data', (data) => {
    console.log(`Expo: ${data}`);
  });
  
  expoProcess.stderr.on('data', (data) => {
    console.error(`Expo error: ${data}`);
  });
  
  console.log('Waiting for Expo to start...');
  await new Promise(resolve => setTimeout(resolve, 15000));
  
  return expoProcess;
}

// Main function
async function main() {
  try {
    // Basic home page
    app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });
    
    // Server test page
    app.get('/server-test', (req, res) => {
      res.send(`
        <html>
          <head><title>Server Test</title></head>
          <body>
            <h1>Server is running!</h1>
            <p>Time: ${new Date().toISOString()}</p>
            <p><a href="/">Home</a> | <a href="/app">App</a></p>
          </body>
        </html>
      `);
    });
    
    console.log('Starting Expo app...');
    const expoProcess = await startExpoApp();
    
    // Simple '/app' handler that works without path-to-regexp
    app.use(function(req, res, next) {
      if (req.url.startsWith('/app')) {
        console.log(`Proxying to Expo: ${req.url}`);
        proxy.web(req, res, { target: 'http://localhost:5001' });
      } else {
        next();
      }
    });
    
    // Handle WebSocket connections
    server.on('upgrade', function(req, socket, head) {
      if (req.url.startsWith('/app')) {
        console.log(`WebSocket upgrade: ${req.url}`);
        proxy.ws(req, socket, head, { target: 'http://localhost:5001' });
      }
    });
    
    // Catch-all route for SPA
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });
    
    // Start the server
    server.listen(PORT, HOST, () => {
      console.log(`Server running at http://${HOST}:${PORT}`);
      console.log(`- Home page: http://localhost:${PORT}/`);
      console.log(`- App: http://localhost:${PORT}/app`);
      console.log(`- Test page: http://localhost:${PORT}/server-test`);
    });
  } catch (err) {
    console.error('Server error:', err);
    process.exit(1);
  }
}

// Start the server
main();