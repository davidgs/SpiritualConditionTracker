/**
 * Enhanced production server with assets proxy support
 * This version properly handles serving assets behind an /app path
 */

const express = require('express');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');
const crypto = require('crypto');
const http = require('http');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

// Constants
const PORT = process.env.PORT || 3243;
const HOST = process.env.HOST || '0.0.0.0';
const APP_PATH = process.env.APP_PATH || '/app';
const APP_VERSION = '1.0.2';
const EXPO_APP_DIR = path.join(__dirname, 'expo-app');
const LOG_FILE = path.join(__dirname, 'deployment-debug.log');

// Helper functions
function timestamp() {
  return new Date().toISOString();
}

function log(message, type = 'INFO') {
  const logMessage = `${timestamp()} [${type}] ${message}`;
  console.log(logMessage);
  writeLog(logMessage);
}

function writeLog(message) {
  fs.appendFileSync(LOG_FILE, message + '\n');
}

// Fix vector icons for web
function fixVectorIcons() {
  log('Setting up vector icons for web...');
  
  // Original font files location
  const originalFontsDir = path.join(__dirname, 'node_modules', 'react-native-vector-icons', 'Fonts');
  
  // Main node_modules vector icons path
  const iconFontsDir = path.join(EXPO_APP_DIR, 'node_modules', '@expo', 'vector-icons', 'build', 'vendor', 'react-native-vector-icons', 'Fonts');
  
  // Assets directory for when webpack is looking for assets
  const assetsDir = path.join(EXPO_APP_DIR, 'assets', 'fonts');
  
  // Web directory path
  const webDir = path.join(EXPO_APP_DIR, 'web');
  const webFontsDir = path.join(webDir, 'fonts');
  const webAssetsDir = path.join(webDir, 'assets');
  
  // Create all directories if they don't exist
  [iconFontsDir, assetsDir, webFontsDir, webAssetsDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      log(`Created directory: ${dir}`);
    }
  });
  
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
  
  // Copy font files from original location to all required directories
  for (const fontName of fontNames) {
    const originalFontPath = path.join(originalFontsDir, fontName);
    
    // Check if original font exists
    if (fs.existsSync(originalFontPath)) {
      const fontContent = fs.readFileSync(originalFontPath);
      
      // Copy to node_modules path
      const nodeModulesFontPath = path.join(iconFontsDir, fontName);
      fs.writeFileSync(nodeModulesFontPath, fontContent);
      log(`Copied font to node_modules: ${fontName}`);
      
      // Copy to web/fonts directory
      const webFontPath = path.join(webFontsDir, fontName);
      fs.writeFileSync(webFontPath, fontContent);
      log(`Copied font to web directory: ${fontName}`);
      
      // Copy to assets directory
      const assetsFontPath = path.join(assetsDir, fontName);
      fs.writeFileSync(assetsFontPath, fontContent);
      log(`Copied font to assets directory: ${fontName}`);
      
      // Copy to web/assets directory (for webpack)
      const webAssetsFontPath = path.join(webAssetsDir, fontName);
      fs.writeFileSync(webAssetsFontPath, fontContent);
      log(`Copied font to web/assets directory: ${fontName}`);
    } else {
      log(`Original font not found: ${fontName}, creating empty placeholders`, 'WARN');
      
      // Create empty files as fallback
      const nodeModulesFontPath = path.join(iconFontsDir, fontName);
      fs.writeFileSync(nodeModulesFontPath, '');
      
      const webFontPath = path.join(webFontsDir, fontName);
      fs.writeFileSync(webFontPath, '');
      
      const assetsFontPath = path.join(assetsDir, fontName);
      fs.writeFileSync(assetsFontPath, '');
      
      const webAssetsFontPath = path.join(webAssetsDir, fontName);
      fs.writeFileSync(webAssetsFontPath, '');
    }
  }
  
  // Create a CSS file with multiple paths to try to load the fonts
  const cssContent = fontNames.map(font => {
    const fontFamily = font.replace('.ttf', '');
    return `
@font-face {
  font-family: '${fontFamily}';
  src: url('./fonts/${font}') format('truetype'),
       url('./assets/${font}') format('truetype'),
       url('../assets/fonts/${font}') format('truetype'),
       url('${APP_PATH}/fonts/${font}') format('truetype'),
       url('${APP_PATH}/assets/${font}') format('truetype');
  font-weight: normal;
  font-style: normal;
}`;
  }).join('\n');
  
  const cssPath = path.join(webDir, 'vector-icons.css');
  fs.writeFileSync(cssPath, cssContent);
  log('Created CSS file for vector icons with multiple font paths');
  
  // Also add global styles for SVG icons as fallback
  const svgCssPath = path.join(webDir, 'svg-icons.css');
  const svgCssContent = `
/* Fallback styles for SVG icons */
svg[width="0"], svg[height="0"] {
  width: 24px !important;
  height: 24px !important;
}
  `;
  fs.writeFileSync(svgCssPath, svgCssContent);
}

// Ensure the app knows it's served from a subdirectory
function updatePublicPath() {
  log('Updating public path configuration...');
  
  // Create an environment.js file with the public path config
  const envJsPath = path.join(EXPO_APP_DIR, 'environment.js');
  const envJsContent = `
// This file is auto-generated on server start - DO NOT EDIT MANUALLY
// It provides environment variables to the application
window.EXPO_PUBLIC_PATH = '${APP_PATH}';
window.APP_VERSION = '${APP_VERSION}-${Date.now()}';

// Fix asset paths
window.fixAssetPath = function(path) {
  if (!path) return path;
  if (path.startsWith('/')) {
    return window.EXPO_PUBLIC_PATH + path;
  }
  return path;
};

// Override Image and asset loading
if (window.Image) {
  const originalImage = window.Image;
  window.Image = function(width, height) {
    const img = new originalImage(width, height);
    const originalSrcSetter = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src').set;
    
    Object.defineProperty(img, 'src', {
      set(value) {
        const fixedPath = window.fixAssetPath(value);
        originalSrcSetter.call(this, fixedPath);
      },
      get() {
        return Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src').get.call(this);
      }
    });
    
    return img;
  };
  window.Image.prototype = originalImage.prototype;
}
`;
  fs.writeFileSync(envJsPath, envJsContent);
  log('Created environment.js with public path configuration');
}

// Main function to start the server
async function main() {
  log(`Starting production server with assets proxy on port ${PORT}`);
  
  // Fix vector icons
  fixVectorIcons();
  
  // Update public path
  updatePublicPath();
  
  // Create Express app
  const app = express();
  const server = http.createServer(app);
  
  // Middleware setup
  app.use(cors());
  
  // Custom middleware to log requests
  app.use((req, res, next) => {
    log(`${req.method} ${req.url}`, 'REQUEST');
    next();
  });
  
  // Copy the logo file to public directory
  const logoSrc = path.join(__dirname, 'logo.jpg');
  const logoDest = path.join(__dirname, 'public', 'logo.jpg');
  if (fs.existsSync(logoSrc)) {
    fs.mkdirSync(path.join(__dirname, 'public'), { recursive: true });
    fs.copyFileSync(logoSrc, logoDest);
    log('Logo copied to public directory');
  }
  
  // Fix index.html paths
  const indexHtmlPath = path.join(__dirname, 'index.html');
  if (fs.existsSync(indexHtmlPath)) {
    let indexContent = fs.readFileSync(indexHtmlPath, 'utf8');
    
    // Fix paths to be relative to the app path
    indexContent = indexContent.replace(/src="\/static\//g, `src="${APP_PATH}/static/`);
    indexContent = indexContent.replace(/href="\/static\//g, `href="${APP_PATH}/static/`);
    
    fs.writeFileSync(indexHtmlPath, indexContent);
    log('Fixed paths in index.html');
  }
  
  // Serve the root to redirect to /app path with cache-busting
  app.get('/', (req, res) => {
    const cacheBuster = crypto.randomBytes(8).toString('hex');
    res.redirect(`${APP_PATH}?v=${cacheBuster}`);
  });
  
  // Configure a custom middleware for /assets
  app.use(`${APP_PATH}/assets`, (req, res, next) => {
    // First try to serve from expo-app/web/assets
    const assetPath = path.join(EXPO_APP_DIR, 'web', 'assets', req.path);
    if (fs.existsSync(assetPath)) {
      log(`Serving asset from web/assets: ${req.path}`);
      return res.sendFile(assetPath);
    }
    
    // Then try from expo-app/assets
    const assetPath2 = path.join(EXPO_APP_DIR, 'assets', req.path);
    if (fs.existsSync(assetPath2)) {
      log(`Serving asset from assets directory: ${req.path}`);
      return res.sendFile(assetPath2);
    }
    
    // Then try font directory
    if (req.path.endsWith('.ttf')) {
      const fontName = path.basename(req.path);
      const fontPath = path.join(EXPO_APP_DIR, 'web', 'fonts', fontName);
      if (fs.existsSync(fontPath)) {
        log(`Serving font as asset: ${fontName}`);
        return res.sendFile(fontPath);
      }
    }
    
    // Otherwise proxy to Expo
    next();
  });
  
  // Configure a custom middleware for /fonts
  app.use(`${APP_PATH}/fonts`, (req, res) => {
    const fontName = path.basename(req.path);
    const fontPath = path.join(EXPO_APP_DIR, 'web', 'fonts', fontName);
    
    if (fs.existsSync(fontPath)) {
      log(`Serving font file: ${fontName}`);
      return res.sendFile(fontPath);
    }
    
    log(`Font not found: ${fontName}`, 'ERROR');
    res.status(404).send('Font not found');
  });
  
  // Serve the static files on the app path
  app.use(`${APP_PATH}/static`, express.static(path.join(EXPO_APP_DIR, 'web', 'static')));
  
  // Serve environment.js on the app path
  app.get(`${APP_PATH}/environment.js`, (req, res) => {
    res.sendFile(path.join(EXPO_APP_DIR, 'environment.js'));
  });
  
  // Serve vector-icons.css on the app path
  app.get(`${APP_PATH}/vector-icons.css`, (req, res) => {
    res.sendFile(path.join(EXPO_APP_DIR, 'web', 'vector-icons.css'));
  });
  
  // Serve svg-icons.css on the app path
  app.get(`${APP_PATH}/svg-icons.css`, (req, res) => {
    res.sendFile(path.join(EXPO_APP_DIR, 'web', 'svg-icons.css'));
  });
  
  // Create a proxy to the Expo development server
  const expoProxy = createProxyMiddleware({
    target: `http://localhost:19006`, // Expo's web server port
    changeOrigin: true,
    ws: true,
    pathRewrite: function (path, req) {
      return path.replace(APP_PATH, '');
    },
    onProxyReq: (proxyReq, req, res) => {
      log(`Proxying request: ${req.method} ${req.url}`, 'PROXY');
    },
    onProxyRes: (proxyRes, req, res) => {
      log(`Proxy response: ${proxyRes.statusCode} ${req.url}`, 'PROXY');
      
      // Add cache-control headers to prevent caching
      proxyRes.headers['cache-control'] = 'no-store, no-cache, must-revalidate, proxy-revalidate';
      proxyRes.headers['pragma'] = 'no-cache';
      proxyRes.headers['expires'] = '0';
      
      // If this is an HTML response, we need to inject our environment.js script
      if (proxyRes.headers['content-type'] && proxyRes.headers['content-type'].includes('text/html')) {
        let body = '';
        const originalWrite = res.write;
        const originalEnd = res.end;
        
        // Override write
        res.write = function(chunk) {
          body += chunk.toString('utf8');
          return true;
        };
        
        // Override end
        res.end = function(chunk) {
          if (chunk) {
            body += chunk.toString('utf8');
          }
          
          // Add our environment script before the first script tag
          body = body.replace('<head>', `<head>
<script src="${APP_PATH}/environment.js?v=${Date.now()}"></script>
<link rel="stylesheet" href="${APP_PATH}/vector-icons.css?v=${Date.now()}">
<link rel="stylesheet" href="${APP_PATH}/svg-icons.css?v=${Date.now()}">
<link rel="preload" href="${APP_PATH}/fonts/MaterialCommunityIcons.ttf" as="font" type="font/ttf" crossorigin="anonymous">
<link rel="preload" href="${APP_PATH}/fonts/FontAwesome.ttf" as="font" type="font/ttf" crossorigin="anonymous">
<link rel="preload" href="${APP_PATH}/fonts/Ionicons.ttf" as="font" type="font/ttf" crossorigin="anonymous">
`);
          
          // Replace all asset paths
          body = body.replace(/src="\//g, `src="${APP_PATH}/`);
          body = body.replace(/href="\//g, `href="${APP_PATH}/`);
          
          // Fix manifest.json path
          body = body.replace(/manifest.json/g, `${APP_PATH}/manifest.json`);
          
          // Fix asset paths
          body = body.replace(/\/assets\//g, `${APP_PATH}/assets/`);
          
          // Add our fix for asset paths
          body = body.replace('</body>', `
<script>
  // Fix all image sources that should be relative to app path
  document.addEventListener('DOMContentLoaded', function() {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      if (img.src && img.src.includes('/assets/')) {
        img.src = img.src.replace(/\/assets\//g, '${APP_PATH}/assets/');
      }
    });
  });
</script>
</body>`);
          
          // Restore original functions and write the modified body
          res.write = originalWrite;
          res.end = originalEnd;
          
          // Send the modified body
          res.write(body);
          res.end();
        };
      }
    },
    onError: (err, req, res) => {
      log(`Proxy error: ${err.message}`, 'ERROR');
      res.status(502).send('Proxy Error: ' + err.message);
    }
  });
  
  // Start Expo development server
  const expoProcess = spawn('node', ['node_modules/expo/bin/cli.js', 'start', '--web', '--no-dev', '--port', '19006'], {
    cwd: EXPO_APP_DIR,
    env: {
      ...process.env,
      NODE_ENV: 'production',
      PUBLIC_URL: APP_PATH,
    },
    stdio: 'pipe'
  });
  
  log('Starting Expo app...');
  
  // Log Expo output
  expoProcess.stdout.on('data', (data) => {
    log(`Expo: ${data.toString().trim()}`, 'EXPO');
  });
  
  expoProcess.stderr.on('data', (data) => {
    log(`Expo Error: ${data.toString().trim()}`, 'EXPO_ERROR');
  });
  
  expoProcess.on('close', (code) => {
    log(`Expo process exited with code ${code}`, 'EXPO');
  });
  
  // Apply the proxy after Expo is started
  setTimeout(() => {
    // Use the proxy for all app path requests
    app.use(APP_PATH, expoProxy);
    
    // Start the server
    server.listen(PORT, HOST, () => {
      log(`Server running at http://${HOST}:${PORT} with app at ${APP_PATH}`);
    });
  }, 5000); // Wait for Expo to start
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  log('Server shutting down...', 'SHUTDOWN');
  process.exit(0);
});

// Start the server
main().catch(err => {
  log(`Error starting server: ${err.message}`, 'ERROR');
  console.error(err);
});