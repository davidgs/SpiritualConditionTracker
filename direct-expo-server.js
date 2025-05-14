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
  
  // Serve our custom landing page for the root route only - but not for app.html requests
  if ((targetPath === '/' || targetPath === '') && !req.url.startsWith('/app') && !req.url.includes('app.html')) {
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
  
  // Handle /app route by serving the actual Expo app
  if (req.url === '/app' || req.url === '/app/') {
    console.log(`Proxying app request to Expo at ${req.url}`);
    
    // Add the correct platform header for Expo
    req.headers['expo-platform'] = 'web';
    
    // Proxy to Expo index.html
    const expoPath = '/';
    proxyToExpo(req, res, expoPath);
    return;
  }
  
  // For all /app paths, proxy to Expo with the correct platform header
  if (req.url.startsWith('/app/') && !req.url.startsWith('/app/api/')) {
    // Strip the /app prefix and proxy to Expo
    const expoPath = req.url.replace(/^\/app/, '');
    console.log(`Proxying app request ${req.url} to Expo at ${expoPath}`);
    
    // Add the correct platform header for Expo
    req.headers['expo-platform'] = 'web';
    
    // Proxy to Expo
    proxyToExpo(req, res, expoPath);
    return;
  }
  
  // For specific API routes within /app/ - handled separately to add specific headers
  if (req.url.startsWith('/app/api/')) {
    // Strip the /app prefix and proxy to appropriate route
    targetPath = targetPath.replace(/^\/app/, '');
    console.log(`App API route ${req.url} -> ${targetPath}`);
    
    // Add special header to ensure we're requesting the app and not the landing page
    req.headers['x-requested-app'] = 'true';
    req.headers['expo-platform'] = 'web';
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
  // Don't add platform parameters as they're causing issues with Expo server
  
  const options = {
    hostname: 'localhost',
    port: WEBPACK_PORT,
    path: targetPath,
    method: req.method,
    headers: {
      ...req.headers,
      host: `localhost:${WEBPACK_PORT}`,
      // Use either ios or android as the platform for Native Expo requests
      // 'expo-platform': 'ios',
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
      // Create a temporary HTML page that will retry automatically
      const retryHtml = `
<!DOCTYPE html>
<html>
<head>
  <title>Connecting to Expo...</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      margin: 0;
      background-color: #f5f5f5;
    }
    .container {
      text-align: center;
      padding: 2rem;
      max-width: 500px;
    }
    .spinner {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #3498db;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    h2 {
      color: #2c3e50;
      margin-bottom: 1rem;
    }
    p {
      color: #7f8c8d;
      margin-bottom: 1.5rem;
    }
    .retry-counter {
      font-size: 0.8rem;
      color: #95a5a6;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="spinner"></div>
    <h2>Connecting to the Application</h2>
    <p>The application server is starting up. This page will automatically reconnect when it's ready.</p>
    <div class="retry-counter">Retry attempt: <span id="count">1</span></div>
  </div>

  <script>
    let count = 1;
    const countEl = document.getElementById('count');
    
    // Retry connection every 2 seconds
    function retryConnection() {
      count++;
      countEl.textContent = count;
      
      // Fetch the current URL
      fetch(window.location.href)
        .then(response => {
          if (response.status === 200) {
            // If successful, reload the page
            window.location.reload();
          } else {
            // Try again in 2 seconds
            setTimeout(retryConnection, 2000);
          }
        })
        .catch(error => {
          // Error connecting, try again in 2 seconds
          setTimeout(retryConnection, 2000);
        });
    }
    
    // Start the retry process after 3 seconds
    setTimeout(retryConnection, 3000);
  </script>
</body>
</html>
      `;
      
      res.writeHead(503, { 'Content-Type': 'text/html' });
      res.end(retryHtml);
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