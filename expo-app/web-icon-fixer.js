/**
 * Web Icon Fixer - Specialized solution for icon loading on the web platform
 * 
 * This script provides a comprehensive fix for React Native Vector Icons in web builds
 * by modifying the web build to properly include and display icon fonts.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const appDir = __dirname;
const webDir = path.join(appDir, 'web');
const publicPath = process.env.PUBLIC_URL || '/app';

// Create necessary directories
function createDirectories() {
  const directories = [
    path.join(webDir, 'fonts'),
    path.join(webDir, 'assets'),
    path.join(appDir, 'assets', 'fonts')
  ];
  
  directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
    }
  });
}

// Copy fonts from node_modules to web and assets directories
function copyFonts() {
  // Font sources (try multiple locations)
  const possibleFontDirs = [
    path.join(appDir, 'node_modules', 'react-native-vector-icons', 'Fonts'),
    path.join(appDir, '..', 'node_modules', 'react-native-vector-icons', 'Fonts'),
    path.join(appDir, 'node_modules', '@expo', 'vector-icons', 'build', 'vendor', 'react-native-vector-icons', 'Fonts'),
    path.join(appDir, '..', 'node_modules', '@expo', 'vector-icons', 'build', 'vendor', 'react-native-vector-icons', 'Fonts')
  ];
  
  // Find the first directory that exists
  let sourceFontDir = null;
  for (const dir of possibleFontDirs) {
    if (fs.existsSync(dir)) {
      sourceFontDir = dir;
      break;
    }
  }
  
  if (!sourceFontDir) {
    console.error('Could not find vector icon fonts directory');
    // Create fallback directory
    sourceFontDir = possibleFontDirs[0];
    fs.mkdirSync(sourceFontDir, { recursive: true });
    console.log(`Created fallback fonts directory: ${sourceFontDir}`);
  }
  
  // Destinations
  const webFontsDir = path.join(webDir, 'fonts');
  const webAssetsDir = path.join(webDir, 'assets');
  const assetsFontsDir = path.join(appDir, 'assets', 'fonts');
  
  // Font names
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
  
  // Copy or create each font
  fontNames.forEach(fontName => {
    const sourcePath = path.join(sourceFontDir, fontName);
    
    // Try to copy from source or download if not available
    let fontContent = '';
    
    if (fs.existsSync(sourcePath)) {
      fontContent = fs.readFileSync(sourcePath);
      console.log(`Found font: ${fontName}`);
    } else {
      console.log(`Font not found, creating empty placeholder: ${fontName}`);
    }
    
    // Write to all destinations
    fs.writeFileSync(path.join(webFontsDir, fontName), fontContent);
    fs.writeFileSync(path.join(webAssetsDir, fontName), fontContent);
    fs.writeFileSync(path.join(assetsFontsDir, fontName), fontContent);
  });
  
  console.log('Fonts copied to web and assets directories');
}

// Create CSS file for icon fonts
function createIconCss() {
  const cssPath = path.join(webDir, 'vector-icons.css');
  
  // Font names
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
  
  // Create CSS content with multiple font paths
  const cssContent = fontNames.map(font => {
    const fontFamily = font.replace('.ttf', '');
    return `
@font-face {
  font-family: '${fontFamily}';
  src: url('${publicPath}/fonts/${font}') format('truetype'),
       url('${publicPath}/assets/${font}') format('truetype'),
       url('./fonts/${font}') format('truetype'),
       url('./assets/${font}') format('truetype'),
       url('../assets/fonts/${font}') format('truetype');
  font-weight: normal;
  font-style: normal;
  font-display: block;
}`;
  }).join('\n');
  
  // Add SVG icon fixes
  const fullCssContent = `${cssContent}

/* Fix for broken SVGs */
svg[width="0"], svg[height="0"] {
  width: 24px !important;
  height: 24px !important;
}

/* Ensure icons are visible */
.material-icons-fallback::before {
  font-family: 'MaterialCommunityIcons';
  content: "\\f12e"; 
}

.hamburger-menu-icon::before {
  font-family: 'MaterialCommunityIcons';
  content: "\\f35c"; 
  font-size: 24px;
}

.settings-icon::before {
  font-family: 'MaterialCommunityIcons';
  content: "\\f493"; 
  font-size: 24px;
}

.dashboard-icon::before {
  font-family: 'MaterialCommunityIcons';
  content: "\\f1c8"; 
  font-size: 24px;
}
`;
  
  fs.writeFileSync(cssPath, fullCssContent);
  console.log('Created vector-icons.css');
}

// Create a HTML template to inject into the index.html
function createHtmlTemplate() {
  const content = `
<!-- Icon Font Preloading -->
<link rel="preload" href="${publicPath}/fonts/MaterialCommunityIcons.ttf" as="font" type="font/ttf" crossorigin="anonymous">
<link rel="preload" href="${publicPath}/fonts/FontAwesome.ttf" as="font" type="font/ttf" crossorigin="anonymous">
<link rel="preload" href="${publicPath}/fonts/Ionicons.ttf" as="font" type="font/ttf" crossorigin="anonymous">

<!-- Icon Font CSS -->
<link rel="stylesheet" href="${publicPath}/vector-icons.css?v=${Date.now()}">

<!-- Direct icon font declarations -->
<style id="vector-icons-style">
  /* Direct CSS for vector icons */
  @font-face {
    font-family: "MaterialCommunityIcons";
    src: url("${publicPath}/fonts/MaterialCommunityIcons.ttf") format("truetype");
    font-weight: normal;
    font-style: normal;
    font-display: block;
  }
  
  @font-face {
    font-family: "FontAwesome";
    src: url("${publicPath}/fonts/FontAwesome.ttf") format("truetype");
    font-weight: normal;
    font-style: normal;
    font-display: block;
  }
  
  @font-face {
    font-family: "Ionicons";
    src: url("${publicPath}/fonts/Ionicons.ttf") format("truetype");
    font-weight: normal;
    font-style: normal;
    font-display: block;
  }
  
  /* Fix for broken SVGs */
  svg[width="0"], svg[height="0"] {
    width: 24px !important;
    height: 24px !important;
  }
</style>

<!-- Public path configuration -->
<script>
  window.EXPO_PUBLIC_PATH = '${publicPath}';
  
  // Fix asset paths
  window.fixAssetPath = function(path) {
    if (!path) return path;
    if (path.startsWith('/')) {
      return window.EXPO_PUBLIC_PATH + path;
    }
    return path;
  };
  
  // Override asset loading
  document.addEventListener('DOMContentLoaded', function() {
    // Fix image sources
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      if (img.src && img.src.startsWith('http') && img.src.includes('/assets/')) {
        const newSrc = img.src.replace(/\/assets\//g, window.EXPO_PUBLIC_PATH + '/assets/');
        if (img.src !== newSrc) {
          img.src = newSrc;
        }
      }
    });
    
    // Create a MutationObserver to handle dynamically added images
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.addedNodes) {
          mutation.addedNodes.forEach(function(node) {
            if (node.tagName === 'IMG') {
              if (node.src && node.src.startsWith('http') && node.src.includes('/assets/')) {
                const newSrc = node.src.replace(/\/assets\//g, window.EXPO_PUBLIC_PATH + '/assets/');
                if (node.src !== newSrc) {
                  node.src = newSrc;
                }
              }
            }
          });
        }
      });
    });
    
    // Observe the entire document
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  });
</script>
`;
  
  const templatePath = path.join(webDir, 'icon-template.html');
  fs.writeFileSync(templatePath, content);
  console.log('Created HTML template for icon font injection');
}

// Create a function to modify the app.json to include font assets
function updateAppJson() {
  const appJsonPath = path.join(appDir, 'app.json');
  
  if (fs.existsSync(appJsonPath)) {
    try {
      const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
      
      // Ensure the expo section exists
      if (!appJson.expo) {
        appJson.expo = {};
      }
      
      // Configure web fonts
      if (!appJson.expo.web) {
        appJson.expo.web = {};
      }
      
      appJson.expo.web.favicon = './assets/favicon.png';
      
      // Define font paths for native
      if (!appJson.expo.packagerOpts) {
        appJson.expo.packagerOpts = {};
      }
      
      if (!appJson.expo.packagerOpts.assetExts) {
        appJson.expo.packagerOpts.assetExts = [];
      }
      
      if (!appJson.expo.packagerOpts.assetExts.includes('ttf')) {
        appJson.expo.packagerOpts.assetExts.push('ttf');
      }
      
      // Define fonts to be loaded
      if (!appJson.expo.fonts) {
        appJson.expo.fonts = [];
      }
      
      const fontPaths = [
        './assets/fonts/MaterialCommunityIcons.ttf',
        './assets/fonts/FontAwesome.ttf',
        './assets/fonts/Ionicons.ttf'
      ];
      
      fontPaths.forEach(fontPath => {
        if (!appJson.expo.fonts.includes(fontPath)) {
          appJson.expo.fonts.push(fontPath);
        }
      });
      
      // Write the updated app.json
      fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2));
      console.log('Updated app.json with font configuration');
    } catch (error) {
      console.error('Error updating app.json:', error);
    }
  }
}

// Create a React component that ensures Material icons are loaded
function createIconComponent() {
  const componentPath = path.join(appDir, 'src', 'components', 'IconFallback.js');
  
  // Create the directory if it doesn't exist
  const componentDir = path.dirname(componentPath);
  if (!fs.existsSync(componentDir)) {
    fs.mkdirSync(componentDir, { recursive: true });
  }
  
  const componentContent = `import React, { useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

/**
 * IconFallback component
 * This is a workaround for web to ensure MaterialCommunityIcons are loaded
 * It renders an invisible icon to trigger font loading
 */
export const IconFallback = () => {
  // Only needed on web platform
  if (Platform.OS !== 'web') {
    return null;
  }
  
  useEffect(() => {
    // Fix for web platform - ensure icons are injected in the DOM
    if (Platform.OS === 'web') {
      // Add class to help diagnose icon issues
      document.body.classList.add('has-icon-fallback');
      
      // Create a style element for icon fixes if it doesn't exist
      if (!document.getElementById('material-icons-fix')) {
        const style = document.createElement('style');
        style.id = 'material-icons-fix';
        style.textContent = \`
          @font-face {
            font-family: 'MaterialCommunityIcons';
            src: url('\${window.EXPO_PUBLIC_PATH || ''}/fonts/MaterialCommunityIcons.ttf') format('truetype');
            font-weight: normal;
            font-style: normal;
            font-display: block;
          }
          
          /* Fix for broken SVGs */
          svg[width="0"], svg[height="0"] {
            width: 24px !important;
            height: 24px !important;
          }
        \`;
        document.head.appendChild(style);
      }
    }
  }, []);
  
  return (
    <View style={styles.container}>
      {/* These invisible icons ensure the font is loaded */}
      <MaterialCommunityIcons name="home" size={1} color="transparent" />
      <MaterialCommunityIcons name="menu" size={1} color="transparent" />
      <MaterialCommunityIcons name="cog" size={1} color="transparent" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    opacity: 0,
    width: 0,
    height: 0,
    overflow: 'hidden',
  },
});

export default IconFallback;
`;
  
  fs.writeFileSync(componentPath, componentContent);
  console.log('Created IconFallback component');
}

// Create a file to patch App.js to include IconFallback
function createAppPatch() {
  const patchPath = path.join(appDir, 'AddIconFallback.js');
  
  const patchContent = `/**
 * This file helps add the IconFallback component to App.js
 * It can be imported in App.js as a custom component
 */

import React from 'react';
import { View } from 'react-native';
import IconFallback from './src/components/IconFallback';

// Wrap your app content with this component
export const withIconFallback = (WrappedComponent) => {
  return (props) => (
    <View style={{ flex: 1 }}>
      <IconFallback />
      <WrappedComponent {...props} />
    </View>
  );
};

// Alternative method: add this directly in your App.js render function
export const IconFallbackRenderer = () => <IconFallback />;
`;
  
  fs.writeFileSync(patchPath, patchContent);
  console.log('Created App.js patch for IconFallback');
}

// Main function to run all fixes
function main() {
  console.log('Starting web icon fixes...');
  
  // Create directories
  createDirectories();
  
  // Copy fonts
  copyFonts();
  
  // Create CSS file
  createIconCss();
  
  // Create HTML template
  createHtmlTemplate();
  
  // Update app.json
  updateAppJson();
  
  // Create IconFallback component
  createIconComponent();
  
  // Create App.js patch
  createAppPatch();
  
  console.log('Web icon fixes completed successfully');
}

// Run the main function
main();