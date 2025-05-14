/**
 * Ultra-simple direct Expo server for port 5000
 * Runs Expo directly to serve the app
 */

const { spawn } = require('child_process');

// Run Expo directly on port 5000
console.log('Starting Expo directly on port 5000...');

// Launch Expo with the right settings for Replit
const expo = spawn('npx', [
  'expo', 
  'start',
  '--web',
  '--port', '5000',
  '--host', '0.0.0.0'
], {
  stdio: 'inherit',
  env: {
    ...process.env,
    BROWSER: 'none',
    FORCE_COLOR: '1',
    EXPO_NO_DOCTOR: 'true'
  }
});

// Handle errors
expo.on('error', (err) => {
  console.error('Error starting Expo:', err);
});

// Handle exit
expo.on('exit', (code) => {
  console.log(`Expo process exited with code ${code}`);
});

// Handle cleanup
process.on('SIGINT', () => {
  console.log('Shutting down...');
  expo.kill();
  process.exit(0);
});