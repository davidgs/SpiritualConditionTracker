/**
 * Basic Express server for Spiritual Condition Tracker
 * This server just serves the landing page and static files
 */

const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Serve static files from the public directory
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname)));

// Root route - serve the landing page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Basic server running on port ${PORT}`);
  console.log(`Landing page available at: http://localhost:${PORT}/`);
});