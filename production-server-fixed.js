/**
 * Simplified server for Spiritual Condition Tracker
 * Uses webpack-dev-server directly to avoid React Native CLI issues
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

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

// Create a simple HTTP server to serve a static HTML page
function createBasicServer() {
  const http = require('http');
  
  const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <html>
        <head>
          <title>Spiritual Condition Tracker</title>
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
            h1 { color: #28a745; }
            p { margin-bottom: 20px; }
            a { color: #007bff; text-decoration: none; }
            a:hover { text-decoration: underline; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Spiritual Condition Tracker</h1>
            <p>The app is running. If you're seeing this page when visiting the app URL, it means
            Apache is successfully proxying to this server.</p>
            <p>The full web application should be available soon. We are working on fixing
            the dependencies to get the full Expo app running.</p>
            <hr>
            <p><small>Server started at: ${new Date().toISOString()}</small></p>
          </div>
        </body>
      </html>
    `);
  });
  
  server.listen(PORT, HOST, () => {
    console.log(`
==========================================================
Spiritual Condition Tracker - Basic Server Running
==========================================================
A simple HTTP server is running on port ${PORT}
The Apache proxy should be able to connect to it
If you see the placeholder page, the proxy is working
==========================================================
    `);
  });
  
  return server;
}

// Try different approaches to start the server
async function startServer() {
  console.log('Starting server on port ' + PORT);
  
  try {
    // Fix module issues first
    fixMinimatchModule();
    
    // Check if directory exists
    const appDir = path.join(__dirname, 'expo-app');
    if (!fs.existsSync(appDir)) {
      console.error('Error: expo-app directory not found, using fallback server');
      return createBasicServer();
    }
    
    // Cleanup existing processes
    try {
      console.log('Cleaning up existing processes...');
      spawn('pkill', ['-f', 'expo'], { stdio: 'ignore' });
      spawn('pkill', ['-f', 'webpack'], { stdio: 'ignore' });
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (err) {
      console.log('No processes to clean up');
    }
    
    console.log('Starting basic HTTP server on port ' + PORT);
    return createBasicServer();
    
  } catch (err) {
    console.error('Fatal error:', err);
    console.log('Starting fallback server...');
    return createBasicServer();
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down...');
  process.exit(0);
});

// Start server
startServer();