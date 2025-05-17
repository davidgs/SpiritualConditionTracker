/**
 * Express server optimized for iOS compatibility
 * Serves files with path structures that work with Capacitor on iOS
 */

const express = require('express');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

// Run path patch first
console.log('Running iOS path patch...');
try {
  execSync('node ios-paths-patch.js', { stdio: 'inherit' });
} catch (error) {
  console.error('Error running iOS path patch:', error.message);
}

const app = express();
const PORT = process.env.PORT || 5001;

// CORS headers for all responses
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  
  // Handle OPTIONS method for CORS preflight
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

// Cache control headers to prevent browser caching
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

// Log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Special handling for Capacitor URLs
app.get('/capacitor://localhost/*', (req, res) => {
  // Extract the path after the capacitor://localhost/
  const urlParts = req.url.split('/capacitor://localhost/');
  if (urlParts.length < 2) {
    return res.status(404).send('Invalid capacitor URL');
  }
  
  // Serve the file from the root directory
  const filePath = path.join(__dirname, urlParts[1]);
  res.sendFile(filePath);
});

// Serve static files from the app directory
app.use(express.static(path.join(__dirname, 'app')));

// Redirect root to app path
app.get('/', (req, res) => {
  res.redirect('/app');
});

// For app routes (non-asset URLs), serve the app HTML
app.get('/app/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'app/index.html'));
});

// Also serve the app's HTML for the /app route itself
app.get('/app', (req, res) => {
  res.sendFile(path.join(__dirname, 'app/index.html'));
});

// Serve the landing page
app.get('/landing', (req, res) => {
  res.sendFile(path.join(__dirname, 'app/landing-page.html'));
});

// Special handling for the chunk files that Capacitor tries to load
app.get('/app/dist/*.bundle.js', (req, res) => {
  const chunkFile = path.basename(req.url);
  const filePath = path.join(__dirname, 'app/dist', chunkFile);
  
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).send(`Chunk file not found: ${chunkFile}`);
  }
});

// Fallback for any other path
app.use((req, res) => {
  // For non-API requests, serve the app HTML as a fallback
  res.sendFile(path.join(__dirname, 'app/index.html'));
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`iOS-optimized server is running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT}/app to access the application`);
  console.log(`Landing page is available at http://localhost:${PORT}/landing`);
});