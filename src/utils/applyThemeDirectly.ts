/**
 * Direct theme application utilities
 * Applies theme colors directly to DOM elements without requiring a bundle rebuild
 */

import { defaultThemeColors } from './nativeTheme';

// CSS variables for theme colors
const themeVariables = {
  // Primary colors
  '--primary-color': null,
  '--primary-light': null,
  '--primary-dark': null,
  '--primary-contrast': null,
  
  // Background colors
  '--background-color': null,
  '--paper-color': null, 
  '--card-color': null,
  
  // Text colors
  '--text-primary': null,
  '--text-secondary': null,
  
  // UI element colors
  '--button-bg': null,
  '--button-text': null,
  '--input-border': null,
  '--divider-color': null,
  
  // Specific component colors
  '--header-bg': null,
  '--card-header-bg': null,
  '--tab-indicator': null,
};

/**
 * Generate color variants from a base color
 * @param {string} hexColor - Base color in hex format
 * @returns {Object} Object with light and dark variants
 */
function generateColorVariants(hexColor) {
  // Convert hex to RGB
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  
  // Generate light variant (15% lighter)
  const lightR = Math.min(255, Math.floor(r * 1.15));
  const lightG = Math.min(255, Math.floor(g * 1.15));
  const lightB = Math.min(255, Math.floor(b * 1.15));
  const lightVariant = `#${lightR.toString(16).padStart(2, '0')}${lightG.toString(16).padStart(2, '0')}${lightB.toString(16).padStart(2, '0')}`;
  
  // Generate dark variant (15% darker)
  const darkR = Math.floor(r * 0.85);
  const darkG = Math.floor(g * 0.85);
  const darkB = Math.floor(b * 0.85);
  const darkVariant = `#${darkR.toString(16).padStart(2, '0')}${darkG.toString(16).padStart(2, '0')}${darkB.toString(16).padStart(2, '0')}`;
  
  return {
    light: lightVariant,
    dark: darkVariant,
    main: hexColor,
  };
}

/**
 * Calculate if text should be white or black based on background brightness
 * @param {string} bgColor - Background color in hex format
 * @returns {string} '#ffffff' for dark backgrounds, '#000000' for light backgrounds
 */
function getContrastText(bgColor) {
  // Convert hex to RGB
  const r = parseInt(bgColor.slice(1, 3), 16);
  const g = parseInt(bgColor.slice(3, 5), 16);
  const b = parseInt(bgColor.slice(5, 7), 16);
  
  // Calculate brightness
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  
  // Return white for dark backgrounds, black for light backgrounds
  return brightness > 125 ? '#000000' : '#ffffff';
}

/**
 * Set a CSS variable on the document root element
 * @param {string} name - CSS variable name including '--'
 * @param {string} value - CSS value
 */
function setCssVariable(name, value) {
  document.documentElement.style.setProperty(name, value);
}

/**
 * Directly apply a theme color to UI elements via CSS variables
 * @param {string} colorName - One of the color names from defaultThemeColors
 * @param {string} mode - 'light' or 'dark'
 */
export function applyThemeDirectly(colorName, mode) {
  const isDark = mode === 'dark';
  const baseColor = defaultThemeColors[colorName] || defaultThemeColors.blue;
  const variants = generateColorVariants(baseColor);
  const contrastText = getContrastText(baseColor);
  
  // Set primary color variables
  setCssVariable('--primary-color', variants.main);
  setCssVariable('--primary-light', variants.light);
  setCssVariable('--primary-dark', variants.dark);
  setCssVariable('--primary-contrast', contrastText);
  
  // Set background colors
  setCssVariable('--background-color', isDark ? '#111827' : '#f0f2f5');
  setCssVariable('--paper-color', isDark ? '#1f2937' : '#ffffff');
  setCssVariable('--card-color', isDark ? '#1f2937' : '#ffffff');
  
  // Set text colors
  setCssVariable('--text-primary', isDark ? '#f3f4f6' : '#1f2937');
  setCssVariable('--text-secondary', isDark ? '#d1d5db' : '#4b5563');
  
  // Set UI element colors
  setCssVariable('--button-bg', variants.main);
  setCssVariable('--button-text', contrastText);
  setCssVariable('--input-border', isDark ? '#374151' : '#d1d5db');
  setCssVariable('--divider-color', isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)');
  
  // Set specific component colors
  setCssVariable('--header-bg', isDark ? '#0f172a' : variants.light);
  setCssVariable('--card-header-bg', isDark ? '#1a2234' : `${variants.light}80`); // 50% opacity
  setCssVariable('--tab-indicator', variants.main);
  
  // Apply direct styling to common components for immediate effect
  applyDirectStyling(variants, isDark);
}

/**
 * Apply styling directly to DOM elements for immediate effect without rebuild
 * @param {Object} variants - Color variants object {main, light, dark}
 * @param {boolean} isDark - Whether dark mode is active
 */
function applyDirectStyling(variants, isDark) {
  // Style all buttons
  const buttons = document.querySelectorAll('button.MuiButton-containedPrimary');
  buttons.forEach(button => {
    button.style.backgroundColor = variants.main;
    button.style.color = getContrastText(variants.main);
    
    // Add hover effect
    button.onmouseover = () => {
      button.style.backgroundColor = variants.light;
      button.style.transform = 'translateY(-1px)';
      button.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
    };
    
    button.onmouseout = () => {
      button.style.backgroundColor = variants.main;
      button.style.transform = 'translateY(0)';
      button.style.boxShadow = 'none';
    };
  });
  
  // Style app header
  const header = document.querySelector('header');
  if (header) {
    header.style.backgroundColor = isDark ? '#0f172a' : variants.light;
    header.style.borderBottom = `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`;
    header.style.color = isDark ? '#ffffff' : variants.dark;
  }
  
  // Style tabs
  const tabIndicators = document.querySelectorAll('.MuiTabs-indicator');
  tabIndicators.forEach(indicator => {
    indicator.style.backgroundColor = variants.main;
  });
  
  // Style selected tab text
  const selectedTabs = document.querySelectorAll('.Mui-selected');
  selectedTabs.forEach(tab => {
    tab.style.color = variants.main;
  });
  
  // Style paper components
  const papers = document.querySelectorAll('.MuiPaper-root');
  papers.forEach(paper => {
    paper.style.transition = 'all 0.2s ease';
    
    // Add subtle border related to theme color
    if (!paper.style.borderLeft || !paper.style.borderLeft.includes('8px')) {
      paper.style.borderLeft = `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : variants.light}`;
    }
  });
  
  // Style the progress bar
  const progressBars = document.querySelectorAll('.MuiLinearProgress-barColorPrimary');
  progressBars.forEach(bar => {
    bar.style.backgroundColor = variants.main;
  });
  
  // Style links
  const links = document.querySelectorAll('a');
  links.forEach(link => {
    link.style.color = variants.main;
  });
}

export default applyThemeDirectly;