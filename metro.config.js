// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Find the project directory
const projectRoot = __dirname;
// App is now directly in the project root
const appRoot = projectRoot;

const config = getDefaultConfig(projectRoot);

// 1. Extra node_modules folders to include
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
];

// 2. Watch all files in the project for changes
config.watchFolders = [
  projectRoot,
];

// 3. Ensure specific dependencies are properly resolved
config.resolver.extraNodeModules = {
  '@react-native-async-storage/async-storage': 
    path.resolve(projectRoot, 'node_modules', '@react-native-async-storage', 'async-storage'),
  '@expo/metro-config': 
    path.resolve(projectRoot, 'node_modules', '@expo', 'metro-config'),
  '@expo/metro-runtime': 
    path.resolve(projectRoot, 'node_modules', '@expo', 'metro-runtime'),
  'react-native-paper-dates': 
    path.resolve(projectRoot, 'node_modules', 'react-native-paper-dates'),
  'react-native-paper': 
    path.resolve(projectRoot, 'node_modules', 'react-native-paper'),
};

// 4. Make Metro use the proper babel transformer
config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve('metro-react-native-babel-transformer'),
};

// 5. Handle common asset extensions
config.resolver.assetExts = [
  ...config.resolver.assetExts,
  'db',
  'sqlite',
  'ttf',
  'obj',
  'png',
  'jpg',
];

module.exports = config;