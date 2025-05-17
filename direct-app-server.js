const express = require('express');
const path = require('path');
const app = express();
const port = 5002; // New port to avoid conflicts

// Disable caching for development
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  next();
});

// Serve static files from various directories
app.use('/app/dist', express.static(path.join(__dirname, 'app/dist')));
app.use('/app/src', express.static(path.join(__dirname, 'app/src')));
app.use('/app/assets', express.static(path.join(__dirname, 'app/assets')));
app.use('/app', express.static(path.join(__dirname, 'app')));

// Serve the landing page at root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'app/landing-page.html'));
});

// Serve the SQLite loader
app.get('/app/sqliteLoader.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'app/sqliteLoader.js'));
});

// Serve the app
app.get('/app', (req, res) => {
  res.sendFile(path.join(__dirname, 'app/index.html'));
});

// For client-side routing, send the app HTML for any route starting with /app/
app.get('/app/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'app/index.html'));
});

// Start the server
app.listen(port, '0.0.0.0', () => {
  console.log(`Direct App Server running at http://localhost:${port}`);
  console.log(`App available at http://localhost:${port}/app`);
});