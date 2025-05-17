/**
 * Script to convert logo.jpg to various PNG formats for the app
 */
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Define source and output paths
const sourcePath = path.join(__dirname, 'app/assets/logo.jpg');
const outputDir = path.join(__dirname, 'app/assets');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

/**
 * Convert image to PNG with specific dimensions
 * @param {string} sourcePath - Path to source image
 * @param {string} outputPath - Path to output file
 * @param {number} width - Output width
 * @param {number} height - Output height
 * @param {Object} options - Additional options
 */
async function convertImage(sourcePath, outputPath, width, height, options = {}) {
  try {
    console.log(`Converting ${sourcePath} to ${outputPath} (${width}x${height})`);
    
    // Process the image with sharp
    await sharp(sourcePath)
      .resize({
        width,
        height,
        fit: options.fit || 'contain',
        background: options.background || { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toFile(outputPath);
      
    console.log(`Successfully created ${outputPath}`);
  } catch (error) {
    console.error(`Error converting image: ${error.message}`);
  }
}

/**
 * Main function to convert all required assets
 */
async function main() {
  try {
    // Convert to favicon (32x32)
    await convertImage(
      sourcePath, 
      path.join(outputDir, 'favicon.png'), 
      32, 
      32
    );
    
    // Convert to standard icon (192x192)
    await convertImage(
      sourcePath,
      path.join(outputDir, 'icon.png'),
      192,
      192
    );
    
    // Convert to adaptive icon (1024x1024)
    await convertImage(
      sourcePath,
      path.join(outputDir, 'adaptive-icon.png'),
      1024,
      1024
    );
    
    // Convert to splash screen (2048x2048)
    await convertImage(
      sourcePath,
      path.join(outputDir, 'splash.png'),
      2048,
      2048,
      { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 1 } }
    );
    
    console.log('All image conversions completed successfully!');
  } catch (error) {
    console.error(`Error in conversion process: ${error.message}`);
  }
}

// Run the conversion
main();