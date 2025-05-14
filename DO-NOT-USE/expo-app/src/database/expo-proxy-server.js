/**
 * Proxy Server for Expo Application
 * - Serves the landing page at root
 * - Proxies /app requests to the Expo development server
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Configuration
const PORT = 5000;         // Port for our proxy server
const EXPO_PORT = 19006;   // Default Expo web port

// Create proxy server
const server = http.createServer((req, res) => {
  console.log(`Request: ${req.method} ${req.url}`);
  
  // Serve the original landing page at root
  if (req.url === '/' || req.url === '') {
    console.log('Serving landing page');
    
    const landingPath = path.join(__dirname, 'landing-page.html');
    fs.readFile(landingPath, (err, content) => {
      if (err) {
        console.error(`Error reading landing page: ${err.message}`);
        res.writeHead(500);
        res.end('Error loading landing page');
        return;
      }
      
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(content);
    });
    return;
  }
  
  // Serve static assets at root level (like logo.jpg)
  if (req.url.match(/\.(jpg|jpeg|png|gif|ico|svg)$/i) && !req.url.startsWith('/app')) {
    const filePath = path.join(__dirname, req.url);
    
    console.log(`Serving static file: ${filePath}`);
    
    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
        console.error(`File not found: ${filePath}`);
        res.writeHead(404);
        res.end('File not found');
        return;
      }
      
      fs.readFile(filePath, (err, content) => {
        if (err) {
          console.error(`Error reading file: ${err.message}`);
          res.writeHead(500);
          res.end('Error reading file');
          return;
        }
        
        // Set appropriate content type
        let contentType = 'application/octet-stream';
        if (req.url.match(/\.(jpg|jpeg)$/i)) contentType = 'image/jpeg';
        if (req.url.match(/\.png$/i)) contentType = 'image/png';
        if (req.url.match(/\.gif$/i)) contentType = 'image/gif';
        if (req.url.match(/\.ico$/i)) contentType = 'image/x-icon';
        if (req.url.match(/\.svg$/i)) contentType = 'image/svg+xml';
        
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
      });
    });
    
    return;
  }
  
  // For /app routes, proxy to Expo
  if (req.url.startsWith('/app')) {
    // Transform the path for expo: remove /app prefix, or use / if it's just /app
    const targetPath = req.url === '/app' || req.url === '/app/' 
      ? '/' 
      : req.url.replace(/^\/app/, '');
    
    console.log(`Proxying ${req.url} to Expo at ${targetPath}`);
    
    // Proxy headers setup
    const headers = {
      ...req.headers,
      host: `localhost:${EXPO_PORT}`,
      'expo-platform': 'web',
      'x-forwarded-host': req.headers.host,
      'x-forwarded-proto': 'http'
    };
    
    // Configure proxy request
    const proxyOptions = {
      hostname: 'localhost',
      port: EXPO_PORT,
      path: targetPath,
      method: req.method,
      headers: headers
    };
    
    // Create the proxy request
    const proxyReq = http.request(proxyOptions, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res);
    });
    
    // Handle proxy errors
    proxyReq.on('error', (err) => {
      console.error(`Proxy error: ${err.message}`);
      
      if (err.code === 'ECONNREFUSED') {
        const waitingPage = `
<!DOCTYPE html>
<html>
<head>
  <title>Starting Expo App</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
      background-color: #f5f5f5;
    }
    .container {
      text-align: center;
      padding: 2rem;
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      max-width: 500px;
    }
    .spinner {
      width: 40px;
      height: 40px;
      margin: 0 auto 20px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #3498db;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    h2 {
      color: #2c3e50;
      margin-top: 0;
    }
    p {
      color: #7f8c8d;
      line-height: 1.5;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="spinner"></div>
    <h2>Starting Expo App</h2>
    <p>The Expo development server is starting up...</p>
    <p>This page will automatically refresh in a few seconds.</p>
    
    <script>
      // Refresh the page after 3 seconds
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    </script>
  </div>
</body>
</html>`;
        
        res.writeHead(503, { 'Content-Type': 'text/html' });
        res.end(waitingPage);
      } else {
        res.writeHead(500);
        res.end('Proxy Error: ' + err.message);
      }
    });
    
    // Forward request body for POST, PUT, etc.
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      req.pipe(proxyReq);
    } else {
      proxyReq.end();
    }
    
    return;
  }
  
  // Default 404 for any other routes
  res.writeHead(404);
  res.end('Not Found');
});

// Start the Expo development server in the background
console.log('Starting Expo development server...');
const expoProcess = spawn('npx', ['expo', 'start', '--web', '--port', EXPO_PORT.toString()], {
  stdio: 'pipe',
  env: {
    ...process.env,
    EXPO_WEB_PORT: EXPO_PORT.toString(),
    BROWSER: 'none'
  }
});

// Log Expo output
expoProcess.stdout.on('data', (data) => {
  const output = data.toString().trim();
  console.log(`[Expo] ${output}`);
});

expoProcess.stderr.on('data', (data) => {
  const output = data.toString().trim();
  console.error(`[Expo Error] ${output}`);
});

// Start the proxy server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Proxy server running on port ${PORT}`);
  console.log(`Landing page: http://localhost:${PORT}/`);
  console.log(`Expo app: http://localhost:${PORT}/app`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  
  // Kill the Expo process
  expoProcess.kill();
  
  server.close(() => {
    console.log('Server stopped');
    process.exit(0);
  });
});