/**
 * Native theme utilities for iOS and Android
 * These utilities help ensure consistent theme application in native environments
 */

import { Capacitor } from '@capacitor/core';

// Default theme colors with hex values
export const defaultThemeColors = {
  blue: '#3b82f6',    // Default blue
  purple: '#8b5cf6',  // Purple
  green: '#10b981',   // Green
  red: '#ef4444',     // Red
  orange: '#f97316',  // Orange
  teal: '#14b8a6',    // Teal
};

/**
 * Apply theme to native elements (like status bar)
 * @param {string} colorName - Name of the color theme
 * @param {boolean} isDarkMode - Whether dark mode is active
 */
export const applyNativeTheme = (colorName, isDarkMode) => {
  if (!Capacitor.isNativePlatform()) return;
  
  const colorValue = defaultThemeColors[colorName] || defaultThemeColors.blue;
  
  try {
    // This could be expanded with plugins like StatusBar
    // For now we'll just log that we're applying native theme
    console.log(`Applying native theme: ${colorName} (${colorValue}) in ${isDarkMode ? 'dark' : 'light'} mode`);
    
    // We could use Status Bar plugin here
    // import { StatusBar } from '@capacitor/status-bar';
    // StatusBar.setBackgroundColor({ color: colorValue });
  } catch (error) {
    console.error('Error applying native theme:', error);
  }
};

/**
 * Apply CSS variables for native compatibility
 * @param {string} colorName - Name of the color theme
 * @param {boolean} isDarkMode - Whether dark mode is active
 * @param {HTMLElement} rootElement - Root element to apply styles to
 */
export const applyNativeCssVariables = (colorName, isDarkMode, rootElement = document.documentElement) => {
  const colorValue = defaultThemeColors[colorName] || defaultThemeColors.blue;
  
  // Set CSS variables for use in stylesheets
  rootElement.style.setProperty('--primary-color', colorValue);
  rootElement.style.setProperty('--is-dark-mode', isDarkMode ? '1' : '0');
  
  // Apply background colors based on mode
  rootElement.style.setProperty('--background-color', 
    isDarkMode ? '#111827' : '#ffffff'
  );
  
  // Force relayout/repaint to ensure changes are applied in native views
  if (Capacitor.isNativePlatform()) {
    // This technique helps force repaints in native webviews
    rootElement.style.opacity = '0.99';
    setTimeout(() => {
      rootElement.style.opacity = '1';
    }, 10);
  }
};

/**
 * Get system preference for dark mode if available
 * @returns {boolean|null} - True if dark mode, false if light, null if unknown
 */
export const getSystemColorScheme = () => {
  if (typeof window !== 'undefined' && 
      window.matchMedia && 
      window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return true;
  } else if (typeof window !== 'undefined' && 
             window.matchMedia && 
             window.matchMedia('(prefers-color-scheme: light)').matches) {
    return false;
  }
  return null;
};