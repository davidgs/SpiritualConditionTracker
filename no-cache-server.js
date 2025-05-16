/**
 * Simple Express server that serves the app with proper cache control
 * to prevent caching issues during development
 */

const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Use CORS middleware
app.use(cors());

// Set no-cache headers for all responses
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
  next();
});

// Serve static files from the built app directory
app.use(express.static(path.join(__dirname, 'app/build'), {
  etag: false,
  lastModified: false
}));

// Redirect root to app path
app.get('/', (req, res) => {
  res.redirect('/app');
});

// Serve the app's HTML for any path under /app
app.get('/app/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'app/build/index.html'));
});

// Also serve the app's HTML for the /app route itself
app.get('/app', (req, res) => {
  res.sendFile(path.join(__dirname, 'app/build/index.html'));
});

// Serve the landing page
app.get('/landing', (req, res) => {
  res.sendFile(path.join(__dirname, 'app/landing-page.html'));
});

// Fallback handler for any other routes
app.use((req, res) => {
  console.log(`Requested path not found: ${req.path}`);
  
  // Check if this is an API request or a page request
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  // For non-API requests, serve the landing page as a fallback
  res.status(200).sendFile(path.join(__dirname, 'app/landing-page.html'));
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT}/app to access the application`);
  console.log(`Landing page is available at http://localhost:${PORT}/landing`);
});