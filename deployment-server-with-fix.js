/**
 * Enhanced Production Server for Spiritual Condition Tracker
 * 
 * This server:
 * 1. Applies automatic fixes for common Expo errors
 * 2. Runs Expo on port 3243 for web access
 * 3. Handles proper font loading for web access
 */

const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const http = require('http');
const express = require('express');

// Configuration
const PORT = 3243;
const PUBLIC_PATH = 'app';  // For nginx path configuration

// Apply buildCacheProvider fix
try {
  // Import and run the fix directly
  const fixBuildCacheProvider = require('./fix-buildcache-provider');
  fixBuildCacheProvider();
} catch (error) {
  console.error(`Error applying buildCacheProvider fix: ${error.message}`);
}

// Environment setup for Expo
const env = {
  ...process.env,
  NODE_ENV: 'production',
  CI: '1',                 // Auto-accept alternate port
  BROWSER: 'none',         // Don't open browser
  EXPO_WEB_PORT: PORT,     // Set Expo port
  DANGEROUSLY_DISABLE_HOST_CHECK: 'true',  // Allow external connections
  
  // Allow CORS from any domain
  EXPO_ALLOW_ORIGIN: '*',
  EXPO_PUBLIC_ALLOW_ORIGIN: '*',
  
  // Path configuration for nginx
  EXPO_WEBPACK_PUBLIC_PATH: PUBLIC_PATH,
  PUBLIC_URL: PUBLIC_PATH,
  ASSET_PATH: PUBLIC_PATH,
  BASE_PATH: PUBLIC_PATH,
  WEBPACK_PUBLIC_PATH: PUBLIC_PATH,
};

// Fix font issues for web
function setupFonts() {
  console.log('Setting up fonts for web access...');
  
  // Set paths
  const expoAppDir = path.join(__dirname, 'expo-app');
  const fontSourceDir = path.join(__dirname, 'node_modules', 'react-native-vector-icons', 'Fonts');
  const assetsFontsDir = path.join(expoAppDir, 'assets', 'fonts');
  const webFontsDir = path.join(expoAppDir, 'web', 'fonts');
  
  // Create directories if needed
  [assetsFontsDir, webFontsDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
  
  // Font list for copying
  const fontNames = [
    'MaterialCommunityIcons.ttf',
    'FontAwesome.ttf',
    'Ionicons.ttf',
    'MaterialIcons.ttf'
  ];
  
  // Copy fonts to appropriate directories
  fontNames.forEach(fontName => {
    const sourcePath = path.join(fontSourceDir, fontName);
    if (fs.existsSync(sourcePath)) {
      const fontContent = fs.readFileSync(sourcePath);
      
      // Copy to assets/fonts
      fs.writeFileSync(path.join(assetsFontsDir, fontName), fontContent);
      
      // Copy to web/fonts
      fs.writeFileSync(path.join(webFontsDir, fontName), fontContent);
      
      console.log(`Copied font: ${fontName}`);
    } else {
      console.warn(`Warning: Could not find font ${fontName}`);
    }
  });
  
  // Create CSS for web usage
  const cssContent = fontNames.map(font => {
    const name = path.basename(font, '.ttf');
    return `@font-face {
  font-family: '${name}';
  src: url('./fonts/${font}') format('truetype');
  font-weight: normal;
  font-style: normal;
}`;
  }).join('\n\n');
  
  // Write CSS file
  fs.writeFileSync(path.join(expoAppDir, 'web', 'fonts.css'), cssContent);
  console.log('Created font CSS file');
}

// Start Expo
function startExpo() {
  console.log(`Starting Expo on port ${PORT}...`);
  
  // First apply font fixes
  setupFonts();
  
  // Force reset caches
  try {
    execSync('rm -rf node_modules/.cache', { stdio: 'inherit' });
    execSync('rm -rf .expo', { cwd: path.join(__dirname, 'expo-app'), stdio: 'inherit' });
  } catch (err) {
    console.error(`Error clearing caches: ${err.message}`);
  }
  
  // Start Expo
  const expo = spawn('npx', [
    'expo', 
    'start', 
    '--web', 
    '--port', PORT.toString(),
    '--host', 'lan',
    '--no-dev'
  ], {
    cwd: path.join(__dirname, 'expo-app'),
    env: env,
    stdio: 'inherit'
  });
  
  console.log(`Started Expo with PID ${expo.pid}`);
  
  // Handle process exit
  expo.on('exit', (code, signal) => {
    console.log(`Expo process exited with code ${code} and signal ${signal}`);
    process.exit(code);
  });
}

// Start the server
startExpo();