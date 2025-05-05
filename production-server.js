/**
 * Production-ready server for Spiritual Condition Tracker
 * Designed to work reliably with Apache reverse proxy
 */

const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const http = require('http');
const httpProxy = require('http-proxy');
const fs = require('fs');

// Configuration
const PORT = process.env.PORT || 3243; // Use 3243 for your server
const EXPO_PORT = 5001;
const HOST = process.env.HOST || '0.0.0.0';

// Create Express app
const app = express();

// Create HTTP server
const server = http.createServer(app);

// Create a proxy server for Expo with settings for reverse proxy
const proxy = httpProxy.createProxyServer({
  ws: true,
  changeOrigin: true,
  xfwd: true,     // Forward the client IP
  secure: false   // Don't verify SSL certs
});

// Handle proxy errors
proxy.on('error', (err, req, res) => {
  console.error('Proxy error:', err);
  if (res && !res.headersSent && res.writeHead) {
    res.writeHead(500);
    res.end(`Proxy error: ${err.message}`);
  }
});

// Configure Express middleware - serve static files
app.use(express.static(path.join(__dirname)));
app.use('/public', express.static(path.join(__dirname, 'public')));

// Custom middleware to log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Fix for logo in HTML file and ensure it exists in both locations
function fixLogoPath() {
  try {
    // Copy logo to ensure it's in both locations
    if (fs.existsSync('logo.jpg')) {
      if (!fs.existsSync('public')) {
        fs.mkdirSync('public', { recursive: true });
      }
      fs.copyFileSync('logo.jpg', path.join('public', 'logo.jpg'));
      console.log('Logo copied to public directory');
    }
    
    const indexPath = path.join(__dirname, 'public', 'index.html');
    if (fs.existsSync(indexPath)) {
      let content = fs.readFileSync(indexPath, 'utf8');
      
      // Fix the logo path to be absolute
      content = content.replace(/src="[^"]*logo\.jpg"/g, 'src="/logo.jpg"');
      
      // Make all resource paths absolute
      content = content.replace(/src="(?!http|\/)/g, 'src="/');
      content = content.replace(/href="(?!http|\/|#)/g, 'href="/');
      
      fs.writeFileSync(indexPath, content);
      console.log('Fixed paths in index.html');
    } else {
      console.error('Could not find index.html to fix paths');
    }
  } catch (err) {
    console.error('Error fixing paths:', err);
  }
}

// Skip using Expo and just serve the landing page
function skipExpo() {
  console.log('==============================================');
  console.log('NOTICE: Running in landing-page-only mode');
  console.log('The app functionality will not be available');
  console.log('Only the landing page will be served');
  console.log('==============================================');
  return null;
}

// Start Expo in the background
async function startExpoApp() {
  console.log('Starting Expo app...');
  
  // Just return the skip function
  return skipExpo();
}

// Main function to start everything
async function main() {
  try {
    // Fix logo path in HTML
    fixLogoPath();
    
    // Serve the landing page at root
    app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });
    
    // Add a simple test page to verify server is working
    app.get('/server-test', (req, res) => {
      res.send(`
        <html><head><title>Server Test</title></head>
        <body>
          <h1>Server is running properly!</h1>
          <p>This confirms that the Express server is working.</p>
          <p><a href="/">Go to home page</a></p>
          <p><a href="/app">Go to app</a></p>
          <p>Server time: ${new Date().toISOString()}</p>
        </body></html>
      `);
    });
    
    // Add debug route to show headers
    app.get('/debug-headers', (req, res) => {
      res.send(`
        <pre>
Server running on port: ${PORT}
Environment: ${process.env.NODE_ENV}
Headers: ${JSON.stringify(req.headers, null, 2)}
        </pre>
      `);
    });
    
    // Start Expo in the background
    const expoProcess = await startExpoApp();
    
    // Create a simple app unavailable message
    app.get('/app*', (req, res) => {
      res.send(`
        <html>
          <head>
            <title>App Temporarily Unavailable</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                text-align: center;
                padding: 50px;
                background-color: #f8f9fa;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                background-color: white;
                padding: 30px;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
              }
              h1 { color: #dc3545; }
              a { color: #007bff; text-decoration: none; }
              a:hover { text-decoration: underline; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>App Temporarily Unavailable</h1>
              <p>The app is currently being upgraded. Please check back later.</p>
              <p>In the meantime, you can visit the <a href="/">home page</a>.</p>
              <hr>
              <p><small>Server time: ${new Date().toISOString()}</small></p>
            </div>
          </body>
        </html>
      `);
    });
    
    // Catch-all route to handle all other routes
    app.get('*', (req, res, next) => {
      // Otherwise serve the landing page
      res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });
    
    // Start the server
    server.listen(PORT, HOST, () => {
      console.log(`
==========================================================
Spiritual Condition Tracker Server Running
==========================================================
Server port: ${PORT}
Expo port: ${EXPO_PORT}
Landing page: http://localhost:${PORT}/
App: http://localhost:${PORT}/app
Server test: http://localhost:${PORT}/server-test
Debug headers: http://localhost:${PORT}/debug-headers
==========================================================
      `);
    });
    
    // Handle graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM received, shutting down...');
      if (expoProcess) {
        console.log('Terminating Expo process...');
        expoProcess.kill();
      }
      server.close(() => {
        console.log('HTTP server closed');
      });
    });
    
  } catch (err) {
    console.error('Fatal server error:', err);
    process.exit(1);
  }
}

// Start everything
main();