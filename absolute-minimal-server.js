/**
 * Extremely simple HTTP server with no dependencies
 * Only serves the landing page static files
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

// Configuration
const PORT = 3243;
const HOST = '0.0.0.0';

// MIME types
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

// Simple request handler
const server = http.createServer((req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  
  // Parse URL
  let url = req.url;
  
  // Normalize URL
  if (url === '/') {
    url = '/public/index.html';
  } else if (url.startsWith('/app')) {
    // Serve a simple app unavailable page
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
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
    return;
  } else if (url === '/logo.jpg') {
    // Special handling for logo
    url = '/public/logo.jpg';
  } else if (url === '/server-test') {
    // Test page
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <html>
        <head><title>Server Test</title></head>
        <body>
          <h1>Server is working!</h1>
          <p>Time: ${new Date().toISOString()}</p>
          <p><a href="/">Home</a> | <a href="/app">App</a></p>
        </body>
      </html>
    `);
    return;
  }
  
  // Resolve file path
  const filePath = path.join(__dirname, url);
  const extname = path.extname(filePath);
  
  // Set content type
  const contentType = MIME_TYPES[extname] || 'application/octet-stream';
  
  // Read file
  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // If file not found, try serving index.html
        fs.readFile(path.join(__dirname, 'public', 'index.html'), (err, content) => {
          if (err) {
            res.writeHead(404);
            res.end('File not found');
          } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(content);
          }
        });
      } else {
        // Server error
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      // Success
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

// Before starting, ensure the logo is copied to public directory
try {
  console.log('Ensuring logo is available...');
  
  // Create public directory if it doesn't exist
  if (!fs.existsSync('public')) {
    fs.mkdirSync('public', { recursive: true });
    console.log('Created public directory');
  }
  
  // Copy logo to public directory if needed
  if (fs.existsSync('logo.jpg') && !fs.existsSync(path.join('public', 'logo.jpg'))) {
    fs.copyFileSync('logo.jpg', path.join('public', 'logo.jpg'));
    console.log('Copied logo to public directory');
  }
  
  // Ensure index.html exists
  if (!fs.existsSync(path.join('public', 'index.html'))) {
    console.error('Error: public/index.html not found');
    console.error('Please ensure this file exists before starting the server');
    process.exit(1);
  }
  
  // Fix logo paths in index.html
  let html = fs.readFileSync(path.join('public', 'index.html'), 'utf8');
  html = html.replace(/src="[^"]*logo\.jpg"/g, 'src="/logo.jpg"');
  fs.writeFileSync(path.join('public', 'index.html'), html);
  console.log('Fixed paths in index.html');
  
} catch (err) {
  console.error('Error preparing files:', err);
}

// Start server
server.listen(PORT, HOST, () => {
  console.log(`
========================================================
Minimal Landing Page Server
========================================================
Server running at http://${HOST}:${PORT}
- Home page: http://localhost:${PORT}/
- App page (unavailable): http://localhost:${PORT}/app
- Test page: http://localhost:${PORT}/server-test
========================================================
  `);
});