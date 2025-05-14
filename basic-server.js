/**
 * Basic Express server for Spiritual Condition Tracker
 * This server just serves the landing page and static files
 */
const express = require('express');
const path = require('path');
const { spawn } = require('child_process');

// Create Express app
const app = express();

// Serve static files from the current directory
app.use(express.static(__dirname));

// Serve index.html for all routes for SPA support
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
const PORT = 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});