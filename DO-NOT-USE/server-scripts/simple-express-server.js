/**
 * Express server for the Spiritual Condition Tracker app
 */

const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 5000;

// No caching for development
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

// Serve static files from app directory
app.use('/app/dist', express.static(path.join(__dirname, 'app/dist')));
app.use('/app/src', express.static(path.join(__dirname, 'app/src')));
app.use('/app/assets', express.static(path.join(__dirname, 'app/assets')));
app.use('/app', express.static(path.join(__dirname, 'app')));

// Serve logo for landing page
app.use('/logo.jpg', express.static(path.join(__dirname, 'logo.jpg')));

// Root path - serve landing page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'app/landing-page.html'));
});

// App route - serve the app
app.get('/app', (req, res) => {
  res.sendFile(path.join(__dirname, 'app/index.html'));
});

// For client-side routing, send the app for any path starting with /app/
app.get('/app/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'app/index.html'));
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Express server running at http://localhost:${PORT}/`);
  console.log(`App available at http://localhost:${PORT}/app`);
});