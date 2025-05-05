/**
 * Build script for Spiritual Condition Tracker
 * This script builds the web version and serves it statically
 */

const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const http = require('http');

// Configuration - must match Apache's proxy target port
const PORT = 3243;
const HOST = '0.0.0.0';

// Fix minimatch module issues
function fixMinimatchModule() {
  try {
    console.log('Fixing minimatch module...');
    const minimatchPath = path.join(__dirname, 'node_modules', 'minimatch');
    const packageJsonPath = path.join(minimatchPath, 'package.json');
    
    if (fs.existsSync(packageJsonPath)) {
      // Read the package.json
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      
      // Change type from "module" to "commonjs"
      if (packageJson.type === 'module') {
        packageJson.type = 'commonjs';
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
        console.log('Changed minimatch module type to commonjs');
      }
    }
  } catch (err) {
    console.error('Error fixing minimatch module:', err);
  }
}

// Try to build the web app
async function buildWebApp() {
  try {
    console.log('Building web app...');
    
    // Check if expo-app directory exists
    const appDir = path.join(__dirname, 'expo-app');
    if (!fs.existsSync(appDir)) {
      console.error('Error: expo-app directory not found');
      return false;
    }
    
    // Create a build directory if it doesn't exist
    const buildDir = path.join(__dirname, 'web-build');
    if (!fs.existsSync(buildDir)) {
      fs.mkdirSync(buildDir, { recursive: true });
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
    
    console.log('Created static web build');
    return true;
  } catch (err) {
    console.error('Error building web app:', err);
    return false;
  }
}

// Create a simple HTTP server to serve the static web app
function createStaticServer(buildDir) {
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
          fs.readFile(path.join(buildDir, 'index.html'), (err, content) => {
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
  
  return server;
}

// Start everything
async function main() {
  try {
    console.log('Starting Spiritual Condition Tracker server...');
    
    // Fix minimatch module
    fixMinimatchModule();
    
    // Build the web app
    const buildSuccess = await buildWebApp();
    if (!buildSuccess) {
      console.error('Error building the web app. Will serve placeholder page.');
    }
    
    // Get the build directory
    const buildDir = path.join(__dirname, 'web-build');
    
    // Create and start the static server
    const server = createStaticServer(buildDir);
    server.listen(PORT, HOST, () => {
      console.log(`
==========================================================
Spiritual Condition Tracker - Static Server Running
==========================================================
Static server running on port ${PORT}
Apache should proxy requests to http://localhost:${PORT}
The app should be accessible through your website
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
    
  } catch (err) {
    console.error('Fatal error:', err);
    process.exit(1);
  }
}

// Run main
main();