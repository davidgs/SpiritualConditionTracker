/**
 * Production-ready server for Spiritual Condition Tracker
 * Pure Node.js - No dependencies on Express or other modules
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

// Configuration
const PORT = process.env.PORT || 3243;
const HOST = '0.0.0.0';

// MIME types for static files
const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain',
};

// Ensure logo is in place and fix HTML paths
function prepareFiles() {
  try {
    console.log('Preparing files...');
    
    // Create public directory if needed
    const publicDir = path.join(__dirname, 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
      console.log('Created public directory');
    }
    
    // Copy logo to public directory if it exists
    const logoSrc = path.join(__dirname, 'logo.jpg');
    const logoDest = path.join(publicDir, 'logo.jpg');
    if (fs.existsSync(logoSrc) && !fs.existsSync(logoDest)) {
      fs.copyFileSync(logoSrc, logoDest);
      console.log('Logo copied to public directory');
    }
    
    // Fix paths in index.html if it exists
    const indexPath = path.join(publicDir, 'index.html');
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
      console.error('Warning: index.html not found in public directory');
    }
  } catch (err) {
    console.error('Error preparing files:', err);
  }
}

// Serve a static file
function serveFile(res, filePath, contentType) {
  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        console.error(`File not found: ${filePath}`);
        res.writeHead(404);
        res.end('File not found');
      } else {
        console.error(`Error reading file: ${filePath}`, err);
        res.writeHead(500);
        res.end('Server error');
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
}

// Serve the index.html file
function serveIndex(res) {
  const filePath = path.join(__dirname, 'public', 'index.html');
  serveFile(res, filePath, 'text/html');
}

// Create a professional-looking app status page
function serveAppStatusPage(res) {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Spiritual Condition Tracker</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
          }
          .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          header {
            background-color: #007bff;
            color: white;
            padding: 20px;
            text-align: center;
            margin-bottom: 30px;
          }
          h1 {
            margin: 0;
            font-size: 24px;
          }
          .card {
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            padding: 20px;
            margin-bottom: 20px;
          }
          h2 {
            color: #333;
            margin-top: 0;
          }
          .feature-list {
            list-style-type: none;
            padding: 0;
          }
          .feature-list li {
            padding: 10px 0;
            border-bottom: 1px solid #eee;
            display: flex;
            align-items: center;
          }
          .feature-list li:last-child {
            border-bottom: none;
          }
          .feature-list li:before {
            content: "✓";
            color: #28a745;
            margin-right: 10px;
            font-weight: bold;
          }
          footer {
            text-align: center;
            padding: 20px;
            color: #666;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <header>
          <h1>Spiritual Condition Tracker</h1>
        </header>
        
        <div class="container">
          <div class="card">
            <h2>App Status</h2>
            <p>The app is being prepared for deployment. Our team is working on making the full application available shortly.</p>
            <p>In the meantime, this page confirms that your server is running correctly and is accessible through your domain.</p>
          </div>
          
          <div class="card">
            <h2>Key Features</h2>
            <ul class="feature-list">
              <li>Track your spiritual fitness score</li>
              <li>Log meetings, readings, and meditations</li>
              <li>Record interactions with sponsors and sponsees</li>
              <li>Discover nearby AA members</li>
              <li>Manage your meeting list</li>
              <li>Secure messaging with other members</li>
            </ul>
          </div>
          
          <div class="card">
            <h2>Coming Soon</h2>
            <p>The full interactive web application will be available at this URL. Please check back soon!</p>
          </div>
        </div>
        
        <footer>
          <p>Spiritual Condition Tracker &copy; ${new Date().getFullYear()}</p>
          <p>Server started: ${new Date().toISOString()}</p>
        </footer>
      </body>
    </html>
  `);
}

// Serve a server test page
function serveTestPage(res) {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Server Test</title>
        <meta charset="utf-8">
      </head>
      <body>
        <h1>Server is running properly!</h1>
        <p>This confirms that the server is working correctly.</p>
        <p><a href="/">Go to home page</a></p>
        <p><a href="/app">Go to app</a></p>
        <p>Server time: ${new Date().toISOString()}</p>
      </body>
    </html>
  `);
}

// Serve a debug headers page
function serveDebugPage(req, res) {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Debug Headers</title>
        <meta charset="utf-8">
      </head>
      <body>
        <h1>Server Debug Info</h1>
        <pre>
Server running on port: ${PORT}
Environment: ${process.env.NODE_ENV || 'development'}
Request URL: ${req.url}
Request Method: ${req.method}
Headers: ${JSON.stringify(req.headers, null, 2)}
        </pre>
      </body>
    </html>
  `);
}

// Start the HTTP server
function startServer() {
  // Prepare files first
  prepareFiles();
  
  // Create the server
  const server = http.createServer((req, res) => {
    // Log the request
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    
    // Parse the URL
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathname = url.pathname;
    
    // Route based on pathname
    if (pathname === '/' || pathname === '/index.html') {
      // Serve the landing page
      serveIndex(res);
    } 
    else if (pathname === '/server-test') {
      // Serve the test page
      serveTestPage(res);
    } 
    else if (pathname === '/debug-headers') {
      // Serve the debug page
      serveDebugPage(req, res);
    } 
    else if (pathname.startsWith('/app')) {
      // Serve the app status page for any app routes
      serveAppStatusPage(res);
    } 
    else if (pathname === '/logo.jpg') {
      // Serve the logo
      const filePath = path.join(__dirname, 'public', 'logo.jpg');
      serveFile(res, filePath, 'image/jpeg');
    } 
    else {
      // Try to serve a static file
      const filePath = path.join(__dirname, 'public', pathname.substring(1));
      const extname = path.extname(filePath);
      const contentType = MIME_TYPES[extname] || 'application/octet-stream';
      
      // Check if file exists
      fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
          // File not found, serve landing page as fallback
          serveIndex(res);
        } else {
          // File exists, serve it
          serveFile(res, filePath, contentType);
        }
      });
    }
  });
  
  // Start listening for requests
  server.listen(PORT, HOST, () => {
    console.log(`
==========================================================
Spiritual Condition Tracker Server Running
==========================================================
Server port: ${PORT}
Landing page: http://${HOST}:${PORT}/
App: http://${HOST}:${PORT}/app (Status Page)
Server test: http://${HOST}:${PORT}/server-test
Debug headers: http://${HOST}:${PORT}/debug-headers
==========================================================
    `);
  });
  
  // Handle graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down...');
    server.close(() => {
      console.log('HTTP server closed');
    });
  });
  
  return server;
}

// Start the server
startServer();