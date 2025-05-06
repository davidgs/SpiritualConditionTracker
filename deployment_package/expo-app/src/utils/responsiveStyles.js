/**
 * Responsive styling utilities using CSS media queries for React Native Web
 */
import { StyleSheet } from 'react-native';
import { Platform } from 'react-native';

// Define breakpoints (matching common device sizes)
export const breakpoints = {
  small: 480,    // Small phones
  medium: 768,   // Large phones and small tablets
  large: 1024,   // Tablets and small desktops
  xlarge: 1200   // Large desktops
};

/**
 * Creates a stylesheet with responsive variants
 * Each property can have styles for different screen sizes
 * 
 * Example usage:
 * const styles = createResponsiveStyles({
 *   container: {
 *     base: { padding: 10 },
 *     small: { padding: 5 },
 *     medium: { padding: 15 },
 *     large: { padding: 20 }
 *   }
 * });
 */
export const createResponsiveStyles = (stylesObject) => {
  // For native platforms, just use the base styles
  if (Platform.OS !== 'web') {
    const baseStyles = {};
    Object.keys(stylesObject).forEach(key => {
      baseStyles[key] = stylesObject[key].base || {};
    });
    return StyleSheet.create(baseStyles);
  }

  // For web, create a responsive stylesheet
  const stylesheet = {};

  Object.keys(stylesObject).forEach(key => {
    const styleVariants = stylesObject[key];
    
    // Start with base styles
    stylesheet[key] = styleVariants.base || {};
    
    // Add media queries for each breakpoint
    if (styleVariants.small) {
      stylesheet[key + '_small'] = {
        [`@media (max-width: ${breakpoints.small}px)`]: styleVariants.small
      };
    }
    
    if (styleVariants.medium) {
      stylesheet[key + '_medium'] = {
        [`@media (min-width: ${breakpoints.small + 1}px) and (max-width: ${breakpoints.medium}px)`]: styleVariants.medium
      };
    }
    
    if (styleVariants.large) {
      stylesheet[key + '_large'] = {
        [`@media (min-width: ${breakpoints.medium + 1}px) and (max-width: ${breakpoints.large}px)`]: styleVariants.large
      };
    }
    
    if (styleVariants.xlarge) {
      stylesheet[key + '_xlarge'] = {
        [`@media (min-width: ${breakpoints.large + 1}px)`]: styleVariants.xlarge
      };
    }
  });

  return StyleSheet.create(stylesheet);
};

/**
 * CSS classes for responsive design
 * Can be used with className prop in React Native Web
 */
export const responsiveClasses = {
  // Hide elements based on screen size
  hideOnMobile: 'hide-on-mobile',
  hideOnTablet: 'hide-on-tablet',
  hideOnDesktop: 'hide-on-desktop',
  
  // Show elements based on screen size
  showOnlyOnMobile: 'show-only-on-mobile',
  showOnlyOnTablet: 'show-only-on-tablet',
  showOnlyOnDesktop: 'show-only-on-desktop',
  
  // Navigation classes
  mobileNavigation: 'mobile-navigation',
  desktopNavigation: 'desktop-navigation'
};

/**
 * Returns the appropriate navigation type based on screen size
 * This is a utility function to decide between drawer and tabs
 * 
 * @returns {string} 'drawer' for mobile, 'tabs' for desktop
 */
export const getNavigationType = () => {
  // For native platforms, use the platform to determine
  if (Platform.OS !== 'web') {
    return Platform.OS === 'ios' || Platform.OS === 'android' ? 'drawer' : 'tabs';
  }
  
  // For web, use media query to check viewport width
  if (typeof window !== 'undefined') {
    return window.matchMedia(`(max-width: ${breakpoints.medium}px)`).matches ? 'drawer' : 'tabs';
  }
  
  // Default fallback
  return 'tabs';
};

/**
 * Inject global CSS for responsive classes
 * Call this function once at app startup
 */
export const injectResponsiveCSS = () => {
  if (Platform.OS !== 'web') return;
  
  // Create a style element
  const style = document.createElement('style');
  style.type = 'text/css';
  style.id = 'responsive-styles';
  
  // Define the CSS
  const css = `
    /* Hide based on screen size */
    @media (max-width: ${breakpoints.medium}px) {
      .hide-on-mobile {
        display: none !important;
      }
      .desktop-navigation {
        display: none !important;
      }
    }
    
    @media (min-width: ${breakpoints.medium + 1}px) and (max-width: ${breakpoints.large}px) {
      .hide-on-tablet {
        display: none !important;
      }
    }
    
    @media (min-width: ${breakpoints.medium + 1}px) {
      .mobile-navigation {
        display: none !important;
      }
      .show-only-on-mobile {
        display: none !important;
      }
    }
    
    @media (min-width: ${breakpoints.large + 1}px) {
      .hide-on-desktop {
        display: none !important;
      }
      .show-only-on-tablet {
        display: none !important;
      }
    }
    
    /* Show only on specific screen sizes */
    .show-only-on-mobile {
      display: none;
    }
    
    .show-only-on-tablet {
      display: none;
    }
    
    .show-only-on-desktop {
      display: none;
    }
    
    @media (max-width: ${breakpoints.medium}px) {
      .show-only-on-mobile {
        display: block !important;
      }
    }
    
    @media (min-width: ${breakpoints.medium + 1}px) and (max-width: ${breakpoints.large}px) {
      .show-only-on-tablet {
        display: block !important;
      }
    }
    
    @media (min-width: ${breakpoints.large + 1}px) {
      .show-only-on-desktop {
        display: block !important;
      }
    }
  `;
  
  // Add the CSS to the style element
  style.appendChild(document.createTextNode(css));
  
  // Add the style element to the head
  document.head.appendChild(style);
};