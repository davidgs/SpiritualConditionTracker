// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('@expo/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

// Add platform-specific extensions for module resolution
// This ensures .web.js files are used when running on web platform
defaultConfig.resolver.sourceExts = process.env.RN_SRC_EXT
  ? [...process.env.RN_SRC_EXT.split(',').map(ext => ext.trim()), ...defaultConfig.resolver.sourceExts]
  : [...defaultConfig.resolver.sourceExts, 'web.js', 'web.ts', 'web.tsx', 'web.jsx'];

module.exports = defaultConfig;