/**
 * Simple and reliable server for Spiritual Condition Tracker app
 * This server serves the landing page and proxies requests to the Expo app
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const httpProxy = require('http-proxy');

// Configuration
const PORT = 5000;
const EXPO_PORT = 19006; // Default Expo web port

// Create a proxy server instance
const proxy = httpProxy.createProxyServer({});

// Add error handler
proxy.on('error', (err, req, res) => {
  console.error('Proxy error:', err);
  
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
    <h2>Starting the app...</h2>
    <p>Please wait while the Expo development server starts. This page will automatically refresh.</p>
    
    <script>
      // Refresh the page after 5 seconds
      setTimeout(() => {
        window.location.reload();
      }, 5000);
    </script>
  </div>
</body>
</html>`;
    
    res.writeHead(503, { 'Content-Type': 'text/html' });
    res.end(waitingPage);
  } else {
    res.writeHead(500);
    res.end('Proxy error');
  }
});

// Create HTTP server
const server = http.createServer((req, res) => {
  console.log(`Request: ${req.url}`);
  
  // Serve landing page at root
  if (req.url === '/' || req.url === '') {
    console.log('Serving landing page');
    
    fs.readFile(path.join(__dirname, 'landing-page.html'), (err, content) => {
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
  
  // Serve static assets at the root
  if (req.url.endsWith('.jpg') || req.url.endsWith('.png') || req.url.endsWith('.ico')) {
    const filePath = path.join(__dirname, req.url);
    
    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
        res.writeHead(404);
        res.end('File not found');
        return;
      }
      
      fs.readFile(filePath, (err, content) => {
        if (err) {
          res.writeHead(500);
          res.end('Error reading file');
          return;
        }
        
        let contentType = 'application/octet-stream';
        if (req.url.endsWith('.jpg') || req.url.endsWith('.jpeg')) contentType = 'image/jpeg';
        if (req.url.endsWith('.png')) contentType = 'image/png';
        if (req.url.endsWith('.ico')) contentType = 'image/x-icon';
        
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
      });
    });
    
    return;
  }
  
  // Proxy requests to /app path to Expo
  if (req.url.startsWith('/app')) {
    console.log(`Proxying ${req.url} to Expo`);
    
    // Rewrite path to remove /app prefix
    const targetUrl = req.url.replace(/^\/app/, '') || '/';
    
    // Add Expo platform header
    req.headers['expo-platform'] = 'web';
    
    // Forward the request to Expo
    proxy.web(req, res, { 
      target: `http://localhost:${EXPO_PORT}`,
      ignorePath: true,
      changeOrigin: true
    });
    
    return;
  }
  
  // Default 404 response
  res.writeHead(404);
  res.end('Not found');
});

// Start Expo development server
async function startExpoApp() {
  console.log('Starting Expo development server...');
  
  const expo = spawn('npx', ['expo', 'start', '--web', '--non-interactive'], {
    stdio: 'pipe',
    env: {
      ...process.env,
      BROWSER: 'none',
      EXPO_WEB_PORT: EXPO_PORT.toString()
    }
  });
  
  expo.stdout.on('data', (data) => {
    console.log(`[Expo] ${data.toString().trim()}`);
  });
  
  expo.stderr.on('data', (data) => {
    console.error(`[Expo Error] ${data.toString().trim()}`);
  });
  
  // Clean up on exit
  process.on('SIGINT', () => {
    console.log('Shutting down Expo...');
    expo.kill();
    process.exit(0);
  });
}

// Start everything
async function main() {
  // Start the Expo development server first
  await startExpoApp();
  
  // Then start our HTTP server
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Landing page at http://localhost:${PORT}/`);
    console.log(`App at http://localhost:${PORT}/app`);
  });
}

main().catch(err => {
  console.error('Server error:', err);
  process.exit(1);
});