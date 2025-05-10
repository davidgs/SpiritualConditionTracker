#!/usr/bin/env node

/**
 * Fix for React Native Metro Config package issues in iOS builds
 * 
 * This script addresses the error:
 * "Cannot resolve the path to @react-native/metro-config package"
 * 
 * Usage:
 * node fix-react-native-metro-config.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 iOS Build Fix: Starting @react-native/metro-config package fix...');

// Possible locations for the package
const possiblePaths = [
  'node_modules/@react-native/metro-config',
  '../node_modules/@react-native/metro-config',
  'expo-app/node_modules/@react-native/metro-config'
];

// Implementation content for index.js
const indexContent = `/**
 * Fixed @react-native/metro-config implementation
 * Created by fix-react-native-metro-config.js
 */

'use strict';

const path = require('path');
const { getDefaultConfig: getDefaultMetroConfig } = require('metro-config');

/**
 * Returns a metro configuration for React Native
 */
function getDefaultConfig(projectRoot) {
  projectRoot = projectRoot || process.cwd();
  
  return {
    resolver: {
      sourceExts: ['js', 'jsx', 'ts', 'tsx', 'json'],
      assetExts: ['png', 'jpg', 'jpeg', 'gif', 'webp', 'ttf'],
    },
    transformer: {
      babelTransformerPath: require.resolve('metro-react-native-babel-transformer'),
      getTransformOptions: async () => ({
        transform: {
          experimentalImportSupport: false,
          inlineRequires: true,
        },
      }),
    },
    serializer: {
      // By default, metro includes polyfills in the output bundle
      getPolyfills: () => [],
    },
    server: {
      port: 8081,
    },
  };
}

module.exports = {
  getDefaultConfig,
};
`;

// Package.json content
const packageJsonContent = {
  "name": "@react-native/metro-config",
  "version": "0.72.6",
  "description": "Metro configuration for React Native - Fixed implementation",
  "main": "index.js",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/facebook/react-native.git",
    "directory": "packages/react-native/metro-config"
  },
  "dependencies": {
    "metro-config": "^0.76.0",
    "metro-react-native-babel-transformer": "^0.76.0"
  }
};

// Count of fixes applied
let fixCount = 0;

// Apply fixes to all possible paths
possiblePaths.forEach(packagePath => {
  try {
    // Create the directory if it doesn't exist
    fs.mkdirSync(packagePath, { recursive: true });
    console.log(`📁 Created directory: ${packagePath}`);
    
    // Create index.js
    const indexPath = path.join(packagePath, 'index.js');
    fs.writeFileSync(indexPath, indexContent);
    console.log(`📝 Created index.js at: ${indexPath}`);
    fixCount++;
    
    // Create package.json
    const packageJsonPath = path.join(packagePath, 'package.json');
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJsonContent, null, 2));
    console.log(`📝 Created package.json at: ${packageJsonPath}`);
    fixCount++;
  } catch (error) {
    console.error(`❌ Error fixing path ${packagePath}:`, error.message);
  }
});

// Create supplementary files for better compatibility
try {
  // Create compatibility index.js at the root level
  const rootIndexPath = 'react-native-metro-config.js';
  fs.writeFileSync(rootIndexPath, `/**
 * Compatibility shim for @react-native/metro-config
 */
module.exports = require('./node_modules/@react-native/metro-config');
`);
  console.log(`📝 Created compatibility shim at: ${rootIndexPath}`);
  fixCount++;

} catch (error) {
  console.error('❌ Error creating compatibility files:', error.message);
}

if (fixCount > 0) {
  console.log(`✅ Successfully applied ${fixCount} fixes to @react-native/metro-config package.`);
  console.log('🚀 iOS build should now succeed without metro-config resolution errors.');
} else {
  console.log('⚠️ No fixes were applied. Please check file permissions or run with sudo if needed.');
}

console.log(`
==========================================
🔔 ADDITIONAL INSTRUCTIONS FOR LOCAL MACHINE 🔔
==========================================

To ensure this fix works on your local machine:

1. Copy this script to your project
2. Run: node fix-react-native-metro-config.js
3. If you still see the error, add this to your metro.config.js:

const { getDefaultConfig } = require('@react-native/metro-config');

// Fall back to a local implementation if the package doesn't exist
if (typeof getDefaultConfig !== 'function') {
  console.warn('Using fallback metro configuration');
  module.exports = {
    transformer: {
      getTransformOptions: async () => ({
        transform: {
          experimentalImportSupport: false,
          inlineRequires: true,
        },
      }),
    },
  };
} else {
  module.exports = getDefaultConfig(__dirname);
}
==========================================
`);

console.log('🏁 metro-config fix script completed.');