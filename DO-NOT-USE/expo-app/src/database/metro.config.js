// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Find the project and app directories
const projectRoot = __dirname;
const appRoot = path.resolve(projectRoot, 'src');

const config = getDefaultConfig(projectRoot);

// 1. Extra node_modules folders to include
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
];

// 2. Watch all files in the project for changes
config.watchFolders = [
  projectRoot,
  appRoot,
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

// 4. Make Metro use the proper babel transformer with enhanced configuration
config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve('metro-react-native-babel-transformer'),
  assetPlugins: ['expo-asset/tools/hashAssetFiles'],
  minifierConfig: {
    keep_classnames: true,
    keep_fnames: true,
    mangle: {
      toplevel: false,
      keep_classnames: true,
      keep_fnames: true,
    },
  },
};

// 5. Handle common asset extensions
config.resolver.assetExts = [
  ...config.resolver.assetExts,
  'db',
  'sqlite',
  'ttf',
  'otf',
  'obj',
  'png',
  'jpg',
  'jpeg',
  'svg',
  'gif',
  'webp',
  'bmp',
  'ico',
];

// 6. Ensure proper MIME type handling for web assets
config.resolver.sourceExts = [
  ...config.resolver.sourceExts, 
  'jsx', 
  'tsx',
];

module.exports = config;