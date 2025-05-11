// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Find the project directory
const projectRoot = __dirname;

const config = getDefaultConfig(projectRoot);

// 1. Watch all files within the monorepo
config.watchFolders = [projectRoot];

// 2. Let Metro know where to resolve packages
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
];

// 3. Force Metro to resolve specific modules
// This is needed for libraries that have issues with module resolution
config.resolver.extraNodeModules = {
  '@react-native-async-storage/async-storage': 
    path.resolve(projectRoot, 'node_modules', '@react-native-async-storage', 'async-storage'),
  'metro-react-native-babel-transformer': 
    path.resolve(projectRoot, 'node_modules', 'metro-react-native-babel-transformer'),
  'react-native-paper-dates': 
    path.resolve(projectRoot, 'node_modules', 'react-native-paper-dates'),
};

// 4. Handle additional asset extensions
config.resolver.assetExts = [
  ...config.resolver.assetExts,
  'db',
  'sqlite',
  'ttf',
  'obj',
  'png',
  'jpg',
];

// Export the config
module.exports = config;