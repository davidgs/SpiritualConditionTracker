/**
 * Asset Update Script for Spiritual Condition Tracker
 * 
 * This script takes the original-logo.jpg file and creates:
 * - icon.png (1024x1024)
 * - adaptive-icon.png (1024x1024 with padding)
 * - splash.png (2048x2048)
 * - favicon.png (128x128)
 */

const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');
const { promisify } = require('util');

const writeFileAsync = promisify(fs.writeFile);
const copyFileAsync = promisify(fs.copyFile);

// Constants
const ASSETS_DIR = path.join(__dirname, 'expo-app', 'assets');
const SOURCE_IMAGE = path.join(ASSETS_DIR, 'original-logo.jpg');
const PUBLIC_DIR = path.join(__dirname, 'public');
const WEB_BUILD_DIR = path.join(__dirname, 'web-build');

// Output paths
const PATHS = {
  ICON: path.join(ASSETS_DIR, 'icon.png'),
  ADAPTIVE_ICON: path.join(ASSETS_DIR, 'adaptive-icon.png'),
  SPLASH: path.join(ASSETS_DIR, 'splash.png'),
  FAVICON: path.join(ASSETS_DIR, 'favicon.png'),
  PUBLIC_ICON: path.join(PUBLIC_DIR, 'logo.png'),
  WEB_BUILD_ICON: path.join(WEB_BUILD_DIR, 'logo.png')
};

// Size configurations
const SIZES = {
  ICON: 1024,
  ADAPTIVE_ICON: 1024,
  SPLASH: 2048,
  FAVICON: 128
};

// Background color for transparent areas
const BACKGROUND_COLOR = '#FFFFFF';

/**
 * Create a resized PNG from the source image
 */
async function createResizedPng(sourceImage, outputPath, size, addPadding = false) {
  try {
    console.log(`Creating ${path.basename(outputPath)} (${size}x${size})...`);
    
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    
    // Fill with background color
    ctx.fillStyle = BACKGROUND_COLOR;
    ctx.fillRect(0, 0, size, size);
    
    // Load the image
    const image = await loadImage(sourceImage);
    
    // Calculate dimensions to maintain aspect ratio
    const sourceWidth = image.width;
    const sourceHeight = image.height;
    const sourceRatio = sourceWidth / sourceHeight;
    
    let destWidth, destHeight, destX, destY;
    
    if (addPadding) {
      // Add 20% padding
      const paddingPercent = 0.2;
      const paddingSize = size * paddingPercent;
      const availableSize = size - (paddingSize * 2);
      
      if (sourceRatio > 1) {
        destWidth = availableSize;
        destHeight = availableSize / sourceRatio;
      } else {
        destHeight = availableSize;
        destWidth = availableSize * sourceRatio;
      }
      
      destX = (size - destWidth) / 2;
      destY = (size - destHeight) / 2;
    } else {
      // Fill the canvas, centering and cropping as needed
      if (sourceRatio > 1) {
        destHeight = size;
        destWidth = size * sourceRatio;
        destX = -(destWidth - size) / 2;
        destY = 0;
      } else {
        destWidth = size;
        destHeight = size / sourceRatio;
        destX = 0;
        destY = -(destHeight - size) / 2;
      }
    }
    
    // Draw the image
    ctx.drawImage(image, destX, destY, destWidth, destHeight);
    
    // Convert to PNG buffer
    const buffer = canvas.toBuffer('image/png');
    
    // Write to file
    await writeFileAsync(outputPath, buffer);
    console.log(`✅ Created ${path.basename(outputPath)}`);
    
    return outputPath;
  } catch (error) {
    console.error(`Error creating ${path.basename(outputPath)}:`, error);
    throw error;
  }
}

/**
 * Update app.json with the new asset paths
 */
async function updateAppJson() {
  try {
    console.log('Updating app.json...');
    
    const appJsonPath = path.join(__dirname, 'expo-app', 'app.json');
    const appJson = require(appJsonPath);
    
    // Update the paths
    if (appJson.expo) {
      if (!appJson.expo.icon) {
        appJson.expo.icon = './assets/icon.png';
      }
      
      if (!appJson.expo.splash) {
        appJson.expo.splash = { 
          image: './assets/splash.png',
          resizeMode: 'contain',
          backgroundColor: '#ffffff'
        };
      } else {
        appJson.expo.splash.image = './assets/splash.png';
      }
      
      if (!appJson.expo.web) {
        appJson.expo.web = { 
          favicon: './assets/favicon.png' 
        };
      } else if (!appJson.expo.web.favicon) {
        appJson.expo.web.favicon = './assets/favicon.png';
      }
      
      if (!appJson.expo.android) {
        appJson.expo.android = { 
          adaptiveIcon: {
            foregroundImage: './assets/adaptive-icon.png',
            backgroundColor: '#FFFFFF'
          }
        };
      } else if (!appJson.expo.android.adaptiveIcon) {
        appJson.expo.android.adaptiveIcon = {
          foregroundImage: './assets/adaptive-icon.png',
          backgroundColor: '#FFFFFF'
        };
      }
    }
    
    // Write updated app.json
    await writeFileAsync(
      appJsonPath, 
      JSON.stringify(appJson, null, 2)
    );
    
    console.log('✅ app.json updated');
  } catch (error) {
    console.error('Error updating app.json:', error);
  }
}

/**
 * Copy logo to public and web-build directories
 */
async function copyToPublicDirs() {
  try {
    // Create directories if they don't exist
    if (!fs.existsSync(PUBLIC_DIR)) {
      fs.mkdirSync(PUBLIC_DIR, { recursive: true });
    }
    
    if (!fs.existsSync(WEB_BUILD_DIR)) {
      fs.mkdirSync(WEB_BUILD_DIR, { recursive: true });
    }
    
    // Copy to public
    console.log('Copying logo to public directory...');
    await copyFileAsync(PATHS.ICON, PATHS.PUBLIC_ICON);
    
    // Copy to web-build
    console.log('Copying logo to web-build directory...');
    await copyFileAsync(PATHS.ICON, PATHS.WEB_BUILD_ICON);
    
    console.log('✅ Logo copied to public directories');
  } catch (error) {
    console.error('Error copying to public directories:', error);
  }
}

/**
 * Main function to run the script
 */
async function main() {
  try {
    console.log('====================================');
    console.log('Spiritual Condition Tracker - Asset Update');
    console.log('====================================');
    console.log('Source image:', SOURCE_IMAGE);
    
    if (!fs.existsSync(SOURCE_IMAGE)) {
      throw new Error(`Source image not found: ${SOURCE_IMAGE}`);
    }
    
    // Create all the assets
    await createResizedPng(SOURCE_IMAGE, PATHS.ICON, SIZES.ICON);
    await createResizedPng(SOURCE_IMAGE, PATHS.ADAPTIVE_ICON, SIZES.ADAPTIVE_ICON, true);
    await createResizedPng(SOURCE_IMAGE, PATHS.SPLASH, SIZES.SPLASH, true);
    await createResizedPng(SOURCE_IMAGE, PATHS.FAVICON, SIZES.FAVICON);
    
    // Update app.json configuration
    await updateAppJson();
    
    // Copy to public directories
    await copyToPublicDirs();
    
    console.log('====================================');
    console.log('Asset update completed successfully!');
    console.log('====================================');
  } catch (error) {
    console.error('Asset update failed:', error);
    process.exit(1);
  }
}

// Run the script
main();