const sharp = require('sharp');
const path = require('path');

// Function to convert JPG to PNG
async function convertImage(sourcePath, outputPath, width, height, options = {}) {
  try {
    const sharpImage = sharp(sourcePath).resize(width, height);
    
    // Add padding if specified
    if (options.padding) {
      sharpImage.extend({
        top: options.padding,
        bottom: options.padding,
        left: options.padding,
        right: options.padding,
        background: options.background || { r: 0, g: 0, b: 0, alpha: 1 }
      });
    }
    
    // Background for transparent images
    if (options.background) {
      sharpImage.flatten({ background: options.background });
    }
    
    await sharpImage.png().toFile(outputPath);
    console.log(`Converted ${sourcePath} to ${outputPath}`);
  } catch (error) {
    console.error('Error converting image:', error);
  }
}

// Main execution
async function main() {
  const sourcePath = path.join(__dirname, 'assets', 'original-logo.jpg');
  
  // Create icon.png (1024x1024)
  await convertImage(sourcePath, path.join(__dirname, 'assets', 'icon.png'), 1024, 1024);
  
  // Create adaptive-icon.png (1024x1024)
  await convertImage(sourcePath, path.join(__dirname, 'assets', 'adaptive-icon.png'), 1024, 1024);
  
  // Create splash.png (2048x2048)
  await convertImage(sourcePath, path.join(__dirname, 'assets', 'splash.png'), 2048, 2048, {
    padding: 400,
    background: { r: 1, g: 4, b: 12, alpha: 1 } // Dark blue background for splash screen
  });
  
  // Create favicon.png (196x196)
  await convertImage(sourcePath, path.join(__dirname, 'assets', 'favicon.png'), 196, 196);
  
  console.log('All images converted successfully!');
}

main().catch(console.error);