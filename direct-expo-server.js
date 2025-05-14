/**
 * Direct server on port 5000 - modified to serve index.html without starting Expo
 */

const http = require('http');
const path = require('path');
const fs = require('fs');
const url = require('url');

// Configuration for direct access
const PORT = 5000;
const WEBPACK_PORT = 19006; // Not used, but kept for compatibility

// No Expo server is started, we'll just serve static content

// Our server will handle both the landing page and the Expo app
const server = http.createServer((req, res) => {
  // Parse the URL to handle routes properly
  const parsedUrl = url.parse(req.url, true);
  let targetPath = parsedUrl.path;
  
  // Serve our custom landing page for the root route only - but not for app.html requests
  if ((targetPath === '/' || targetPath === '') && !req.url.startsWith('/app') && !req.url.includes('app.html')) {
    const indexPath = path.join(__dirname, 'index.html');
    
    fs.readFile(indexPath, (err, content) => {
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
  
  // Handle /app route with a simple app placeholder
  if (req.url === '/app' || req.url === '/app/') {
    console.log(`Serving app at ${req.url}`);
    
    // Create a simplified app placeholder
    const appHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Spiritual Condition Tracker</title>
  <style>
    body, html {
      height: 100%;
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #f5f5f5;
      color: #333;
    }
    .app-container {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
    header {
      background-color: #3498db;
      color: white;
      padding: 16px;
      text-align: center;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .content {
      flex: 1;
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }
    .card {
      background-color: white;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    footer {
      background-color: #34495e;
      color: white;
      padding: 16px;
      text-align: center;
    }
    .status {
      padding: 16px;
      margin: 20px 0;
      background-color: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
      border-radius: 4px;
      text-align: center;
    }
    h1 { margin: 0; font-size: 24px; }
    h2 { margin-top: 0; color: #2c3e50; }
    p { line-height: 1.6; }
    .counter {
      display: flex;
      justify-content: space-around;
      margin-top: 20px;
      text-align: center;
    }
    .counter-item {
      padding: 10px;
    }
    .counter-value {
      font-size: 36px;
      font-weight: bold;
      color: #3498db;
    }
    .counter-label {
      font-size: 14px;
      color: #7f8c8d;
      margin-top: 5px;
    }
  </style>
</head>
<body>
  <div class="app-container">
    <header>
      <h1>Spiritual Condition Tracker</h1>
    </header>
    
    <div class="content">
      <div class="status">
        <strong>Development Mode:</strong> This is a preview of the application. The Expo development server is not running.
      </div>
      
      <div class="card">
        <h2>Recovery Dashboard</h2>
        <p>Welcome to your spiritual condition tracker. This application helps you monitor your recovery journey and track your spiritual fitness.</p>
        
        <div class="counter">
          <div class="counter-item">
            <div class="counter-value">2.45</div>
            <div class="counter-label">Years Sober</div>
          </div>
          <div class="counter-item">
            <div class="counter-value">128</div>
            <div class="counter-label">Meetings Attended</div>
          </div>
          <div class="counter-item">
            <div class="counter-value">85%</div>
            <div class="counter-label">Spiritual Fitness</div>
          </div>
        </div>
      </div>
      
      <div class="card">
        <h2>Development Notes</h2>
        <p>The full application cannot be displayed because the Expo development server is not running properly. This is a placeholder interface showing the basic concept of the application.</p>
        <p>To run the full application, please resolve the webpack dependency issues or run the application on a physical device using the Expo Go app.</p>
      </div>
    </div>
    
    <footer>
      Spiritual Condition Tracker - AA Recovery App
    </footer>
  </div>
</body>
</html>`;
    
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(appHtml);
    return;
  }
  
  // Handle static assets from the /app path
  if (req.url.startsWith('/app/')) {
    // Extract the file path by removing the /app prefix
    const filePath = req.url.replace(/^\/app\//, '');
    const fullPath = path.join(__dirname, 'static-bundle', filePath);
    
    console.log(`Serving static file: ${fullPath}`);
    
    // Check if the file exists
    fs.access(fullPath, fs.constants.F_OK, (err) => {
      if (err) {
        console.error(`Static file not found: ${fullPath}`);
        res.writeHead(404);
        res.end('File not found');
        return;
      }
      
      // Read and serve the file
      fs.readFile(fullPath, (err, content) => {
        if (err) {
          console.error(`Error reading file: ${err.message}`);
          res.writeHead(500);
          res.end('Error reading file');
          return;
        }
        
        const contentType = getContentType(fullPath);
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
      });
    });
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
  // Add expo-platform header to help with routing
  const options = {
    hostname: 'localhost',
    port: WEBPACK_PORT,
    path: targetPath,
    method: req.method,
    headers: {
      ...req.headers,
      host: `localhost:${WEBPACK_PORT}`,
      'expo-platform': 'web',
      'x-forwarded-proto': 'http'
    }
  };

  console.log(`Proxying request ${req.url} to Expo at ${targetPath}`);

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
      // Show a basic loading page that auto-refreshes
      const loadingPage = `
<!DOCTYPE html>
<html>
<head>
  <title>Loading Application</title>
  <meta http-equiv="refresh" content="5">
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
  </style>
</head>
<body>
  <div class="container">
    <div class="spinner"></div>
    <h2>Starting Application</h2>
    <p>Please wait while the application loads. This page will refresh automatically every 5 seconds.</p>
  </div>
</body>
</html>`;
      
      res.writeHead(503, { 'Content-Type': 'text/html' });
      res.end(loadingPage);
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