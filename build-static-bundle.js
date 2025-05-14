/**
 * Script to build a static bundle of the application using Metro bundler
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const OUTPUT_DIR = path.join(__dirname, 'static-bundle');
const ENTRY_FILE = path.join(__dirname, 'index.js');
const METRO_CONFIG = path.join(__dirname, 'metro.config.js');
const BABEL_CONFIG = path.join(__dirname, 'babel.config.js');

// Ensure output directory exists
function ensureDirExists(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
}

// Clean up output directory
function cleanOutputDir() {
  if (fs.existsSync(OUTPUT_DIR)) {
    console.log(`Cleaning output directory: ${OUTPUT_DIR}`);
    fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
  }
  
  ensureDirExists(OUTPUT_DIR);
}

// Create a basic index.html file that will load our bundle
function createIndexHtml() {
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1" />
  <meta name="theme-color" content="#000000" />
  <title>Spiritual Condition Tracker</title>
  <style>
    html, body, #root {
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    }
    
    #root {
      display: flex;
      flex-direction: column;
    }
    
    .loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      width: 100%;
    }
    
    .loading-spinner {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #3498db;
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    .loading-text {
      margin-top: 20px;
      font-size: 16px;
      color: #333;
    }
  </style>
</head>
<body>
  <div id="root">
    <div class="loading">
      <div class="loading-spinner"></div>
      <div class="loading-text">Loading Spiritual Condition Tracker...</div>
    </div>
  </div>
  
  <!-- Load the bundle -->
  <script src="./main.bundle.js"></script>
</body>
</html>`;

  const indexPath = path.join(OUTPUT_DIR, 'index.html');
  fs.writeFileSync(indexPath, htmlContent);
  console.log(`Created index.html at ${indexPath}`);
}

// Run Metro bundler to create a JavaScript bundle
function runMetroBundler() {
  console.log('\nStarting Metro bundler...');
  try {
    // First try using the new Expo CLI syntax
    const command = `npx react-native bundle ` +
      `--entry-file ${ENTRY_FILE} ` +
      `--platform web ` +
      `--dev false ` +
      `--bundle-output ${path.join(OUTPUT_DIR, 'main.bundle.js')} ` +
      `--assets-dest ${OUTPUT_DIR}`;
    
    console.log(`Running command: ${command}\n`);
    
    // Execute the command
    execSync(command, { stdio: 'inherit' });
    
    console.log('\nMetro bundle created successfully!');
    return true;
  } catch (error) {
    console.error('\nMetro bundling failed:');
    console.error(error.message);
    return false;
  }
}

// Copy assets to the output directory
function copyAssets() {
  console.log('\nCopying assets...');
  
  // Create assets directory
  const assetsDir = path.join(OUTPUT_DIR, 'assets');
  ensureDirExists(assetsDir);
  
  // Copy assets from your project here
  // For example:
  try {
    // Copy logo if it exists
    if (fs.existsSync(path.join(__dirname, 'logo.jpg'))) {
      fs.copyFileSync(
        path.join(__dirname, 'logo.jpg'),
        path.join(assetsDir, 'logo.jpg')
      );
      console.log('Copied logo.jpg');
    }
    
    // You can add more assets to copy here
    
    console.log('Assets copied successfully!');
  } catch (error) {
    console.error('Error copying assets:', error.message);
  }
}

// Main build function
async function buildStaticBundle() {
  console.log('=== Building Static Bundle ===');
  
  // Step 1: Prepare the output directory
  cleanOutputDir();
  
  // Step 2: Create index.html
  createIndexHtml();
  
  // Step 3: Run Metro bundler
  const bundleSuccess = runMetroBundler();
  
  if (!bundleSuccess) {
    console.error('\n❌ Bundle creation failed. See errors above.');
    return;
  }
  
  // Step 4: Copy any additional assets if needed
  copyAssets();
  
  console.log('\n✅ Static bundle build completed!');
  console.log(`Output directory: ${OUTPUT_DIR}`);
}

// Run the build process
buildStaticBundle().catch(error => {
  console.error('Build process error:', error);
  process.exit(1);
});