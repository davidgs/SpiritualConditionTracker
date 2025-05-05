#!/bin/bash

# This script handles deployment for the Spiritual Condition Tracker app
# It's designed to be run by the Replit deployment system

echo "Starting Spiritual Condition Tracker deployment..."

# Kill any existing processes
pkill -f "node server.js" || true
pkill -f "npx expo" || true
pkill -f "node main.js" || true

# Ensure we're in the project root
cd "$(dirname "$0")"

# Check for expo-app directory
if [ ! -d "expo-app" ]; then
  echo "Error: expo-app directory not found!"
  exit 1
fi

# Export environment variables for Expo
export CI=1
export PORT=3000

# Create a simple proxy server to forward requests to our Expo app
cat > deployment-server.js << 'EOF'
/**
 * Simple deployment server for Spiritual Condition Tracker
 */
const express = require('express');
const { spawn } = require('child_process');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const EXPO_PORT = 5000;

// Start Expo in the background
function startExpoApp() {
  console.log('Starting Expo app...');
  
  // Start Expo with specific environment variables
  const expoProcess = spawn('npx', ['expo', 'start', '--offline', '--web', '--port', EXPO_PORT, '--non-interactive'], {
    cwd: path.join(__dirname, 'expo-app'),
    env: { ...process.env, CI: '1' },
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

// Serve static files for the landing page
app.use(express.static(path.join(__dirname)));

// All other routes should proxy to Expo
app.all('*', (req, res) => {
  res.redirect(`http://localhost:${EXPO_PORT}${req.originalUrl}`);
});

// Start the server
console.log(`Starting deployment server on port ${PORT}...`);
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Deployment server running on port ${PORT}`);
  
  // Start Expo
  const expoProcess = startExpoApp();
  
  // Handle shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down...');
    if (expoProcess) expoProcess.kill();
    server.close();
  });
});
EOF

# Start the deployment server
echo "Starting deployment server..."
node deployment-server.js