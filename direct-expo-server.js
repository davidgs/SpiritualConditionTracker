/**
 * Direct Expo server on port 5000 with header fix
 * This is a minimal wrapper to make the expo-platform header work correctly
 */

const http = require('http');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const url = require('url');

// Configuration for direct access
const PORT = 5000;
const WEBPACK_PORT = 19006;

// Spawn Expo in the background
console.log('Starting Expo bundler in the background...');

// Start Expo web on port 19006
const expo = spawn('npx', [
  'expo',
  'start',
  '--web',
  '--no-dev',
  '--port', '3243', // Use a different port for native, we'll use webpack port
  '--host', '0.0.0.0'
], {
  stdio: 'inherit',
  env: {
    ...process.env,
    BROWSER: 'none',
    CI: '1',
    EXPO_WEB_PORT: WEBPACK_PORT.toString(),
    PUBLIC_URL: '',
    BASE_PATH: ''
  }
});

console.log(`Started Expo on webpack port ${WEBPACK_PORT}`);

// Create a custom route for serving the app bundle at /app
const APP_BUNDLE_PATH = path.join(__dirname, 'index.html');

// Our proxy server will add the expo-platform header
const server = http.createServer((req, res) => {
  // Parse the URL to handle routes properly
  const parsedUrl = url.parse(req.url, true);
  let targetPath = parsedUrl.path;
  
  // Special handling for /app route - serve the main app
  if (targetPath === '/app' || targetPath === '/app/') {
    console.log('Serving app bundle at /app');
    try {
      // Read index.html and serve it
      const indexContent = fs.readFileSync(APP_BUNDLE_PATH, 'utf8');
      
      // Update asset paths to use absolute URLs
      const modifiedContent = indexContent
        .replace(/src="\/static\//g, `src="http://localhost:${WEBPACK_PORT}/static/`)
        .replace(/href="\/static\//g, `href="http://localhost:${WEBPACK_PORT}/static/`);
        
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(modifiedContent);
      return;
    } catch (err) {
      console.error(`Error serving app bundle: ${err.message}`);
      res.writeHead(500);
      res.end(`Failed to serve app: ${err.message}`);
      return;
    }
  }
  
  // For other paths that start with /app/
  if (targetPath.startsWith('/app/')) {
    // Strip the /app prefix for assets and API calls
    targetPath = targetPath.replace(/^\/app/, '');
    console.log(`App asset/API request ${req.url} -> ${targetPath}`);
  }
  
  const options = {
    hostname: 'localhost',
    port: WEBPACK_PORT,
    path: targetPath,
    method: req.method,
    headers: {
      ...req.headers,
      host: `localhost:${WEBPACK_PORT}`,
      'expo-platform': 'web'  // This is the key header Expo requires
    }
  };

  console.log(`Proxying request ${req.url} to ${targetPath}`);

  // Create proxy request
  const proxyReq = http.request(options, (proxyRes) => {
    // Copy all response headers
    Object.keys(proxyRes.headers).forEach(key => {
      res.setHeader(key, proxyRes.headers[key]);
    });
    res.writeHead(proxyRes.statusCode);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    console.error(`Proxy error for ${req.url}: ${err.message}`);
    
    if (err.code === 'ECONNREFUSED') {
      // Expo is still starting up
      res.writeHead(503);
      res.end('Expo is starting up, please try again in a moment...');
    } else {
      res.writeHead(500);
      res.end(`Server error: ${err.message}`);
    }
  });

  // Forward POST/PUT body
  if (req.method === 'POST' || req.method === 'PUT') {
    req.pipe(proxyReq);
  } else {
    proxyReq.end();
  }
});

// Listen on port 5000
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Forwarding requests to Expo web on port ${WEBPACK_PORT}`);
  console.log(`Access the app at http://localhost:${PORT}/`);
  console.log(`Alternative route at http://localhost:${PORT}/app/`);
});

// Handle cleanup
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  expo.kill();
  server.close();
  process.exit(0);
});