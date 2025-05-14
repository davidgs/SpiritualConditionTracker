/**
 * Simple server to check the version-injector.js status
 */

const express = require('express');
const path = require('path');
const fs = require('fs');

// Configuration
const PORT = 5000;

// Create Express app
const app = express();

// Serve status HTML page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'app-status.html'));
});

// Serve the version-injector.js file
app.get('/version-injector.js', (req, res) => {
  const versionFilePath = path.join(__dirname, 'web', 'version-injector.js');
  
  if (fs.existsSync(versionFilePath)) {
    res.sendFile(versionFilePath);
  } else {
    res.status(404).send('Version injector file not found');
  }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Status check server running on http://0.0.0.0:${PORT}`);
});