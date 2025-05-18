/**
 * Enhanced server specifically optimized for iOS WebView compatibility
 * Addresses common issues with blank screens in iOS simulators
 */

const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 5000;

// Special header middleware for iOS compatibility
app.use((req, res, next) => {
  // Set headers that work better with iOS WebViews
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
  
  // Log request for debugging
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  
  next();
});

// Serve static files with proper MIME types that iOS recognizes
app.use(express.static('.', {
  setHeaders: (res, filePath) => {
    // Set correct MIME types for different file extensions
    // This is crucial for iOS WebViews to properly interpret files
    const ext = path.extname(filePath).toLowerCase();
    switch (ext) {
      case '.js':
        res.setHeader('Content-Type', 'application/javascript');
        break;
      case '.css':
        res.setHeader('Content-Type', 'text/css');
        break;
      case '.json':
        res.setHeader('Content-Type', 'application/json');
        break;
      case '.png':
        res.setHeader('Content-Type', 'image/png');
        break;
      case '.jpg':
      case '.jpeg':
        res.setHeader('Content-Type', 'image/jpeg');
        break;
      case '.svg':
        res.setHeader('Content-Type', 'image/svg+xml');
        break;
      case '.html':
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        break;
    }
  }
}));

// Enhanced path handling for iOS capacitor paths
app.get('/app/*', (req, res) => {
  // Remove the /app prefix and serve from root
  const actualPath = req.path.replace(/^\/app\//, '/');
  console.log(`iOS path remapping: ${req.path} -> ${actualPath}`);
  
  // First try to serve from root
  const filePath = path.join(__dirname, actualPath);
  if (fs.existsSync(filePath)) {
    return res.sendFile(filePath);
  }
  
  // Then try to serve from /dist if root fails
  const distPath = path.join(__dirname, 'dist', actualPath);
  if (fs.existsSync(distPath)) {
    return res.sendFile(distPath);
  }
  
  // Finally fallback to index.html for SPA routing
  console.log(`File not found, serving index.html instead of ${req.path}`);
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Special route for capacitor plugins
app.get('/plugins/*', (req, res) => {
  console.log(`iOS plugin request: ${req.path}`);
  // Capacitor plugins are always served from index.html in our setup
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Default route handler - serves index.html for SPA
app.get('*', (req, res) => {
  console.log(`Serving index.html for path: ${req.path}`);
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Enhanced iOS server running on port ${PORT}`);
  console.log(`App available at http://localhost:${PORT}/`);
});