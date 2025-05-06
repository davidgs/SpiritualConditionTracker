/**
 * Ultra-minimal HTTP server for Spiritual Condition Tracker
 * No dependencies on Express or other libraries
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

// Configuration
const PORT = 3243;
const PUBLIC_DIR = path.join(__dirname, 'public');
const INDEX_PATH = path.join(PUBLIC_DIR, 'index.html');

// MIME types for different file extensions
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain',
};

// Ensure we have a public directory and index.html
function setupPublicFiles() {
  console.log('Setting up public files...');
  
  // Create public directory if it doesn't exist
  if (!fs.existsSync(PUBLIC_DIR)) {
    fs.mkdirSync(PUBLIC_DIR, { recursive: true });
    console.log(`Created public directory: ${PUBLIC_DIR}`);
  }
  
  // Copy logo to public directory if needed
  const logoSrc = path.join(__dirname, 'logo.jpg');
  const logoDest = path.join(PUBLIC_DIR, 'logo.jpg');
  
  if (fs.existsSync(logoSrc) && !fs.existsSync(logoDest)) {
    fs.copyFileSync(logoSrc, logoDest);
    console.log('Logo copied to public directory');
  }
  
  // Create a simple index.html if it doesn't exist
  if (!fs.existsSync(INDEX_PATH)) {
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Spiritual Condition Tracker</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            text-align: center;
          }
          .logo {
            max-width: 250px;
            margin-bottom: 20px;
          }
          .loading {
            margin: 40px 0;
            font-size: 18px;
          }
          .button {
            display: inline-block;
            background: #4A76A8;
            color: white;
            padding: 12px 24px;
            border-radius: 4px;
            text-decoration: none;
            font-weight: bold;
            margin: 20px 10px;
          }
        </style>
      </head>
      <body>
        <img src="/logo.jpg" alt="Spiritual Condition Tracker" class="logo">
        <h1>Spiritual Condition Tracker</h1>
        <p>A tool for AA members to monitor their spiritual condition and recovery journey.</p>
        
        <div class="loading">
          <p>The Spiritual Condition Tracker app is deployed successfully!</p>
          <p>The server is now running on port ${PORT}.</p>
          <p>Configuration for Apache proxy needs to be updated.</p>
        </div>
        
        <hr>
        <p>For technical support, please contact your administrator.</p>
      </body>
      </html>
    `;
    
    fs.writeFileSync(INDEX_PATH, htmlContent);
    console.log('Created index.html');
  }
}

// Simple function to serve static files
function serveStaticFile(req, res) {
  // Default to index.html
  let filePath = req.url === '/' ? INDEX_PATH : path.join(PUBLIC_DIR, req.url);
  
  // Check if file exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      // File not found, serve index.html instead
      filePath = INDEX_PATH;
    }
    
    // Get the file extension
    const extname = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[extname] || 'text/plain';
    
    // Read and serve the file
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end('Server Error');
        return;
      }
      
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    });
  });
}

// Create the HTTP server
const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);
  serveStaticFile(req, res);
});

// Set up public files
setupPublicFiles();

// Start the server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Super-minimal server running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT}/ in your browser`);
});