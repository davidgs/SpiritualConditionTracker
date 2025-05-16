/**
 * Simple Express server for the Spiritual Condition Tracker app
 */

const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for all routes
app.use(cors());

// Disable caching for development
app.use((req, res, next) => {
  res.header('Cache-Control', 'no-cache');
  next();
});

// Serve static files from the app/build directory
app.use(express.static(path.join(__dirname, 'app/build')));

// Serve the app at /app route and any subroutes
app.get('/app*', (req, res) => {
  res.sendFile(path.join(__dirname, 'app/build/index.html'));
});

// Serve the landing page at root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'app/landing-page.html'));
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`App available at http://localhost:${PORT}/app`);
});