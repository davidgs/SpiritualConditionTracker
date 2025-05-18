/**
 * iOS Build Preparation Script
 * This script prepares your project files for Capacitor iOS build process
 */

const fs = require('fs');
const path = require('path');

// Create iOS build directory structure if it doesn't exist
function createDirectories() {
  console.log('Creating necessary directories for iOS build...');
  
  const dirs = [
    'ios',
    'ios/App',
    'ios/App/App',
    'ios/App/App/Assets.xcassets',
    'ios/App/App/Assets.xcassets/AppIcon.appiconset'
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
    }
  });
}

// Copy index.html and all necessary assets to the correct location
function prepareWebAssets() {
  console.log('Preparing web assets for iOS build...');
  
  // Create a build directory to hold all the assets
  if (!fs.existsSync('build')) {
    fs.mkdirSync('build');
  }
  
  // Copy index.html to build
  fs.copyFileSync('index.html', 'build/index.html');
  console.log('Copied index.html to build directory');
  
  // Copy styles
  if (fs.existsSync('styles')) {
    if (!fs.existsSync('build/styles')) {
      fs.mkdirSync('build/styles');
    }
    const styleFiles = fs.readdirSync('styles');
    styleFiles.forEach(file => {
      fs.copyFileSync(`styles/${file}`, `build/styles/${file}`);
    });
    console.log('Copied style files');
  }
  
  // Copy dist folder
  if (fs.existsSync('dist')) {
    if (!fs.existsSync('build/dist')) {
      fs.mkdirSync('build/dist', { recursive: true });
    }
    
    copyDirRecursive('dist', 'build/dist');
    console.log('Copied dist directory');
  }
  
  // Copy JavaScript files
  ['defaults.js', 'fix-scorefix.js', 'ios-compatibility.js', 'sqliteLoader.js'].forEach(file => {
    if (fs.existsSync(file)) {
      fs.copyFileSync(file, `build/${file}`);
    }
  });
  
  // Copy src directory
  if (fs.existsSync('src')) {
    copyDirRecursive('src', 'build/src');
    console.log('Copied src directory');
  }
  
  // Copy any images
  ['logo.jpg', 'generated-icon.png'].forEach(file => {
    if (fs.existsSync(file)) {
      fs.copyFileSync(file, `build/${file}`);
    }
  });
  
  console.log('All web assets prepared for iOS build');
}

// Helper function to recursively copy a directory
function copyDirRecursive(source, destination) {
  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination, { recursive: true });
  }
  
  const entries = fs.readdirSync(source, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(source, entry.name);
    const destPath = path.join(destination, entry.name);
    
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Update capacitor.config.json to point to the build directory
function updateCapacitorConfig() {
  console.log('Updating Capacitor configuration...');
  
  const configPath = 'capacitor.config.json';
  if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    
    // Update the web directory to point to build
    config.webDir = 'build';
    
    // Update iOS-specific settings
    if (!config.ios) {
      config.ios = {};
    }
    
    config.ios.limitsNavigationsToAppBoundDomains = true;
    config.ios.contentInset = 'always';
    config.ios.allowsLinkPreview = false;
    config.ios.scrollEnabled = true;
    config.ios.backgroundColor = '#ffffff';
    
    // Write the updated config back to file
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log('Capacitor configuration updated');
  } else {
    console.error('capacitor.config.json not found');
  }
}

// Prepare Info.plist information
function createInfoPlist() {
  console.log('Creating Info.plist template...');
  
  const infoPlistTemplate = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>CFBundleDevelopmentRegion</key>
  <string>en</string>
  <key>CFBundleDisplayName</key>
  <string>Spiritual Condition Tracker</string>
  <key>CFBundleExecutable</key>
  <string>$(EXECUTABLE_NAME)</string>
  <key>CFBundleIdentifier</key>
  <string>$(PRODUCT_BUNDLE_IDENTIFIER)</string>
  <key>CFBundleInfoDictionaryVersion</key>
  <string>6.0</string>
  <key>CFBundleName</key>
  <string>$(PRODUCT_NAME)</string>
  <key>CFBundlePackageType</key>
  <string>APPL</string>
  <key>CFBundleShortVersionString</key>
  <string>1.0</string>
  <key>CFBundleVersion</key>
  <string>1</string>
  <key>LSRequiresIPhoneOS</key>
  <true/>
  <key>UILaunchStoryboardName</key>
  <string>LaunchScreen</string>
  <key>UIMainStoryboardFile</key>
  <string>Main</string>
  <key>UIRequiredDeviceCapabilities</key>
  <array>
    <string>armv7</string>
  </array>
  <key>UISupportedInterfaceOrientations</key>
  <array>
    <string>UIInterfaceOrientationPortrait</string>
    <string>UIInterfaceOrientationLandscapeLeft</string>
    <string>UIInterfaceOrientationLandscapeRight</string>
  </array>
  <key>UISupportedInterfaceOrientations~ipad</key>
  <array>
    <string>UIInterfaceOrientationPortrait</string>
    <string>UIInterfaceOrientationPortraitUpsideDown</string>
    <string>UIInterfaceOrientationLandscapeLeft</string>
    <string>UIInterfaceOrientationLandscapeRight</string>
  </array>
  <key>UIViewControllerBasedStatusBarAppearance</key>
  <true/>
  <key>NSAppTransportSecurity</key>
  <dict>
    <key>NSAllowsArbitraryLoads</key>
    <true/>
  </dict>
</dict>
</plist>`;

  // Write the template to ios/App/App directory if it doesn't exist
  const infoPlistPath = 'ios/App/App/Info.plist.template';
  if (!fs.existsSync('ios/App/App')) {
    fs.mkdirSync('ios/App/App', { recursive: true });
  }
  
  fs.writeFileSync(infoPlistPath, infoPlistTemplate);
  console.log('Created Info.plist template');
}

// Run all preparation steps
function main() {
  console.log('Starting iOS build preparation...');
  
  createDirectories();
  prepareWebAssets();
  updateCapacitorConfig();
  createInfoPlist();
  
  console.log('iOS build preparation complete!');
  console.log('Next steps:');
  console.log('1. Run "npx cap add ios" to add the iOS platform');
  console.log('2. Run "npx cap sync ios" to sync your web code to iOS');
  console.log('3. Run "npx cap open ios" to open the project in Xcode');
}

// Execute the main function
main();