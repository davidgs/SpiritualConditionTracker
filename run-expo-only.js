/**
 * Simple direct Expo runner with minimal configuration for nginx compatibility
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

// Run fix script if needed
try {
  console.log('Running module error fixes...');
  const fixScriptPath = path.join(__dirname, 'fix-module-error.sh');
  
  if (fs.existsSync(fixScriptPath)) {
    execSync(`bash ${fixScriptPath}`, { stdio: 'inherit' });
    console.log('Fix script completed');
  } else {
    console.log('Fix script not found, skipping...');
  }
  
  // INLINE FIX: Create the missing buildCacheProvider.js file directly
  console.log('Checking for buildCacheProvider error...');
  
  // Path to the @expo/config directory where the missing file should be
  const configDir = path.join(__dirname, 'node_modules', '@expo', 'config', 'build');
  const missingFilePath = path.join(configDir, 'buildCacheProvider.js');
  
  // Check if the directory exists
  if (fs.existsSync(configDir)) {
    // Check if the file already exists
    if (fs.existsSync(missingFilePath)) {
      console.log('buildCacheProvider.js already exists, no fix needed');
    } else {
      console.log('Creating missing buildCacheProvider.js file...');
      
      // Create a simple implementation of the missing module
      const fileContent = `
/**
 * This is a placeholder implementation for the missing buildCacheProvider module
 * Created by run-expo-only.js to resolve module import errors
 */

// Simple cache provider implementation that does nothing
function createCacheProvider() {
  return {
    get: async () => null,
    put: async () => {},
    clear: async () => {},
  };
}

module.exports = {
  createCacheProvider,
};
`;
      
      try {
        // Write the file
        fs.writeFileSync(missingFilePath, fileContent);
        console.log('Successfully created missing buildCacheProvider.js file');
      } catch (err) {
        console.error(`Error creating buildCacheProvider file: ${err.message}`);
      }
    }
  } else {
    console.log('Could not find @expo/config/build directory, skipping fix');
  }
  
  console.log('Module error fix completed successfully');
} catch (err) {
  console.error(`Error running fix script: ${err.message}`);
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
  
  // Only remove node_modules/.cache and .expo, which are safe to delete
  // Don't delete the web-build directory or global Expo caches to improve build times
  
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
console.log('Skipping export step to avoid lru-cache issues...');
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
  '--host', 'lan',       // Important: use LAN host mode for external access
  '--clear',             // Clear the cache
  '--no-dev',            // Disable development mode for better reliability
  '--reset-cache',       // Reset the cache entirely
  '--max-workers', '2'   // Increased workers for faster bundling
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
console.log("[Version Injector] Running version: " + window.FORCE_APP_VERSION);

// Add icon loading support
document.addEventListener('DOMContentLoaded', function() {
  console.log("[Icon Helper] Adding icon support...");
  
  // Function to inject CSS for vector icons
  function injectVectorIconsCSS() {
    // Create style element for icon fonts
    const style = document.createElement('style');
    style.id = 'vector-icons-css';
    style.textContent = 
      "/* Vector icon font definitions */" +
      "@font-face {" +
      "  font-family: 'MaterialCommunityIcons';" +
      "  src: url('./fonts/MaterialCommunityIcons.ttf') format('truetype');" +
      "  font-weight: normal;" +
      "  font-style: normal;" +
      "}" +
      
      "@font-face {" +
      "  font-family: 'FontAwesome';" +
      "  src: url('./fonts/FontAwesome.ttf') format('truetype');" +
      "  font-weight: normal;" +
      "  font-style: normal;" +
      "}" +
      
      "@font-face {" +
      "  font-family: 'Ionicons';" +
      "  src: url('./fonts/Ionicons.ttf') format('truetype');" +
      "  font-weight: normal;" +
      "  font-style: normal;" +
      "}" +
      
      "@font-face {" +
      "  font-family: 'MaterialIcons';" +
      "  src: url('./fonts/MaterialIcons.ttf') format('truetype');" +
      "  font-weight: normal;" +
      "  font-style: normal;" +
      "}" +
      
      "/* Fix any broken SVG icons */" +
      "svg[width='0'], svg[height='0'] {" +
      "  width: 24px !important;" +
      "  height: 24px !important;" +
      "}" +
      
      "/* Target the navigation menu button specifically */" +
      "button[aria-label='Show navigation menu'] {" +
      "  position: relative;" +
      "}" +
      
      "/* Add hamburger icon content to empty navigation buttons */" +
      "button[aria-label='Show navigation menu'] .css-g5y9jx.r-1mlwlqe:empty::before {" +
      "  content: '';" +
      "  position: absolute;" +
      "  top: 0;" +
      "  left: 0;" +
      "  right: 0;" +
      "  bottom: 0;" +
      "  background-image: url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath d='M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z' fill='%23000000'/%3E%3C/svg%3E\");" +
      "  background-size: 24px 24px;" +
      "  background-position: center;" +
      "  background-repeat: no-repeat;" +
      "}" +
      
      "/* Target specifically the hamburger icon based on common attributes */" +
      "[class*='menu-icon'], [class*='hamburger'], [class*='navbar-toggle'] {" +
      "  font-family: 'MaterialIcons', 'MaterialCommunityIcons', sans-serif !important;" +
      "}";
    document.head.appendChild(style);
    console.log("[Icon Helper] Added vector icons CSS");
  }
  
  // Function to create font preload links
  function createFontPreloads() {
    const fonts = [
      'MaterialCommunityIcons.ttf',
      'FontAwesome.ttf',
      'Ionicons.ttf',
      'MaterialIcons.ttf'
    ];
    
    fonts.forEach(font => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = './fonts/' + font;
      link.as = 'font';
      link.type = 'font/ttf';
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });
    console.log("[Icon Helper] Added font preloads");
  }
  
  // Run our fixes with a slight delay to let other scripts initialize
  setTimeout(function() {
    injectVectorIconsCSS();
    createFontPreloads();
    
    // Force SVG rendering in icon components by simulating a resize
    setTimeout(function() {
      try {
        window.dispatchEvent(new Event('resize'));
        console.log("[Icon Helper] Dispatched resize event");
      } catch(e) {
        console.error("[Icon Helper] Error dispatching resize event:", e);
      }
    }, 1000);
    
    // Simple function to add a basic hamburger menu icon CSS
    try {
      const iconStyle = document.createElement('style');
      iconStyle.innerHTML = 
        'button[aria-label="Show navigation menu"] svg:empty { ' +
        '  background-image: url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\'%3E%3Cpath d=\'M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z\' fill=\'currentColor\'/%3E%3C/svg%3E"); ' +
        '  background-repeat: no-repeat; ' +
        '  background-position: center; ' +
        '  width: 24px !important; ' +
        '  height: 24px !important; ' +
        '  display: block; ' +
        '}';
      
      if (document.head) {
        document.head.appendChild(iconStyle);
        console.log("[Icon Helper] Added hamburger icon fix via CSS");
      } else {
        console.log("[Icon Helper] Document head not ready, will retry later");
        setTimeout(function() {
          if (document.head) {
            document.head.appendChild(iconStyle);
            console.log("[Icon Helper] Added hamburger icon fix via CSS (delayed)");
          }
        }, 2000);
      }
    } catch(e) {
      console.error("[Icon Helper] Error adding icon style:", e);
    }
  }, 500);
});

// Enforce version checking
(function() {
  // Create a tiny version indicator that's visible in case of emergency
  function createVersionIndicator() {
    const div = document.createElement('div');
    div.style.position = 'fixed';
    div.style.bottom = '0';
    div.style.right = '0';
    div.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    div.style.color = 'white';
    div.style.padding = '3px 6px';
    div.style.fontSize = '9px';
    div.style.zIndex = '999999';
    div.style.opacity = '0.5';
    div.textContent = 'v' + window.FORCE_APP_VERSION.split(' ')[0];
    return div;
  }

  // Force clear all caches
  function clearAllStorage() {
    try {
      // Clear localStorage except version info
      const versionBackup = localStorage.getItem('app_version');
      localStorage.clear();
      localStorage.setItem('app_version', window.FORCE_APP_VERSION);
      
      // Clear sessionStorage
      sessionStorage.clear();
      
      // Clear application cache (if exists)
      if (window.applicationCache && window.applicationCache.swapCache) {
        try { window.applicationCache.swapCache(); } catch(e) {}
      }
      
      // Try unregistering service workers
      if (navigator.serviceWorker) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
          registrations.forEach(reg => reg.unregister());
        });
      }
      
      // For deployments with specific paths, ensure path prefix is correct
      if (window.location.pathname.indexOf('/app') !== 0 && 
          !window.location.pathname.includes('localhost')) {
        console.log("[Version Injector] Path correction - redirecting to /app path");
        window.location.href = '/app' + window.location.search;
        return false;
      }
      
      console.log("[Version Injector] All storage cleared");
      return true;
    } catch(e) {
      console.error("[Version Injector] Error clearing storage:", e);
      return false;
    }
  }
  
  // Force refresh function - available globally for debugging
  window.forceAppVersionRefresh = function() {
    clearAllStorage();
    window.location.reload(true);
  };
  
  // Version check on load
  const CHECK_DELAY = 5000; // 5 seconds
  setTimeout(function() {
    if (document.body) {
      // Add version indicator on dev environments
      if (window.location.hostname.includes('localhost') || 
          window.location.hostname.includes('127.0.0.1') ||
          window.location.hostname.includes('.repl.co')) {
        document.body.appendChild(createVersionIndicator());
      }
      
      // Check if displaying old version
      if (!document.body.innerHTML.includes(window.FORCE_APP_VERSION)) {
        console.log("[Version Injector] Version mismatch detected! Refreshing...");
        clearAllStorage();
        window.location.reload(true);
      }
    }
  }, CHECK_DELAY);
  
  // Periodic version check every 5 minutes
  setInterval(function() {
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        const match = this.responseText.match(/FORCE_APP_VERSION = "([^"]*)"/);
        if (match && match[1] && match[1] !== window.FORCE_APP_VERSION) {
          console.log("[Version Injector] New version detected:", match[1]);
          clearAllStorage();
          window.location.reload(true);
        }
      }
    };
    // Ensure we're using the correct path for the version check
    const basePath = window.location.pathname.startsWith('/app') ? '/app/' : '/';
    xhttp.open("GET", basePath + "version-injector.js?nocache=" + Date.now(), true);
    xhttp.send();
  }, 300000); // Check every 5 minutes
})();
`;
    
    // Save this to the expo-app/web directory (created by Expo)
    const webDir = path.join(expoAppDir, 'web');
    if (!fs.existsSync(webDir)) {
      fs.mkdirSync(webDir, { recursive: true });
    }
    
    fs.writeFileSync(path.join(webDir, 'version-injector.js'), versionJs);
    console.log(`Created version injector file with version: ${currentVersion}`);
    
    // If we have access to the index.html, modify it directly
    const indexHtmlPath = path.join(expoAppDir, 'web', 'index.html');
    if (fs.existsSync(indexHtmlPath)) {
      let htmlContent = fs.readFileSync(indexHtmlPath, 'utf8');
      let modified = false;
      
      // Add preload links for icon fonts
      if (!htmlContent.includes('fonts/MaterialCommunityIcons.ttf')) {
        const preloadLinks = 
          '<link rel="preload" href="./fonts/MaterialCommunityIcons.ttf" as="font" type="font/ttf" crossorigin="anonymous" />\n' +
          '<link rel="preload" href="./fonts/FontAwesome.ttf" as="font" type="font/ttf" crossorigin="anonymous" />\n' +
          '<link rel="preload" href="./fonts/Ionicons.ttf" as="font" type="font/ttf" crossorigin="anonymous" />\n' +
          '<link rel="preload" href="./fonts/MaterialIcons.ttf" as="font" type="font/ttf" crossorigin="anonymous" />';
        
        htmlContent = htmlContent.replace(
          '<head>',
          '<head>\n' + preloadLinks
        );
        modified = true;
        console.log('Added font preload links to index.html');
      }
      
      // Add direct CSS for icon fonts
      if (!htmlContent.includes('vector-icons-style')) {
        const iconStyles = 
          '<style id="vector-icons-style">\n' +
          '  /* Direct CSS for vector icons */\n' +
          '  @font-face {\n' +
          '    font-family: "MaterialCommunityIcons";\n' +
          '    src: url("./fonts/MaterialCommunityIcons.ttf") format("truetype");\n' +
          '    font-weight: normal;\n' +
          '    font-style: normal;\n' +
          '  }\n' +
          '  \n' +
          '  @font-face {\n' +
          '    font-family: "FontAwesome";\n' +
          '    src: url("./fonts/FontAwesome.ttf") format("truetype");\n' +
          '    font-weight: normal;\n' +
          '    font-style: normal;\n' +
          '  }\n' +
          '  \n' +
          '  @font-face {\n' +
          '    font-family: "Ionicons";\n' +
          '    src: url("./fonts/Ionicons.ttf") format("truetype");\n' +
          '    font-weight: normal;\n' +
          '    font-style: normal;\n' +
          '  }\n' +
          '  \n' +
          '  @font-face {\n' +
          '    font-family: "MaterialIcons";\n' +
          '    src: url("./fonts/MaterialIcons.ttf") format("truetype");\n' +
          '    font-weight: normal;\n' +
          '    font-style: normal;\n' +
          '  }\n' +
          '  \n' +
          '  /* Fix for broken SVGs */\n' +
          '  svg[width="0"], svg[height="0"] {\n' +
          '    width: 24px !important;\n' +
          '    height: 24px !important;\n' +
          '  }\n' +
          '  \n' +
          '  /* Target the navigation menu button specifically */\n' +
          '  button[aria-label="Show navigation menu"] {\n' +
          '    position: relative;\n' +
          '  }\n' +
          '  \n' +
          '  /* Add hamburger icon content to empty navigation buttons */\n' +
          '  button[aria-label="Show navigation menu"] .css-g5y9jx.r-1mlwlqe:empty::before {\n' +
          '    content: "";\n' +
          '    position: absolute;\n' +
          '    top: 0;\n' +
          '    left: 0;\n' +
          '    right: 0;\n' +
          '    bottom: 0;\n' +
          '    background-image: url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\'%3E%3Cpath d=\'M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z\' fill=\'%23000000\'/%3E%3C/svg%3E");\n' +
          '    background-size: 24px 24px;\n' +
          '    background-position: center;\n' +
          '    background-repeat: no-repeat;\n' +
          '  }\n' +
          '  \n' +
          '  /* Target specifically the hamburger icon based on common attributes */\n' +
          '  [class*="menu-icon"], [class*="hamburger"], [class*="navbar-toggle"] {\n' +
          '    font-family: "MaterialIcons", "MaterialCommunityIcons", sans-serif !important;\n' +
          '  }\n' +
          '</style>';
        
        htmlContent = htmlContent.replace(
          '</head>',
          iconStyles + '\n</head>'
        );
        modified = true;
        console.log('Added vector icon styles to index.html');
      }
      
      // Inject our version script
      if (!htmlContent.includes('version-injector.js')) {
        htmlContent = htmlContent.replace(
          '</head>',
          '<script src="version-injector.js?v=' + Date.now() + '"></script>\n</head>'
        );
        modified = true;
        console.log('Injected version script into index.html');
      }
      
      if (modified) {
        fs.writeFileSync(indexHtmlPath, htmlContent);
        console.log('Updated index.html with vector icon support');
      }
    }
  } catch (error) {
    console.error('Error in version injector:', error);
  }
}

// Initial run to set up version injection
injectVersionInfo();

// Set up a periodic check to make sure version is always current
const versionInjectorInterval = setInterval(injectVersionInfo, 60000);

// Simple process handlers
process.on('SIGINT', () => {
  console.log('Shutting down Expo...');
  clearInterval(versionInjectorInterval);
  expo.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Terminating Expo...');
  clearInterval(versionInjectorInterval);
  expo.kill();
  process.exit(0);
});