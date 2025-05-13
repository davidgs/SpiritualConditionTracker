/**
 * Ultra-simple HTTP server for the Spiritual Condition Tracker
 * Using only the built-in http module to avoid router issues
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 5000;  // Using port 5000 which is accessible from the preview

// Create a simple HTTP server
const server = http.createServer((req, res) => {
  console.log(`Request: ${req.method} ${req.url}`);
  
  // Set CORS headers for all responses
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }
  
  // Simple routing
  if (req.url === '/' || req.url === '/index.html') {
    // Serve main app page
    serveFile('index.html', 'text/html', res);
  } 
  else if (req.url === '/version-injector.js') {
    // Serve the version injector script
    serveFile('web/version-injector.js', 'application/javascript', res);
  }
  else if (req.url === '/app-status') {
    // Serve a status page
    serveStatusPage(res);
  }
  else {
    // Try to serve from web-build directory if it exists
    const webBuildPath = path.join(__dirname, 'web-build', req.url);
    if (fs.existsSync(webBuildPath) && fs.statSync(webBuildPath).isFile()) {
      const contentType = getContentType(req.url);
      serveFile('web-build' + req.url, contentType, res);
    } 
    else {
      // Not found
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
    }
  }
});

// Helper function to serve files
function serveFile(filePath, contentType, res) {
  const fullPath = path.join(__dirname, filePath);
  
  fs.readFile(fullPath, (err, data) => {
    if (err) {
      console.error(`Error reading file ${fullPath}:`, err);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end(`Error reading file: ${err.message}`);
      return;
    }
    
    res.writeHead(200, { 
      'Content-Type': contentType,
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0'
    });
    res.end(data);
  });
}

// Helper function to determine content type
function getContentType(url) {
  const extension = path.extname(url).toLowerCase();
  
  switch (extension) {
    case '.html': return 'text/html';
    case '.js': return 'application/javascript';
    case '.css': return 'text/css';
    case '.json': return 'application/json';
    case '.png': return 'image/png';
    case '.jpg': case '.jpeg': return 'image/jpeg';
    case '.gif': return 'image/gif';
    case '.svg': return 'image/svg+xml';
    case '.ico': return 'image/x-icon';
    case '.ttf': return 'font/ttf';
    case '.woff': return 'font/woff';
    case '.woff2': return 'font/woff2';
    default: return 'text/plain';
  }
}

// Serve a status page that shows version-injector.js status
function serveStatusPage(res) {
  // Read the version-injector.js file
  let versionInjectorContent = "";
  let filePermissions = "";
  
  try {
    const versionInjectorPath = path.join(__dirname, 'web', 'version-injector.js');
    versionInjectorContent = fs.readFileSync(versionInjectorPath, 'utf8');
    
    // Get file permissions
    const { execSync } = require('child_process');
    filePermissions = execSync(`ls -l ${versionInjectorPath}`).toString().trim();
  } catch (err) {
    versionInjectorContent = `Error reading file: ${err.message}`;
    filePermissions = "Unknown";
  }
  
  // Create HTML content
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <title>Spiritual Condition Tracker - Status</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    .status-box {
      background-color: #d4edda;
      border: 1px solid #c3e6cb;
      color: #155724;
      padding: 15px;
      border-radius: 5px;
      margin-bottom: 20px;
    }
    pre {
      background-color: #f8f9fa;
      padding: 10px;
      border-radius: 5px;
      overflow-x: auto;
      white-space: pre-wrap;
    }
  </style>
</head>
<body>
  <h1>Spiritual Condition Tracker</h1>
  
  <div class="status-box">
    <h2>✅ Version Injector Updates Disabled</h2>
    <p>The version-injector.js file has been successfully modified to prevent automatic updates.</p>
  </div>
  
  <h2>Changes Made:</h2>
  <ol>
    <li>Modified run-expo-only.js to use a fixed version string (no timestamps)</li>
    <li>Removed the setInterval that periodically updated the file</li>
    <li>Made the version-injector.js file read-only to prevent modifications</li>
    <li>Disabled version mismatch checking in the client code</li>
  </ol>
  
  <h2>Current File Permissions:</h2>
  <pre>${filePermissions}</pre>
  
  <h2>File Content:</h2>
  <pre>${versionInjectorContent.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
</body>
</html>
  `;
  
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(htmlContent);
}

// Start server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Simple server running at http://0.0.0.0:${PORT}`);
});