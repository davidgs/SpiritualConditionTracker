/**
 * Simple Expo server that automatically sets the platform header
 */
const express = require('express');
const http = require('http');
const { spawn } = require('child_process');

// Configuration
const PORT = 5000;
const app = express();

// Add middleware to handle platform headers
app.use((req, res, next) => {
  // Add the expo-platform header to every request
  req.headers['expo-platform'] = 'web';
  next();
});

// Create a simple HTTP server
const server = http.createServer(app);

// Start the server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on port ${PORT}`);
  
  // Start Expo with the server already running
  console.log('Starting Expo development server...');
  const expo = spawn('npx', [
    'expo',
    'start',
    '--web',
    '--port', PORT.toString(),
    '--host', '0.0.0.0'
  ], {
    stdio: 'inherit',
    env: {
      ...process.env,
      BROWSER: 'none',
      EXPO_NO_DOCTOR: 'true',
      EXPO_PLATFORM_HEADER: 'web',
      EXPO_ROUTER_RUNTIME: 'web'
    }
  });
  
  // Handle errors
  expo.on('error', (err) => {
    console.error('Error starting Expo:', err);
  });
  
  // Handle process termination
  process.on('SIGINT', () => {
    console.log('Shutting down...');
    expo.kill();
    process.exit(0);
  });
});