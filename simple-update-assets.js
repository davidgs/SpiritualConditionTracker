/**
 * Simple Asset Update Script
 * Uses the fixed logo to update all app assets
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Paths
const originalLogo = path.join(__dirname, 'expo-app', 'assets', 'original-logo.jpg');
const assetsDir = path.join(__dirname, 'expo-app', 'assets');
const publicDir = path.join(__dirname, 'public');

// Check if original logo exists
if (!fs.existsSync(originalLogo)) {
  console.error('Error: Original logo not found at', originalLogo);
  process.exit(1);
}

console.log('Using original logo from:', originalLogo);

// Create the assets with proper sizes
async function createAssets() {
  try {
    // Icon (1024x1024)
    console.log('Creating icon.png...');
    await sharp(originalLogo)
      .resize(1024, 1024, { fit: 'contain', background: { r: 255, g: 255, b: 255 } })
      .toFile(path.join(assetsDir, 'icon.png'));
    
    // Adaptive icon (with padding)
    console.log('Creating adaptive-icon.png...');
    await sharp(originalLogo)
      .resize(768, 768, { fit: 'contain', background: { r: 255, g: 255, b: 255 } })
      .extend({
        top: 128,
        bottom: 128,
        left: 128,
        right: 128,
        background: { r: 255, g: 255, b: 255 }
      })
      .toFile(path.join(assetsDir, 'adaptive-icon.png'));
    
    // Splash screen
    console.log('Creating splash.png...');
    await sharp(originalLogo)
      .resize(1200, 1200, { fit: 'contain', background: { r: 255, g: 255, b: 255 } })
      .extend({
        top: 424,
        bottom: 424,
        left: 424,
        right: 424,
        background: { r: 255, g: 255, b: 255 }
      })
      .toFile(path.join(assetsDir, 'splash.png'));
    
    // Favicon
    console.log('Creating favicon.png...');
    await sharp(originalLogo)
      .resize(128, 128, { fit: 'contain', background: { r: 255, g: 255, b: 255 } })
      .toFile(path.join(assetsDir, 'favicon.png'));
    
    // Copy to public directory for web
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    
    console.log('Copying logo to public directory...');
    await sharp(originalLogo)
      .resize(512, 512, { fit: 'contain', background: { r: 255, g: 255, b: 255 } })
      .toFile(path.join(publicDir, 'logo.png'));
    
    // Also update logo.jpg
    console.log('Updating logo.jpg in root directory...');
    fs.copyFileSync(originalLogo, path.join(__dirname, 'logo.jpg'));
    
    console.log('✅ All assets updated successfully!');
  } catch (err) {
    console.error('Error creating assets:', err);
  }
}

// Execute
createAssets();