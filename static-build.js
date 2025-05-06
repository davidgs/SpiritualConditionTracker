/**
 * Script to build a static version of the Expo app for web
 * This script:
 * 1. Builds the web version using Expo's build commands
 * 2. Creates a static bundle file for index.bundle requests
 * 3. Provides instructions for nginx configuration
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const EXPO_APP_DIR = path.join(__dirname, 'expo-app');
const WEB_BUILD_DIR = path.join(__dirname, 'web-build');
const NGINX_ROOT = '/var/www/html';  // Default nginx web root

// Create a logger
function log(message) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

// Make sure the expo-app directory exists
if (!fs.existsSync(EXPO_APP_DIR)) {
  log(`Error: Expo app directory not found at ${EXPO_APP_DIR}`);
  process.exit(1);
}

// Create web-build directory if it doesn't exist
if (!fs.existsSync(WEB_BUILD_DIR)) {
  fs.mkdirSync(WEB_BUILD_DIR, { recursive: true });
  log(`Created web-build directory at ${WEB_BUILD_DIR}`);
}

// Function to run the build process
async function buildWebApp() {
  try {
    log('Starting web build process...');
    
    // Navigate to the Expo app directory
    process.chdir(EXPO_APP_DIR);
    log(`Changed directory to ${EXPO_APP_DIR}`);
    
    // Try using the newer export command
    try {
      log('Attempting to build the web version with expo export...');
      execSync('npx expo export --platform web', { stdio: 'inherit' });
      log('Expo export completed successfully');
      
      // Check if the export created a 'dist' directory
      const distDir = path.join(EXPO_APP_DIR, 'dist');
      if (fs.existsSync(distDir)) {
        // Copy from dist to web-build
        log(`Copying files from ${distDir} to ${WEB_BUILD_DIR}`);
        execSync(`cp -R ${distDir}/* ${WEB_BUILD_DIR}/`, { stdio: 'inherit' });
        log('Files copied successfully');
      } else {
        log('Warning: dist directory not found after export');
      }
    } catch (error) {
      log(`Expo export failed: ${error.message}`);
      
      // Fall back to older expo build:web command
      log('Falling back to expo build:web...');
      execSync('npx expo build:web', { stdio: 'inherit' });
      log('Expo web build completed successfully');
      
      // Copy from web-build in expo-app to main web-build
      const expoBuildDir = path.join(EXPO_APP_DIR, 'web-build');
      if (fs.existsSync(expoBuildDir)) {
        log(`Copying files from ${expoBuildDir} to ${WEB_BUILD_DIR}`);
        execSync(`cp -R ${expoBuildDir}/* ${WEB_BUILD_DIR}/`, { stdio: 'inherit' });
        log('Files copied successfully');
      } else {
        log('Warning: web-build directory not found in expo-app');
      }
    }
    
    // Create a static bundle file
    createStaticBundle();
    
    // Generate nginx configuration instructions
    generateNginxInstructions();
    
    log('Build process completed successfully!');
    log(`Your static web files are in: ${WEB_BUILD_DIR}`);
    return true;
  } catch (error) {
    log(`Error during build process: ${error.message}`);
    log(error.stack);
    return false;
  }
}

// Function to create a static bundle file
function createStaticBundle() {
  log('Creating static bundle file...');
  
  const bundleContent = `
// Static bundle for Spiritual Condition Tracker
// Enhanced compatibility bundle for Hermes engine & Nginx
(function() {
  console.log('[Bundle] Loading compatibility bundle...');
  
  // Provide minimal mocks for expected Hermes APIs
  if (typeof global !== 'undefined' && !global.HermesInternal) {
    global.HermesInternal = {
      getRuntimeProperties: function() {
        return { 
          "OSS Release Version": "hermes-2023-08-07-RNv0.72.4-node-v18.17.1",
          "Build Mode": "Release", 
          "Bytecode Version": 99 
        };
      },
      hasToStringBug: function() { return false; },
      enablePromiseRejectionTracker: function() {},
      enterCriticalSection: function() {},
      exitCriticalSection: function() {},
      handleMemoryPressure: function() {},
      initializeHermesIfNeeded: function() {},
      shouldEnableTurboModule: function() { return false; }
    };
  }
  
  // Setup minimal React environment
  if (typeof window !== 'undefined') {
    // Redirect to root after a short delay if this gets loaded directly
    setTimeout(function() {
      console.log('[Bundle] Redirecting to app root...');
      if (window.location.pathname.includes('index.bundle')) {
        try {
          // Try to use the standard app URL
          window.location.href = '/';
        } catch (e) {
          console.error('[Bundle] Redirect failed:', e);
        }
      }
    }, 500);
  }
  
  // Let the user know this is a compatibility bundle
  console.warn('[Bundle] Running in compatibility mode - this is not the full app bundle');
  console.log('[Bundle] If you see this message in the browser console, you should reload the page or navigate to the app root');
  
  // Export expected modules to prevent errors
  return {
    __esModule: true,
    default: {
      name: 'SpiritualConditionTracker',
      displayName: 'Spiritual Condition Tracker',
      expo: {
        name: 'Spiritual Condition Tracker'
      }
    }
  };
})();
`;
  
  const bundlePath = path.join(WEB_BUILD_DIR, 'index.bundle');
  fs.writeFileSync(bundlePath, bundleContent);
  log(`Static bundle created at ${bundlePath}`);
  
  // Also create it in the app/index.bundle path to catch alternate requests
  const appBundleDir = path.join(WEB_BUILD_DIR, 'app');
  if (!fs.existsSync(appBundleDir)) {
    fs.mkdirSync(appBundleDir, { recursive: true });
  }
  
  const appBundlePath = path.join(appBundleDir, 'index.bundle');
  fs.writeFileSync(appBundlePath, bundleContent);
  log(`Created additional bundle at ${appBundlePath}`);
}

// Function to generate nginx configuration instructions
function generateNginxInstructions() {
  const nginxConfig = `
# Nginx configuration for Spiritual Condition Tracker
server {
    listen 80;
    listen [::]:80;
    server_name your-domain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name your-domain.com;
    
    # SSL configuration (adjust paths as needed)
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    # Security headers
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options SAMEORIGIN;
    add_header X-XSS-Protection "1; mode=block";
    
    # Root directory - update this path
    root ${WEB_BUILD_DIR};
    
    # Index files
    index index.html;
    
    # Handle bundle requests
    location = /index.bundle {
        types { } default_type "application/javascript";
        alias ${WEB_BUILD_DIR}/index.bundle;
    }
    
    location = /app/index.bundle {
        types { } default_type "application/javascript";
        alias ${WEB_BUILD_DIR}/app/index.bundle;
    }
    
    # Asset caching
    location ~* \\.(?:jpg|jpeg|gif|png|ico|svg|woff|woff2|ttf|css|js)$ {
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
    }
    
    # Handle React Router paths (client-side routing)
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Additional location for /app path
    location /app/ {
        try_files $uri $uri/ /index.html;
    }
    
    # Error pages
    error_page 404 /index.html;
    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
    }
}
`;

  const nginxConfigPath = path.join(__dirname, 'nginx-static-app.conf');
  fs.writeFileSync(nginxConfigPath, nginxConfig);
  log(`Nginx configuration saved to ${nginxConfigPath}`);
  
  // Create a deployment guide
  const deploymentGuide = `
# Static Deployment Guide for Spiritual Condition Tracker

## Step 1: Build the App
Run the static build script to create a production-ready version:
\`\`\`
node static-build.js
\`\`\`

## Step 2: Deploy to Nginx Server
Copy the web-build directory to your nginx server:
\`\`\`
cp -R ${WEB_BUILD_DIR}/* ${NGINX_ROOT}/
\`\`\`

## Step 3: Configure Nginx
1. Copy the nginx configuration file:
\`\`\`
cp ${path.join(__dirname, 'nginx-static-app.conf')} /etc/nginx/sites-available/spiritual-condition.conf
\`\`\`

2. Enable the site:
\`\`\`
ln -s /etc/nginx/sites-available/spiritual-condition.conf /etc/nginx/sites-enabled/
\`\`\`

3. Test the configuration:
\`\`\`
nginx -t
\`\`\`

4. Reload nginx:
\`\`\`
systemctl reload nginx
\`\`\`

## Step 4: Verify Deployment
1. Check that the main app loads:
   https://your-domain.com/

2. Verify the bundle works:
   https://your-domain.com/index.bundle

3. Test the app path:
   https://your-domain.com/app/

## Troubleshooting
- If you see 404 errors, check that the files were copied correctly
- If you see blank pages, check the browser console for errors
- For CORS issues, adjust the nginx headers in the configuration
`;

  const guidePath = path.join(__dirname, 'STATIC_DEPLOYMENT_GUIDE.md');
  fs.writeFileSync(guidePath, deploymentGuide);
  log(`Deployment guide saved to ${guidePath}`);
}

// Run the build process
buildWebApp().then(success => {
  if (success) {
    log('All done! Follow the instructions in STATIC_DEPLOYMENT_GUIDE.md to deploy your app.');
  } else {
    log('Build process failed. Please check the errors above.');
    process.exit(1);
  }
});