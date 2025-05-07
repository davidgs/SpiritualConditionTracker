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
  console.log('Checking for vector icons directory...');
  
  // Main node_modules vector icons path
  const iconFontsDir = path.join(expoAppDir, 'node_modules', '@expo', 'vector-icons', 'build', 'vendor', 'react-native-vector-icons', 'Fonts');
  
  if (!fs.existsSync(iconFontsDir)) {
    console.log(`Creating vector icons directory: ${iconFontsDir}`);
    fs.mkdirSync(iconFontsDir, { recursive: true });
    
    // Create empty font files
    const fontNames = [
      'MaterialCommunityIcons.ttf',
      'AntDesign.ttf',
      'FontAwesome.ttf',
      'Ionicons.ttf',
      'MaterialIcons.ttf'
    ];
    
    for (const fontName of fontNames) {
      const fontPath = path.join(iconFontsDir, fontName);
      fs.writeFileSync(fontPath, '');
      console.log(`Created empty font file: ${fontName}`);
    }
  } else {
    console.log('Vector icons directory exists');
  }
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
  
  // Remove web-build directory
  execSync('rm -rf web-build', { cwd: expoAppDir, stdio: 'inherit' });
  
  // Remove any Metro bundler caches
  execSync('rm -rf ~/.expo', { stdio: 'inherit' });
  
  // Clean require cache at runtime
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
        `APP_VERSION = "1.0.2 - ${currentDateString} - BUILD-${timestamp}"`
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
  '--max-workers', '2'   // Limit workers to avoid memory issues
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
    const currentVersion = versionMatch ? versionMatch[1] : `1.0.2 - ${new Date().toLocaleString()}`;
    
    // Create a tiny JS file that forces the app to show the correct version
    const versionJs = `
// Force version refresh - created at ${new Date().toISOString()}
window.FORCE_APP_VERSION = "${currentVersion}";
window.BUILD_ID = "${BUILD_ID}";
console.log("[Version Injector] Running version: " + window.FORCE_APP_VERSION);

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
      
      // Inject our version script
      if (!htmlContent.includes('version-injector.js')) {
        htmlContent = htmlContent.replace(
          '</head>',
          `<script src="version-injector.js?v=${Date.now()}"></script></head>`
        );
        fs.writeFileSync(indexHtmlPath, htmlContent);
        console.log('Injected version script into index.html');
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