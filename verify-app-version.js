#!/usr/bin/env node
/**
 * This script verifies the app version from App.js
 * Run it to check what version is being loaded by Node.js
 */

const fs = require('fs');
const path = require('path');

// Define paths
const expoAppDir = path.join(__dirname, 'expo-app');
const appJsPath = path.join(expoAppDir, 'App.js');

console.log('======= App Version Verification =======');
console.log(`Checking App.js at: ${appJsPath}`);

// Check if App.js exists
if (!fs.existsSync(appJsPath)) {
  console.error('ERROR: App.js not found!');
  process.exit(1);
}

// Read the file content
const appJsContent = fs.readFileSync(appJsPath, 'utf8');

// Extract the version string using regex
const versionMatch = appJsContent.match(/APP_VERSION = "(.*?)"/);
if (versionMatch && versionMatch[1]) {
  console.log(`App version found: "${versionMatch[1]}"`);
} else {
  console.log('No version string found in App.js');
}

// Check if we can see the correct App.js structure
const hasNavContainer = appJsContent.includes('NavigationContainer');
const hasDrawerNav = appJsContent.includes('DrawerNavigator');
const hasVersion = appJsContent.includes('Version:');

console.log('\nApp.js content verification:');
console.log(`- NavigationContainer: ${hasNavContainer ? 'FOUND' : 'MISSING'}`);
console.log(`- DrawerNavigator: ${hasDrawerNav ? 'FOUND' : 'MISSING'}`);
console.log(`- Version footer: ${hasVersion ? 'FOUND' : 'MISSING'}`);

// If it's not the right file, try to find it elsewhere
if (!hasNavContainer || !hasDrawerNav || !hasVersion) {
  console.log('\nWARNING: App.js may not be the latest version!');
  
  // Check if there's a backup file
  const backupPath = path.join(expoAppDir, 'App.js.backup');
  if (fs.existsSync(backupPath)) {
    const backupContent = fs.readFileSync(backupPath, 'utf8');
    const backupVersionMatch = backupContent.match(/APP_VERSION = "(.*?)"/);
    
    console.log('\nFound App.js.backup:');
    if (backupVersionMatch && backupVersionMatch[1]) {
      console.log(`Backup version: "${backupVersionMatch[1]}"`);
    } else {
      console.log('No version found in backup');
    }
  }
}

console.log('\n======= Verification Complete =======');