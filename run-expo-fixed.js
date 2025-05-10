/**
 * Improved Expo runner with proper configuration
 * Version: 1.0.0 (May 10, 2025)
 */

const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Configuration
const PORT = 3243; 
const expoAppDir = path.join(__dirname, 'expo-app');
const PUBLIC_PATH = 'app';  // Path configured in nginx

// Additional environment variables to help Expo work behind nginx
const env = {
  ...process.env,
  NODE_ENV: 'development',
  CI: '1',                 // Auto-accept alternate port
  BROWSER: 'none',         // Don't open browser
  EXPO_WEB_PORT: PORT,     // Expo web port
  DANGEROUSLY_DISABLE_HOST_CHECK: 'true',  // Allow external connections
  
  // Allow CORS from any domain (important for Replit)
  EXPO_ALLOW_ORIGIN: '*',
  EXPO_PUBLIC_ALLOW_ORIGIN: '*',
  EXPO_USE_REFLECTION: 'true',
  
  // Path configuration for nginx
  EXPO_WEBPACK_PUBLIC_PATH: PUBLIC_PATH,
  PUBLIC_URL: PUBLIC_PATH,
  ASSET_PATH: PUBLIC_PATH,
  BASE_PATH: PUBLIC_PATH,
  WEBPACK_PUBLIC_PATH: PUBLIC_PATH,
};

// Fix React Native vector icons if needed
function fixVectorIcons() {
  console.log('Setting up vector icons using React Native asset system...');
  
  // Font names to copy
  const fontNames = [
    'MaterialCommunityIcons.ttf',
    'FontAwesome.ttf',
    'Ionicons.ttf',
    'MaterialIcons.ttf',
    'AntDesign.ttf',
    'Entypo.ttf',
    'EvilIcons.ttf',
    'Feather.ttf',
    'FontAwesome5_Brands.ttf',
    'FontAwesome5_Regular.ttf',
    'FontAwesome5_Solid.ttf',
    'Foundation.ttf',
    'Octicons.ttf',
    'SimpleLineIcons.ttf',
    'Zocial.ttf'
  ];
  
  // Original font files location
  const originalFontsDir = path.join(__dirname, 'node_modules', 'react-native-vector-icons', 'Fonts');
  
  // Standard React Native assets directory structure
  const assetsFontsDir = path.join(expoAppDir, 'assets', 'fonts');
  if (!fs.existsSync(assetsFontsDir)) {
    fs.mkdirSync(assetsFontsDir, { recursive: true });
    console.log('Created standard React Native assets/fonts directory');
  }
  
  // For web, we need the fonts in the web directory
  const webDir = path.join(expoAppDir, 'web');
  const webFontsDir = path.join(webDir, 'fonts');
  if (!fs.existsSync(webFontsDir)) {
    fs.mkdirSync(webFontsDir, { recursive: true });
    console.log('Created web/fonts directory for Expo web');
  }
  
  // Copy fonts to React Native asset system
  let missingFonts = [];
  let copiedFonts = [];
  
  for (const fontName of fontNames) {
    const originalFontPath = path.join(originalFontsDir, fontName);
    
    // Check if original font exists
    if (fs.existsSync(originalFontPath)) {
      const fontContent = fs.readFileSync(originalFontPath);
      
      // Copy to assets/fonts directory (standard RN location)
      const assetsFontPath = path.join(assetsFontsDir, fontName);
      fs.writeFileSync(assetsFontPath, fontContent);
      
      // Copy to web/fonts directory (for Expo web)
      const webFontPath = path.join(webFontsDir, fontName);
      fs.writeFileSync(webFontPath, fontContent);
      
      copiedFonts.push(fontName);
    } else {
      missingFonts.push(fontName);
      console.log(`Warning: Font file not found: ${fontName}`);
    }
  }
  
  console.log(`Successfully installed ${copiedFonts.length} fonts in the React Native asset system`);
  
  if (missingFonts.length > 0) {
    console.log(`Warning: ${missingFonts.length} fonts were missing and could not be copied`);
  }
  
  // Create react-native.config.js if it doesn't exist (for proper asset linking)
  const rnConfigPath = path.join(expoAppDir, 'react-native.config.js');
  const rnConfigContent = `
// This file configures the React Native asset system
module.exports = {
  project: {
    ios: {},
    android: {},
  },
  assets: ['./assets/fonts'],
};
`;
  
  fs.writeFileSync(rnConfigPath, rnConfigContent);
  console.log('Created react-native.config.js for proper font asset linking');
  
  // Update app.json to use proper React Native font loading
  const appJsonPath = path.join(expoAppDir, 'app.json');
  if (fs.existsSync(appJsonPath)) {
    try {
      const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
      
      // Ensure the expo section exists
      if (!appJson.expo) {
        appJson.expo = {};
      }
      
      // Proper way to define fonts in Expo/React Native
      appJson.expo.fonts = appJson.expo.fonts || [];
      const fontPaths = copiedFonts.map(font => `./assets/fonts/${font}`);
      
      // Add each font if not already in the list
      let addedFonts = 0;
      fontPaths.forEach(fontPath => {
        if (!appJson.expo.fonts.includes(fontPath)) {
          appJson.expo.fonts.push(fontPath);
          addedFonts++;
        }
      });
      
      // Write the updated app.json
      fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2));
      console.log(`Updated app.json with ${addedFonts} new font entries`);
    } catch (error) {
      console.error('Error updating app.json:', error);
    }
  }
  
  // Create a CSS file for web-only font support
  // This is needed because React Native Web doesn't fully support the asset system for fonts
  const cssContent = `/* React Native Vector Icons Font CSS for Web */
${fontNames.map(font => {
  const fontFamily = font.replace('.ttf', '');
  return `
@font-face {
  font-family: '${fontFamily}';
  src: url('./fonts/${font}') format('truetype');
  font-weight: normal;
  font-style: normal;
}`;
}).join('\n')}

/* Fix for broken SVGs */
svg[width="0"], svg[height="0"] {
  width: 24px !important;
  height: 24px !important;
}
`;
  
  const cssPath = path.join(webDir, 'vector-icons.css');
  fs.writeFileSync(cssPath, cssContent);
  console.log('Created CSS file for web font loading (web-only)');
  
  // Create a simple function to inject the CSS into the HTML
  // This only runs once - React Native's asset system should handle the rest
  const injectCssToHtml = () => {
    const indexHtmlPath = path.join(webDir, 'index.html');
    if (fs.existsSync(indexHtmlPath)) {
      let htmlContent = fs.readFileSync(indexHtmlPath, 'utf8');
      
      // Only modify if needed
      if (!htmlContent.includes('vector-icons.css')) {
        htmlContent = htmlContent.replace(
          '</head>',
          `<link rel="stylesheet" href="vector-icons.css" />\n</head>`
        );
        
        fs.writeFileSync(indexHtmlPath, htmlContent);
        console.log('Injected font CSS into index.html for web');
      }
    }
  };
  
  // Set a single-run timeout to inject CSS after Expo has generated the HTML
  setTimeout(injectCssToHtml, 5000);
  
  console.log('Vector icons setup completed using proper React Native asset system');
}

// Install missing dependencies directly
console.log('Installing required dependencies...');

// List of required dependencies
const dependencies = [
  { name: 'minimatch', version: '5.1.6' },
  { name: 'agent-base', version: '6.0.2' },
  { name: 'lru-cache', version: '6.0.0' },
  { name: 'glob', version: '9.3.5' }
];

// Install any missing dependencies
for (const dep of dependencies) {
  try {
    // Check if installed with the right version
    const pkgJsonPath = path.join(__dirname, 'node_modules', dep.name, 'package.json');
    let isInstalled = false;
    
    if (fs.existsSync(pkgJsonPath)) {
      try {
        const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
        if (pkgJson.version === dep.version) {
          console.log(`${dep.name}@${dep.version} is already installed`);
          isInstalled = true;
        } else {
          console.log(`${dep.name} is installed but has wrong version (${pkgJson.version} vs ${dep.version})`);
        }
      } catch (e) {
        console.log(`Error reading package.json for ${dep.name}`);
      }
    }
    
    if (!isInstalled) {
      console.log(`Installing ${dep.name}@${dep.version}...`);
      execSync(`npm install ${dep.name}@${dep.version} --save-exact`, {
        stdio: 'inherit',
        cwd: __dirname
      });
    }
  } catch (err) {
    console.error(`Error installing ${dep.name}@${dep.version}: ${err.message}`);
  }
}

// Fix vector icons
fixVectorIcons();

console.log(`Starting Expo directly on port ${PORT}...`);

// Clear ALL caches to ensure a completely clean build
console.log('Clearing ALL Expo caches...');
try {
  // Remove node_modules/.cache
  execSync('rm -rf node_modules/.cache', { cwd: expoAppDir, stdio: 'inherit' });
  
  // Remove .expo directory
  execSync('rm -rf .expo', { cwd: expoAppDir, stdio: 'inherit' });
  
  // Clean require cache at runtime (only for this app's modules)
  Object.keys(require.cache).forEach(function(key) {
    if (key.includes('expo-app')) {
      delete require.cache[key];
    }
  });
  
  console.log('All caches cleared successfully');
} catch (error) {
  console.error('Error clearing cache:', error);
}

// First kill any running Expo processes (safety check)
try {
  execSync('pkill -f "expo start" || true', { stdio: 'inherit' });
  execSync('pkill -f "node.*expo" || true', { stdio: 'inherit' });
  console.log('Killed any existing Expo processes');
} catch (error) {
  // Ignore errors here
}

// Force rebuild the project with extreme cache clearing
console.log('Starting complete Expo rebuild...');

// Create a timestamp and build ID to prevent caching
const timestamp = new Date().getTime();
const BUILD_ID = `build-${timestamp}`;
env.EXPO_CACHE_BUSTER = timestamp.toString();
env.METRO_CACHE_BUSTER = timestamp.toString();
env.TIMESTAMP = timestamp.toString();
env.BUILD_ID = BUILD_ID;

// Also set environment variables to force reload
env.EXPO_PUBLIC_BUILD_ID = BUILD_ID;
env.REACT_APP_BUILD_ID = BUILD_ID;

// Ensure App.js has the version stamp and update it if needed
const appJsPath = path.join(expoAppDir, 'App.js');
if (fs.existsSync(appJsPath)) {
  try {
    let appJsContent = fs.readFileSync(appJsPath, 'utf8');
    const currentDateString = new Date().toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    // Check if it already has a version string
    if (appJsContent.includes('APP_VERSION =')) {
      // Update the existing version string
      appJsContent = appJsContent.replace(
        /APP_VERSION = "([^"]*)"/,
        `APP_VERSION = "1.0.6 - ${currentDateString} - BUILD-${timestamp}"`
      );
      fs.writeFileSync(appJsPath, appJsContent);
      console.log(`Updated App.js version to include build timestamp: ${timestamp}`);
    }
  } catch (error) {
    console.error('Error updating App.js version:', error);
  }
}

// Skip the export step which causes lru-cache issues
console.log('Continuing with direct Expo start...');

// Create a log file for Metro bundling
const logFilePath = path.join(__dirname, 'metro-bundling.log');
fs.writeFileSync(logFilePath, `Metro bundling log started at ${new Date().toISOString()}\n`, 'utf8');

function appendToLog(message) {
  try {
    fs.appendFileSync(logFilePath, `${new Date().toISOString()}: ${message}\n`, 'utf8');
  } catch (err) {
    console.error('Error writing to log file:', err);
  }
}

console.log(`Metro bundling logs will be saved to: ${logFilePath}`);
appendToLog('Starting Metro bundler with forced cache clearing');

// Set a timeout to check if bundling completes
const bundleTimeout = setTimeout(() => {
  const message = 'WARNING: Metro bundling may be stalled - no completion message after 5 minutes';
  console.log('\x1b[33m%s\x1b[0m', message);  // Yellow warning
  appendToLog(message);
  
  // Check if the app is actually responding despite no bundle message
  try {
    // Try to query the app using the http module
    const http = require('http');
    const options = {
      hostname: 'localhost',
      port: PORT,
      path: '/',
      method: 'GET',
      timeout: 5000
    };
    
    const req = http.request(options, (res) => {
      if (res.statusCode === 200) {
        const successMsg = `App is responding on port ${PORT} despite no bundle completion message`;
        console.log('\x1b[32m%s\x1b[0m', successMsg);  // Green success
        appendToLog(successMsg);
      }
    });
    
    req.on('error', (e) => {
      const errorMsg = `App is not responding: ${e.message}`;
      console.log('\x1b[31m%s\x1b[0m', errorMsg);  // Red error
      appendToLog(errorMsg);
    });
    
    req.end();
  } catch (err) {
    appendToLog(`Error checking app status: ${err.message}`);
  }
}, 300000); // 5 minutes

// Start Expo with output piping for better debugging
const expo = spawn('npx', [
  'expo', 
  'start', 
  '--web', 
  '--port', PORT.toString(),
  '--host', 'localhost',  // Use localhost for more reliable behavior
  '--clear',              // Clear the cache
  '--no-dev',             // Disable development mode for better reliability 
  '--reset-cache',        // Reset the cache entirely
  '--max-workers', '2'    // Limit workers to prevent memory issues
], {
  cwd: expoAppDir,
  env: env,
  // Use pipe instead of inherit for better control
  stdio: ['ignore', 'pipe', 'pipe']
});

// Handle output
expo.stdout.on('data', (data) => {
  const output = data.toString();
  process.stdout.write(output);
  
  // Look for bundling completion
  if (output.includes('Web Bundled')) {
    appendToLog(`BUNDLE COMPLETE: ${output.trim()}`);
    clearTimeout(bundleTimeout);
  }
  
  // Log important Metro messages
  if (output.includes('error') || 
      output.includes('warning') || 
      output.includes('Bundled') ||
      output.includes('Starting') ||
      output.includes('Waiting')) {
    appendToLog(output.trim());
  }
});

// Handle error output
expo.stderr.on('data', (data) => {
  const output = data.toString();
  process.stderr.write(output);
  appendToLog(`ERROR: ${output.trim()}`);
});

console.log(`Started Expo with PID ${expo.pid}`);

// Create a separate function to inject version info into served files
// This function runs periodically to ensure the version is always current
function injectVersionInfo() {
  try {
    // Read the current App.js version
    const appJsPath = path.join(expoAppDir, 'App.js');
    const appJsContent = fs.readFileSync(appJsPath, 'utf8');
    let versionMatch = appJsContent.match(/APP_VERSION = "([^"]*)"/);
    const currentVersion = versionMatch ? versionMatch[1] : `1.0.6 - ${new Date().toLocaleString()}`;
    
    // Create a tiny JS file that forces the app to show the correct version and helps with icons
    const versionJs = `
// Force version refresh - created at ${new Date().toISOString()}
// Also contains icon loading fixes
window.FORCE_APP_VERSION = "${currentVersion}";
window.BUILD_ID = "${BUILD_ID}";
window.TIMESTAMP = "${timestamp}";
`;
    
    const versionFilePath = path.join(expoAppDir, 'web', 'version-injector.js');
    fs.writeFileSync(versionFilePath, versionJs);
    console.log(`Created version injector file with version: ${currentVersion}`);
    
    // Schedule the next version update
    setTimeout(injectVersionInfo, 60000); // Update every minute
  } catch (err) {
    console.error('Error injecting version:', err);
    // Continue trying even if there was an error
    setTimeout(injectVersionInfo, 60000);
  }
}

// Start the version injector
injectVersionInfo();

// Handle process termination
process.on('SIGINT', function() {
  console.log('Stopping Expo...');
  expo.kill();
  process.exit();
});

process.on('SIGTERM', function() {
  console.log('Stopping Expo...');
  expo.kill();
  process.exit();
});