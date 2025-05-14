/**
 * Direct React Native Web Server for Spiritual Condition Tracker
 * This bypasses Expo development server completely
 */

const express = require('express');
const path = require('path');
const { spawn } = require('child_process');

// Configuration
const PORT = 5000;
const app = express();

// Serve static files from the web-build directory
app.use(express.static(path.join(__dirname, 'web-build')));

// Default route handler
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'web-build', 'index.html'));
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://localhost:${PORT}`);
  
  // Build the web version first
  console.log('Building web version...');
  const build = spawn('npx', [
    'expo',
    'export:web'
  ], {
    stdio: 'inherit'
  });
  
  build.on('exit', (code) => {
    if (code === 0) {
      console.log('Web build completed successfully');
    } else {
      console.error(`Web build failed with code ${code}`);
    }
  });
});