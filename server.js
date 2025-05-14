/**
 * Server that serves the landing page at the root and proxies to Expo at /app
 */
const express = require('express');
const http = require('http');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { spawn } = require('child_process');

// Configuration
const PORT = 5000;
const EXPO_PORT = 19006; // Default Expo web port

// Create Express app
const app = express();

// Serve landing page at root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'landing-page.html'));
});

// Serve static files
app.use(express.static(path.join(__dirname)));

// Proxy /app requests to Expo
app.use('/app', createProxyMiddleware({
  target: `http://localhost:${EXPO_PORT}`,
  changeOrigin: true,
  pathRewrite: {
    '^/app': '/'
  },
  onProxyReq: (proxyReq) => {
    // Add Expo platform header
    proxyReq.setHeader('expo-platform', 'web');
  },
  onError: (err, req, res) => {
    console.error('Proxy error:', err);
    
    if (err.code === 'ECONNREFUSED') {
      // Show a waiting page when Expo is starting up
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
      
      res.status(503).send(waitingPage);
    } else {
      res.status(500).send('Proxy error');
    }
  }
}));

// Create HTTP server
const server = http.createServer(app);

// Start Expo development server for web
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