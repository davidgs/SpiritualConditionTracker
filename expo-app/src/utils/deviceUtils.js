import { Dimensions, Platform } from 'react-native';

/**
 * Get the current dimensions of the device window
 */
export const getWindowDimensions = () => {
  return Dimensions.get('window');
};

/**
 * Check if the current device is considered a mobile device (small screen)
 * @param {number} threshold - Width threshold in pixels to consider mobile (default: 768px)
 * @returns {boolean} - True if device screen width is less than the threshold
 */
export const isMobileDevice = (threshold = 768) => {
  const { width } = getWindowDimensions();
  return width < threshold;
};

/**
 * Listen for dimension changes
 * @param {function} callback - Function to call when dimensions change
 * @returns {function} - Function to remove the event listener
 */
export const addDimensionListener = (callback) => {
  const subscription = Dimensions.addEventListener('change', callback);
  return () => subscription.remove();
};

/**
 * Get platform information
 * @returns {object} - Platform information
 */
export const getPlatformInfo = () => {
  return {
    isIOS: Platform.OS === 'ios',
    isAndroid: Platform.OS === 'android',
    isWeb: Platform.OS === 'web',
    version: Platform.Version,
    os: Platform.OS,
  };
};