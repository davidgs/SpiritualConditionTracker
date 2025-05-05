/**
 * Proxy server for Spiritual Condition Tracker application
 * 
 * This server redirects all requests to our main.js deployment server
 * It's designed to work with Replit deployments
 */

const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Start our main deployment server
function startMainServer() {
  console.log('Starting main deployment server...');
  
  // Check if the main.js file exists
  const mainJsPath = path.join(__dirname, '..', 'main.js');
  if (!fs.existsSync(mainJsPath)) {
    console.error('main.js not found!');
    return null;
  }

  // Start the main server as a child process
  const serverProcess = spawn('node', [mainJsPath], {
    cwd: path.join(__dirname, '..'),
    stdio: 'pipe'
  });

  serverProcess.stdout.on('data', (data) => {
    console.log(`Main server: ${data}`);
  });

  serverProcess.stderr.on('data', (data) => {
    console.error(`Main server error: ${data}`);
  });

  serverProcess.on('close', (code) => {
    console.log(`Main server process exited with code ${code}`);
  });

  return serverProcess;
}

// Redirect all requests to our main server
app.use((req, res) => {
  // If this is a direct deployment, redirect to our local server
  res.redirect('http://localhost:3000');
});

// Start the server
const server = app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
  
  // Start the main server in the background
  const mainProcess = startMainServer();
  
  // Handle server shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down proxy server...');
    server.close();
    if (mainProcess) {
      mainProcess.kill();
    }
  });
});