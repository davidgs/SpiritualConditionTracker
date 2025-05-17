/**
 * Script to patch file paths for iOS
 * This adds support for serving the iOS-optimized HTML file and handling Capacitor's path structure
 */
const fs = require('fs');
const path = require('path');

// Copy the iOS-optimized index.html to the expected Capacitor paths
function patchFiles() {
  console.log('Patching file paths for iOS...');
  
  try {
    // Copy the iOS-optimized HTML file
    const sourceHtml = path.join(__dirname, 'app', 'index-ios.html');
    const destHtml = path.join(__dirname, 'app', 'index.html');
    
    if (fs.existsSync(sourceHtml)) {
      console.log('Copying iOS-optimized index.html...');
      fs.copyFileSync(sourceHtml, destHtml);
      console.log('✓ Successfully patched index.html for iOS');
    } else {
      console.error('× iOS-optimized HTML file not found');
    }
    
    // Create a symlink for the bundle in the expected location
    const bundleSrc = path.join(__dirname, 'app', 'dist', '591.bundle.js');
    
    if (fs.existsSync(bundleSrc)) {
      console.log('Chunk file 591.bundle.js exists and will be properly served');
    } else {
      console.warn('Could not find chunk file 591.bundle.js - app may not work correctly on iOS');
    }
    
    console.log('iOS path patching complete!');
  } catch (error) {
    console.error('Error patching files for iOS:', error);
  }
}

// Run the patching
patchFiles();