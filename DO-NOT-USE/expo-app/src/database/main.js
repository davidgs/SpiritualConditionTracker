/**
 * Main deployment server for Spiritual Condition Tracker
 * This server serves our Expo app and handles all incoming requests
 */

const express = require('express');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Set up static file serving from the root directory
app.use(express.static(path.join(__dirname)));

// Serve the landing page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the Expo app
function startExpoApp() {
  console.log('Starting Expo app...');
  
  // Ensure the expo-app directory exists
  if (!fs.existsSync(path.join(__dirname, 'expo-app'))) {
    console.error('expo-app directory not found!');
    return null;
  }

  // Start the Expo process
  const expoProcess = spawn('npx', ['expo', 'start', '--offline', '--web', '--port', '5001', '--non-interactive'], {
    cwd: path.join(__dirname, 'expo-app'),
    stdio: 'pipe'
  });

  expoProcess.stdout.on('data', (data) => {
    console.log(`Expo: ${data}`);
  });

  expoProcess.stderr.on('data', (data) => {
    console.error(`Expo error: ${data}`);
  });

  expoProcess.on('close', (code) => {
    console.log(`Expo process exited with code ${code}`);
  });

  return expoProcess;
}

// Set up a proxy to the Expo app
app.use('/app', (req, res) => {
  // Redirect to the Expo app
  res.redirect('http://localhost:5001');
});

// Start the server
const server = app.listen(PORT, () => {
  console.log(`Deployment server running on port ${PORT}`);
  
  // Start the Expo app in the background
  const expoProcess = startExpoApp();
  
  // Handle server shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down...');
    server.close();
    if (expoProcess) {
      expoProcess.kill();
    }
  });
});