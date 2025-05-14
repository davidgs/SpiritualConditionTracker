/**
 * Server that serves the landing page at the root and proxies to Expo at /app
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Configuration
const PORT = 5000;
const EXPO_PORT = 19006; // Default Expo web port

// Create our server
const server = http.createServer((req, res) => {
  console.log(`Request: ${req.url}`);
  
  // Serve landing page at the root path
  if (req.url === '/' || req.url === '') {
    console.log('Serving landing page');
    
    const landingPath = path.join(__dirname, 'landing-page.html');
    fs.readFile(landingPath, (err, content) => {
      if (err) {
        res.writeHead(500);
        res.end('Error loading landing page');
        return;
      }
      
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(content);
    });
    return;
  }
  
  // Serve static assets at the root level
  if (req.url.endsWith('.jpg') || req.url.endsWith('.png') || 
      req.url.endsWith('.ico') || req.url.includes('/assets/')) {
      
    // Try to serve file directly from the filesystem
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
        
        // Set appropriate content type
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
  
  // For all /app routes, proxy to the Expo development server
  if (req.url.startsWith('/app')) {
    const targetUrl = req.url.replace(/^\/app/, '');
    console.log(`Proxying ${req.url} to Expo at ${targetUrl || '/'}`);
    
    const options = {
      hostname: 'localhost',
      port: EXPO_PORT,
      path: targetUrl || '/',
      method: req.method,
      headers: {
        ...req.headers,
        host: `localhost:${EXPO_PORT}`,
        'x-forwarded-host': req.headers.host,
        'x-forwarded-proto': 'http',
        'expo-platform': 'web'
      }
    };
    
    // Create proxy request
    const proxyReq = http.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res);
    });
    
    // Handle errors
    proxyReq.on('error', (err) => {
      console.error(`Proxy error: ${err.message}`);
      
      if (err.code === 'ECONNREFUSED') {
        const waitingPage = `
<!DOCTYPE html>
<html>
<head>
  <title>Connecting to App</title>
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
    <p>Please wait while the development server starts. This page will automatically refresh.</p>
    
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
        res.end('Server error');
      }
    });
    
    // If this is a POST request, pipe the request body
    if (req.method === 'POST') {
      req.pipe(proxyReq);
    } else {
      proxyReq.end();
    }
    
    return;
  }
  
  // Default 404 response
  res.writeHead(404);
  res.end('Not found');
});

// Start the Expo development server
console.log('Starting Expo development server...');
const expo = spawn('npx', ['expo', 'start', '--web'], {
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

// Start the server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Landing page at http://localhost:${PORT}/`);
  console.log(`App at http://localhost:${PORT}/app`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  
  // Kill the Expo process
  expo.kill();
  
  server.close(() => {
    console.log('Server stopped');
    process.exit(0);
  });
});