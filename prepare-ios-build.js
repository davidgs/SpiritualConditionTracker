/**
 * Script to prepare files for iOS build
 * This addresses the issue where iOS looks for files in different locations
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Paths
const iosBuildDir = path.join(__dirname, 'app', 'build');
const appDistDir = path.join(__dirname, 'app', 'dist');
const appAssetsDir = path.join(__dirname, 'app', 'assets');
const appStylesDir = path.join(__dirname, 'app', 'src', 'styles');

// Ensure build directory exists
if (!fs.existsSync(iosBuildDir)) {
  fs.mkdirSync(iosBuildDir, { recursive: true });
}

// Ensure styles directory exists in build
const buildStylesDir = path.join(iosBuildDir, 'styles');
if (!fs.existsSync(buildStylesDir)) {
  fs.mkdirSync(buildStylesDir, { recursive: true });
}

// Ensure assets directory exists in build
const buildAssetsDir = path.join(iosBuildDir, 'assets');
if (!fs.existsSync(buildAssetsDir)) {
  fs.mkdirSync(buildAssetsDir, { recursive: true });
}

console.log('Preparing iOS build files...');

// Copy bundle.js to the iOS build directory
try {
  const bundlePath = path.join(appDistDir, 'bundle.js');
  const iOSBundlePath = path.join(iosBuildDir, 'bundle.js');
  
  if (fs.existsSync(bundlePath)) {
    fs.copyFileSync(bundlePath, iOSBundlePath);
    console.log('✓ Copied bundle.js to build directory');
  } else {
    console.error('× bundle.js not found in app/dist');
  }
} catch (error) {
  console.error('Error copying bundle.js:', error);
}

// Copy all chunk files
try {
  const files = fs.readdirSync(appDistDir);
  const chunkFiles = files.filter(file => file.includes('.bundle.js'));
  
  chunkFiles.forEach(file => {
    const sourcePath = path.join(appDistDir, file);
    const destPath = path.join(iosBuildDir, file);
    fs.copyFileSync(sourcePath, destPath);
  });
  
  console.log(`✓ Copied ${chunkFiles.length} chunk files to build directory`);
} catch (error) {
  console.error('Error copying chunk files:', error);
}

// Copy style files
try {
  const cssFiles = ['main.css', 'tailwind.css'];
  
  cssFiles.forEach(file => {
    const sourcePath = path.join(appStylesDir, file);
    const destPath = path.join(buildStylesDir, file);
    
    if (fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, destPath);
      console.log(`✓ Copied ${file} to build/styles directory`);
    } else {
      console.warn(`× ${file} not found in app/src/styles`);
    }
  });
} catch (error) {
  console.error('Error copying style files:', error);
}

// Copy assets (logo, icons, etc.)
try {
  const assetFiles = ['logo.jpg', 'favicon.png', 'icon.png', 'adaptive-icon.png'];
  
  assetFiles.forEach(file => {
    const sourcePath = path.join(appAssetsDir, file);
    const destPath = path.join(buildAssetsDir, file);
    
    if (fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, destPath);
      console.log(`✓ Copied ${file} to build/assets directory`);
    } else {
      console.warn(`× ${file} not found in app/assets`);
    }
  });
} catch (error) {
  console.error('Error copying asset files:', error);
}

// Create simple index.html in build directory that loads from the right paths
try {
  const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Spiritual Condition Tracker</title>
  
  <!-- Font Awesome for icons -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA==" crossorigin="anonymous" referrerpolicy="no-referrer" />
  
  <!-- Favicon -->
  <link rel="icon" type="image/png" href="./assets/favicon.png">
  
  <!-- Load CSS in correct order -->
  <link rel="stylesheet" href="./styles/tailwind.css">
  <link rel="stylesheet" href="./styles/main.css">
</head>
<body class="bg-gray-50">
  <div id="app" class="container">
    <!-- React app will be mounted here -->
    <div class="flex justify-center items-center h-screen">
      <div class="text-center">
        <div class="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-gray-600">Loading Spiritual Condition Tracker...</p>
      </div>
    </div>
  </div>
  
  <!-- Load the bundled application -->
  <script src="./bundle.js"></script>
</body>
</html>`;

  fs.writeFileSync(path.join(iosBuildDir, 'index.html'), indexHtml);
  console.log('✓ Created index.html in build directory');
} catch (error) {
  console.error('Error creating index.html:', error);
}

console.log('iOS build preparation complete!');