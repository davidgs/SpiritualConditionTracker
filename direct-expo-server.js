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

// Our server will handle both the landing page and the Expo app
const server = http.createServer((req, res) => {
  // Parse the URL to handle routes properly
  const parsedUrl = url.parse(req.url, true);
  let targetPath = parsedUrl.path;
  
  // Serve our custom landing page for the root route only
  if ((targetPath === '/' || targetPath === '') && !req.url.startsWith('/app')) {
    const landingPagePath = path.join(__dirname, 'landing-page.html');
    
    fs.readFile(landingPagePath, (err, content) => {
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
  
  // Check if this is a static asset request
  if (targetPath.endsWith('.jpg') || targetPath.endsWith('.png') || 
      targetPath.endsWith('.ico') || targetPath.endsWith('.svg')) {
    const assetPath = path.join(__dirname, targetPath);
    
    // Try to serve the file if it exists
    fs.access(assetPath, fs.constants.F_OK, (err) => {
      if (!err) {
        const contentType = getContentType(targetPath);
        fs.readFile(assetPath, (err, content) => {
          if (err) {
            res.writeHead(500);
            res.end('Error loading asset');
            return;
          }
          
          res.writeHead(200, { 'Content-Type': contentType });
          res.end(content);
        });
        return;
      }
      
      // Otherwise proxy to Expo
      proxyToExpo(req, res, targetPath);
    });
    
    return;
  }
  
  // Check if this is an /app route - serve our app.html for the main route
  if (req.url === '/app' || req.url === '/app/') {
    // Use our custom app.html for the main /app route
    const appPagePath = path.join(__dirname, 'app.html');
    
    fs.readFile(appPagePath, (err, content) => {
      if (err) {
        res.writeHead(500);
        res.end('Error loading app page');
        return;
      }
      
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(content);
    });
    
    return;
  }
  
  // Special handling for app assets requested from /app/
  if (req.url.startsWith('/app/static/') || 
      req.url.startsWith('/app/assets/') ||
      req.url.startsWith('/app/manifest')) {
      
    // Strip the /app prefix and proxy to appropriate route
    targetPath = targetPath.replace(/^\/app/, '');
    console.log(`App asset ${req.url} -> ${targetPath}`);
    
    // Add special header to ensure we're requesting the app and not the landing page
    req.headers['x-requested-app'] = 'true';
    req.headers['expo-platform'] = 'web';
    proxyToExpo(req, res, targetPath);
    return;
  }
  
  // For all other /app/* routes, proxying to root path in Expo
  if (req.url.startsWith('/app/')) {
    // Add special header to ensure we're requesting the app and not the landing page
    req.headers['x-requested-app'] = 'true';
    req.headers['expo-platform'] = 'web';
    
    // Map to root path with platform parameter
    targetPath = '/?platform=web';
    console.log(`App route ${req.url} -> ${targetPath}`);
    
    proxyToExpo(req, res, targetPath);
    return;
  }
  
  // Default: proxy to Expo
  proxyToExpo(req, res, targetPath);
});

// Helper function to determine content type of static assets
function getContentType(filePath) {
  if (filePath.endsWith('.html')) return 'text/html';
  if (filePath.endsWith('.css')) return 'text/css';
  if (filePath.endsWith('.js')) return 'application/javascript';
  if (filePath.endsWith('.json')) return 'application/json';
  if (filePath.endsWith('.png')) return 'image/png';
  if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) return 'image/jpeg';
  if (filePath.endsWith('.svg')) return 'image/svg+xml';
  if (filePath.endsWith('.ico')) return 'image/x-icon';
  return 'text/plain';
}

// Helper function to proxy requests to Expo
function proxyToExpo(req, res, targetPath) {
  // Ensure the platform query parameter is added if not already present
  if (targetPath.indexOf('?') === -1) {
    targetPath += '?platform=web';
  } else if (!targetPath.includes('platform=')) {
    targetPath += '&platform=web';
  }
  
  const options = {
    hostname: 'localhost',
    port: WEBPACK_PORT,
    path: targetPath,
    method: req.method,
    headers: {
      ...req.headers,
      host: `localhost:${WEBPACK_PORT}`,
      'expo-platform': 'web',  // This is the key header Expo requires
      'x-forwarded-proto': 'http'
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
}

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