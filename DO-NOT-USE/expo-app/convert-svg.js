const fs = require('fs');
const sharp = require('sharp');
const path = require('path');

// Function to convert SVG to PNG
async function convertSvgToPng(svgPath, outputPath, width, height) {
  try {
    await sharp(svgPath)
      .resize(width, height)
      .png()
      .toFile(outputPath);
    console.log(`Converted ${svgPath} to ${outputPath}`);
  } catch (error) {
    console.error('Error converting SVG to PNG:', error);
  }
}

// Main execution
async function main() {
  const svgPath = path.join(__dirname, 'assets', 'custom-icon.svg');
  
  // Create icon.png (1024x1024)
  await convertSvgToPng(svgPath, path.join(__dirname, 'assets', 'icon.png'), 1024, 1024);
  
  // Create adaptive-icon.png (1024x1024)
  await convertSvgToPng(svgPath, path.join(__dirname, 'assets', 'adaptive-icon.png'), 1024, 1024);
  
  // Create splash.png (2048x2048)
  await convertSvgToPng(svgPath, path.join(__dirname, 'assets', 'splash.png'), 2048, 2048);
  
  // Create favicon.png (196x196)
  await convertSvgToPng(svgPath, path.join(__dirname, 'assets', 'favicon.png'), 196, 196);
  
  console.log('All images converted successfully!');
}

main().catch(console.error);