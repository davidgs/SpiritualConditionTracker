/**
 * Device detection and dimension handling utilities
 */
import { Platform, Dimensions } from 'react-native';

// Threshold for mobile vs desktop
const MOBILE_WIDTH_THRESHOLD = 768;

/**
 * Detects if the current device is mobile sized
 * Uses screen width for web and platform for native
 */
export const isMobileDevice = () => {
  // For native platforms, use the platform type
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    console.log('Device detection: Native mobile platform detected');
    return true;
  }
  
  // For web, check the viewport width
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const isMobile = window.innerWidth < MOBILE_WIDTH_THRESHOLD;
    console.log(`Device detection: Web platform - width: ${window.innerWidth}px, detected as: ${isMobile ? 'MOBILE' : 'DESKTOP'}`);
    
    // Force mobile for testing
    console.log('Device detection: Forcing MOBILE navigation for testing');
    return true;
  }
  
  // Default to false if unable to determine
  console.log('Device detection: Unable to determine device type, defaulting to desktop');
  return false;
};

/**
 * Adds a listener for dimension changes
 * Useful for responsive layouts
 * 
 * @param {Function} callback Function to call when dimensions change
 * @returns {Function} Function to remove the listener
 */
export const addDimensionListener = (callback) => {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    window.addEventListener('resize', callback);
    return () => window.removeEventListener('resize', callback);
  }
  
  // For native platforms, use Dimensions API
  const subscription = Dimensions.addEventListener('change', callback);
  
  // Return cleanup function
  return () => subscription.remove();
};

/**
 * Gets the current device dimensions
 */
export const getDeviceDimensions = () => {
  return Dimensions.get('window');
};

/**
 * Returns a value based on the device type
 * 
 * @param {any} mobileValue Value to use on mobile devices
 * @param {any} desktopValue Value to use on desktop devices
 * @returns {any} The appropriate value for the current device
 */
export const getResponsiveValue = (mobileValue, desktopValue) => {
  return isMobileDevice() ? mobileValue : desktopValue;
};