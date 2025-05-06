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

// Create a timestamp to prevent caching
const timestamp = new Date().getTime();
env.EXPO_CACHE_BUSTER = timestamp.toString();
env.METRO_CACHE_BUSTER = timestamp.toString();
env.TIMESTAMP = timestamp.toString();

// Start Expo with maximum cache-clearing options
const expo = spawn('npx', [
  'expo', 
  'start', 
  '--web', 
  '--port', PORT.toString(),
  '--host', 'lan',       // Important: use LAN host mode for external access
  '--clear',             // Clear the cache
  '--no-dev',            // Disable development mode for better reliability
  '--reset-cache'        // Reset the cache entirely
], {
  cwd: expoAppDir,
  env: env,
  stdio: 'inherit'  // Direct output to terminal
});

console.log(`Started Expo with PID ${expo.pid}`);

// Simple process handlers
process.on('SIGINT', () => {
  console.log('Shutting down Expo...');
  expo.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Terminating Expo...');
  expo.kill();
  process.exit(0);
});