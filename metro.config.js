/**
 * Metro configuration for React Native with Expo
 * https://facebook.github.io/metro/
 *
 * @format
 */

// Use Expo's metro config as the base since we're in an Expo project
const { getDefaultConfig } = require('@expo/metro-config');

// Fallback to React Native's config if Expo's is not available
let config;
try {
  config = getDefaultConfig(__dirname);
} catch (error) {
  try {
    // Try RN's metro-config
    const { getDefaultConfig: getRNDefaultConfig } = require('@react-native/metro-config');
    config = getRNDefaultConfig(__dirname);
  } catch (err) {
    // If all else fails, use a basic config
    config = {
      transformer: {
        getTransformOptions: async () => ({
          transform: {
            experimentalImportSupport: false,
            inlineRequires: true,
          },
        }),
      },
    };
  }
}

module.exports = config;