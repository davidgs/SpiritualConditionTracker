/**
 * iOS Theme Adapter
 * Connects MUI theming to native iOS styling
 */

import { Capacitor } from '@capacitor/core';

/**
 * Apply MUI theme colors to native iOS components
 * @param {Object} theme - MUI theme object
 */
export function applyMuiThemeToIOS(theme) {
  if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'ios') return;
  
  try {
    const isDark = theme.palette.mode === 'dark';
    const primaryColor = theme.palette.primary.main;
    const primaryColorRGB = hexToRgb(primaryColor);
    const textColor = theme.palette.text.primary;
    
    // This is a CSS string specifically designed for iOS WebView compatibility
    const css = `
      /* iOS WebView Theme Integration */
      :root {
        color-scheme: ${isDark ? 'dark' : 'light'};
        --system-primary-color: ${primaryColor};
        --system-background-color: ${theme.palette.background.default};
        --system-text-color: ${textColor};
      }
      
      /* Global iOS styles */
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -webkit-tap-highlight-color: rgba(${primaryColorRGB}, 0.2);
      }
      
      /* iOS UI override styles */
      .ios-header {
        background-color: ${primaryColor};
        color: ${getContrastColor(primaryColor)};
      }
      
      /* iOS-specific button styles */
      .ios-button {
        border-radius: 10px;
        background-color: ${primaryColor};
        color: ${getContrastColor(primaryColor)};
        font-weight: 600;
        padding: 12px 16px;
      }
      
      /* iOS-style cards */
      .ios-card {
        border-radius: 12px;
        overflow: hidden;
        background-color: ${theme.palette.background.paper};
        box-shadow: 0 1px 3px rgba(0,0,0,0.12);
      }
    `;
    
    // Inject the CSS
    injectStylesheet(css, 'ios-theme-styles');
    
    // Theme applied successfully
  } catch (error) {
    console.error('Error applying iOS theme:', error);
  }
}

/**
 * Helper: Convert hex color to RGB values
 * @param {string} hex - Hex color code
 * @returns {string} RGB values as comma-separated string 
 */
function hexToRgb(hex) {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  return `${r}, ${g}, ${b}`;
}

/**
 * Helper: Determine contrasting text color (black or white)
 * @param {string} hexColor - Background color in hex
 * @returns {string} White or black color for text
 */
function getContrastColor(hexColor) {
  hexColor = hexColor.replace('#', '');
  const r = parseInt(hexColor.substring(0, 2), 16);
  const g = parseInt(hexColor.substring(2, 4), 16);
  const b = parseInt(hexColor.substring(4, 6), 16);
  
  // Calculate luminance - based on WCAG algorithm
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  return luminance > 0.5 ? '#000000' : '#ffffff';
}

/**
 * Helper: Inject a stylesheet into document head
 * @param {string} css - CSS rules string
 * @param {string} id - ID for the style element
 */
function injectStylesheet(css, id) {
  // If a style with this ID already exists, remove it
  const existingStyle = document.getElementById(id);
  if (existingStyle) {
    existingStyle.remove();
  }
  
  // Create and append the new style element
  const style = document.createElement('style');
  style.id = id;
  style.textContent = css;
  document.head.appendChild(style);
}

export default applyMuiThemeToIOS;