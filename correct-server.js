/**
 * Server for Spiritual Condition Tracker
 * Serves landing page at root and proxies to Expo at /app
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Configuration
const PORT = 5000;
const EXPO_PORT = 19006; // Default Expo web port

// Start the Expo development server
function startExpo() {
  console.log('Starting Expo development server...');
  
  // Check if we're running in development or production
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Start Expo with appropriate options
  const expoProcess = spawn('npx', [
    'expo',
    'start',
    '--web',
    '--non-interactive',
    '--port', '3243', // Use a different port for the native app
    isProduction ? '--no-dev' : ''
  ], {
    stdio: 'pipe',
    env: {
      ...process.env,
      BROWSER: 'none', // Don't open a browser window
      EXPO_WEB_PORT: EXPO_PORT.toString()
    }
  });
  
  // Log Expo output
  expoProcess.stdout.on('data', (data) => {
    console.log(`[Expo] ${data.toString().trim()}`);
  });
  
  expoProcess.stderr.on('data', (data) => {
    console.error(`[Expo Error] ${data.toString().trim()}`);
  });
  
  return expoProcess;
}

// Function to proxy requests to the Expo server
function proxyToExpo(req, res, targetPath) {
  // Set up the options for the proxy request
  const options = {
    hostname: 'localhost',
    port: EXPO_PORT,
    path: targetPath,
    method: req.method,
    headers: {
      ...req.headers,
      host: `localhost:${EXPO_PORT}`,
      'expo-platform': 'web'
    }
  };
  
  console.log(`Proxying ${req.url} to Expo at ${targetPath}`);
  
  // Create the proxy request
  const proxyReq = http.request(options, (proxyRes) => {
    // Copy the status code and headers
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    
    // Pipe the response from Expo to our response
    proxyRes.pipe(res);
  });
  
  // Handle errors in the proxy
  proxyReq.on('error', (err) => {
    console.error(`Proxy error: ${err.message}`);
    
    if (err.code === 'ECONNREFUSED') {
      // If Expo isn't ready yet, show a waiting page
      const waitingPage = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Waiting for App</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
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
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
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
          .counter {
            margin-top: 20px;
            font-size: 14px;
            color: #95a5a6;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="spinner"></div>
          <h2>Starting the Application</h2>
          <p>The React Native app is starting up. This page will automatically refresh when it's ready.</p>
          <p class="counter">Checking connection... <span id="count">1</span></p>
          
          <script>
            let count = 1;
            const countEl = document.getElementById('count');
            
            function checkApp() {
              count++;
              countEl.textContent = count;
              
              fetch(window.location.href)
                .then(response => {
                  if (response.status === 200) {
                    window.location.reload();
                  } else {
                    setTimeout(checkApp, 2000);
                  }
                })
                .catch(() => {
                  setTimeout(checkApp, 2000);
                });
            }
            
            setTimeout(checkApp, 2000);
          </script>
        </div>
      </body>
      </html>
      `;
      
      res.writeHead(503, { 'Content-Type': 'text/html' });
      res.end(waitingPage);
    } else {
      // For any other error
      res.writeHead(500);
      res.end(`Server error: ${err.message}`);
    }
  });
  
  // If this is a POST or PUT request, pipe the request body
  if (req.method === 'POST' || req.method === 'PUT') {
    req.pipe(proxyReq);
  } else {
    proxyReq.end();
  }
}

// Start the Expo server
const expoProcess = startExpo();

// Create our HTTP server
const server = http.createServer((req, res) => {
  // Log the request
  console.log(`Received request: ${req.url}`);
  
  // Handle the root route - serve the landing page
  if (req.url === '/' || req.url === '') {
    const landingPagePath = path.join(__dirname, 'landing-page.html');
    
    fs.readFile(landingPagePath, (err, content) => {
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
  
  // Handle /app routes - proxy to Expo
  if (req.url === '/app' || req.url === '/app/' || req.url.startsWith('/app/')) {
    // Convert /app path to root path for Expo
    let targetPath = req.url;
    
    if (req.url === '/app' || req.url === '/app/') {
      targetPath = '/';
    } else {
      targetPath = req.url.replace(/^\/app/, '');
    }
    
    proxyToExpo(req, res, targetPath);
    return;
  }
  
  // Handle static assets at root level
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
        
        let contentType = 'image/jpeg';
        if (req.url.endsWith('.png')) contentType = 'image/png';
        if (req.url.endsWith('.ico')) contentType = 'image/x-icon';
        
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
      });
    });
    return;
  }
  
  // Default - 404 Not Found
  res.writeHead(404);
  res.end('Not Found');
});

// Start the server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Landing page available at http://localhost:${PORT}/`);
  console.log(`App available at http://localhost:${PORT}/app/`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  
  if (expoProcess) {
    console.log('Stopping Expo process...');
    expoProcess.kill();
  }
  
  server.close(() => {
    console.log('Server stopped');
    process.exit(0);
  });
});