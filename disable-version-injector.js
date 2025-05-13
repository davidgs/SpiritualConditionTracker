/**
 * Script to disable version injector updates
 * This script will create a fixed version-injector.js file and remove auto-update functionality
 */

const fs = require('fs');
const path = require('path');

// Configuration - paths
const rootDir = process.cwd();
const webDir = path.join(rootDir, 'web');

console.log('Disabling version injector updates...');

// Create web directory if it doesn't exist
if (!fs.existsSync(webDir)) {
  console.log(`Creating web directory at: ${webDir}`);
  fs.mkdirSync(webDir, { recursive: true });
}

// Create a fixed version injector file
const versionJs = `
// Static version for Spiritual Condition Tracker
// Created by disable-version-injector.js (${new Date().toISOString()})
// This file is NOT meant to be automatically updated

window.FORCE_APP_VERSION = "1.0.6 - Fixed Version";
window.BUILD_ID = "${Date.now()}";
console.log("[Version Injector] Running fixed version: 1.0.6");

// Disable auto-update functionality
console.log("[Version Injector] Auto-updates DISABLED");
`;

const versionFilePath = path.join(webDir, 'version-injector.js');

// Write the fixed file
try {
  fs.writeFileSync(versionFilePath, versionJs);
  console.log(`Created fixed version injector file at: ${versionFilePath}`);
  
  // Make the file read-only to prevent modifications
  try {
    fs.chmodSync(versionFilePath, 0o444); // Read-only for all users
    console.log('Set version-injector.js to read-only');
  } catch (err) {
    console.warn('Failed to set read-only permissions:', err.message);
  }
  
  console.log('Version injector updates successfully disabled!');
} catch (err) {
  console.error('Error creating fixed version file:', err);
  process.exit(1);
}