/**
 * Ultra minimal server for Spiritual Condition Tracker
 * Creates a static landing page for Apache to serve
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

// Configuration - must match Apache's proxy target port
const PORT = 3243;
const HOST = '0.0.0.0';

// Create a web-build directory if it doesn't exist
const buildDir = path.join(__dirname, 'web-build');
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir, { recursive: true });
  console.log('Created web-build directory');
}

// Create simple index.html
const indexPath = path.join(buildDir, 'index.html');
fs.writeFileSync(indexPath, `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Spiritual Condition Tracker</title>
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
    .logo {
      max-width: 150px;
      margin: 0 auto 20px;
      display: block;
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

// Copy logo if it exists
const logoSrc = path.join(__dirname, 'logo.jpg');
if (fs.existsSync(logoSrc)) {
  const logoDest = path.join(buildDir, 'logo.jpg');
  fs.copyFileSync(logoSrc, logoDest);
  console.log('Copied logo to build directory');
}

// Create server to serve static files
const server = http.createServer((req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  
  // Parse URL
  let url = req.url;
  if (url === '/' || url === '/app' || url === '/app/') {
    url = '/index.html';
  }
  
  // Serve files from the build directory
  const filePath = path.join(buildDir, url.replace(/^\//, ''));
  const extname = path.extname(filePath) || '.html';
  const contentType = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
  }[extname] || 'application/octet-stream';
  
  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // File not found, serve index.html (SPA fallback)
        fs.readFile(indexPath, (err, content) => {
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

// Start the server
server.listen(PORT, HOST, () => {
  console.log(`
==========================================================
Spiritual Condition Tracker - Static Server Running
==========================================================
Static server is running on port ${PORT}
Apache should proxy requests to http://localhost:${PORT}
The app should be accessible through your website
==========================================================
  `);
});