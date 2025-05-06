/**
 * Simple Production Server for Spiritual Condition Tracker
 * Does not use http-proxy-middleware to avoid pathRegexp.match errors
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const url = require('url');

// Configuration
const PORT = 3243;
const LOG_FILE = path.join(__dirname, 'production-server.log');
const STATIC_DIR = path.join(__dirname, 'static');

// Create static directory if it doesn't exist
if (!fs.existsSync(STATIC_DIR)) {
  fs.mkdirSync(STATIC_DIR, { recursive: true });
}

// Logging function
function log(message, type = 'INFO') {
  const timestamp = new Date().toISOString();
  const formattedMessage = `[${timestamp}][${type}] ${message}`;
  console.log(formattedMessage);
  fs.appendFileSync(LOG_FILE, formattedMessage + '\n');
}

// Create vector icons directory to prevent crashes
function fixVectorIcons() {
  log('Setting up vector icons directory...', 'SETUP');
  const vectorIconsDir = path.join(__dirname, 'node_modules/react-native-vector-icons/Fonts');
  if (!fs.existsSync(vectorIconsDir)) {
    fs.mkdirSync(vectorIconsDir, { recursive: true });
    fs.writeFileSync(path.join(vectorIconsDir, 'FontAwesome.ttf'), '');
    log('Created vector icons directory and empty font file', 'SETUP');
  }
}

// Create a minimal bundle file
function createMinimalBundle() {
  log('Creating minimal bundle file...', 'SETUP');
  const bundleContent = `
// Static bundle for Spiritual Condition Tracker
// This is a fallback bundle - the app will have limited functionality
console.warn('Using static bundle - the app may have limited functionality');

// Initialize minimum required modules
require('react');
require('react-native');
require('expo');

// Let the user know what's happening
console.log('Static bundle loaded successfully. The app is starting in limited mode.');
console.log('Try refreshing the page if you experience issues.');
`;

  const bundlePath = path.join(STATIC_DIR, 'index.bundle');
  fs.writeFileSync(bundlePath, bundleContent);
  log(`Static bundle created at ${bundlePath}`, 'SETUP');
  return bundlePath;
}

// Create and start the main server
function startServer(bundlePath) {
  const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    
    log(`${req.method} ${req.url}`, 'REQUEST');
    
    // Handle bundle requests - serve static bundle
    if (pathname === '/index.bundle' || pathname === '/app/index.bundle') {
      log(`Serving static bundle for ${pathname}`, 'BUNDLE');
      res.writeHead(200, { 'Content-Type': 'application/javascript' });
      fs.createReadStream(bundlePath).pipe(res);
      return;
    }
    
    // Serve basic info page
    if (pathname === '/' || pathname === '/index.html') {
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Spiritual Condition Tracker</title>
          </head>
          <body>
            <h1>Spiritual Condition Tracker</h1>
            <p>Server is running. Access the app at <a href="/app/">/app/</a></p>
          </body>
        </html>
      `;
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(html);
      return;
    }
    
    // Redirect to app path if needed
    if (pathname === '/app') {
      res.writeHead(302, { 'Location': '/app/' });
      res.end();
      return;
    }
    
    // For all other requests, return a simple not found message
    // In a real deployment, nginx would handle this by proxying to the Expo server
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found - Use nginx to proxy to Expo server for full functionality');
  });
  
  server.listen(PORT, '0.0.0.0', () => {
    log(`Server running on port ${PORT}`, 'SERVER');
    log(`Server is accessible at http://localhost:${PORT}/`, 'SERVER');
  });
  
  return server;
}

// Main function
async function main() {
  log('Starting simple production server...', 'STARTUP');
  
  try {
    // Fix common issues
    fixVectorIcons();
    
    // Create the static bundle
    const bundlePath = createMinimalBundle();
    
    // Start the server
    const server = startServer(bundlePath);
    
    log('Simple production server is running!', 'SUCCESS');
    log('The static bundle will be served correctly for nginx.', 'SUCCESS');
    log('For full app functionality, make sure Expo is running separately.', 'INFO');
    
  } catch (error) {
    log(`Fatal error: ${error.message}`, 'ERROR');
    console.error(error);
    process.exit(1);
  }
}

// Handle process termination
process.on('SIGINT', () => {
  log('Shutting down on SIGINT...', 'SHUTDOWN');
  process.exit(0);
});

process.on('SIGTERM', () => {
  log('Shutting down on SIGTERM...', 'SHUTDOWN');
  process.exit(0);
});

// Start the server
main();