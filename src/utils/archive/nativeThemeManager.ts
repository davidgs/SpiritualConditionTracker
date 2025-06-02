/**
 * Native Theme Manager
 * Specialized theming utilities for native iOS and Android environments
 */

import { Capacitor } from '@capacitor/core';
import { primaryColors } from './muiThemeColors';

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
 * Apply native UI elements styling for iOS
 * @param {string} colorName - Primary color name
 * @param {string} mode - 'light' or 'dark'
 */
export function applyNativeThemeStyling(colorName, mode) {
  if (!Capacitor.isNativePlatform()) return;
  
  const isIOS = Capacitor.getPlatform() === 'ios';
  const isAndroid = Capacitor.getPlatform() === 'android';
  const isDark = mode === 'dark';
  
  try {
    // Get color values
    const primaryColor = primaryColors[colorName]?.main || primaryColors.blue.main;
    const contrastText = getContrastText(primaryColor);
    
    // Use StatusBar plugin if available
    if (typeof StatusBar !== 'undefined') {
      if (isIOS) {
        StatusBar.setStyle({
          style: isDark ? 'DARK' : 'LIGHT'
        });
      } else if (isAndroid) {
        StatusBar.setBackgroundColor({ color: primaryColor });
        StatusBar.setStyle({
          style: contrastText === '#ffffff' ? 'LIGHT' : 'DARK'
        });
      }
    }
    
    // Apply navigation bar color for Android
    if (isAndroid && typeof NavigationBar !== 'undefined') {
      NavigationBar.setBackgroundColor({ color: primaryColor });
      NavigationBar.setColor({ color: primaryColor });
    }

    // Log theme application for native platforms
    console.log(`Applied native theme: ${colorName} in ${isDark ? 'dark' : 'light'} mode on ${Capacitor.getPlatform()}`);
    
  } catch (err) {
    console.error('Error applying native theme:', err);
  }
}

/**
 * Generate CSS styles for native app theme
 * @param {string} colorName - Primary color name
 * @param {string} mode - 'light' or 'dark'
 * @returns {string} CSS style string
 */
export function generateNativeThemeStyles(colorName, mode) {
  // Only proceed if we're in a native environment
  if (!Capacitor.isNativePlatform()) return '';
  
  const isDark = mode === 'dark';
  const primaryColor = primaryColors[colorName]?.main || primaryColors.blue.main;
  const lightVariant = primaryColors[colorName]?.light || primaryColors.blue.light;
  const darkVariant = primaryColors[colorName]?.dark || primaryColors.blue.dark;
  
  // Create CSS string that will be injected into the WebView
  return `
    :root {
      --ion-color-primary: ${primaryColor};
      --ion-color-primary-rgb: ${hexToRgb(primaryColor)};
      --ion-color-primary-contrast: ${getContrastText(primaryColor)};
      --ion-color-primary-shade: ${darkVariant};
      --ion-color-primary-tint: ${lightVariant};
      
      --ion-background-color: ${isDark ? '#111827' : '#f0f2f5'};
      --ion-text-color: ${isDark ? '#f3f4f6' : '#1f2937'};
      
      --ion-toolbar-background: ${isDark ? '#1f2937' : primaryColor};
      --ion-toolbar-color: ${isDark ? '#f3f4f6' : getContrastText(primaryColor)};
      
      --ion-tab-bar-background: ${isDark ? '#0f172a' : '#ffffff'};
      --ion-tab-bar-color: ${isDark ? '#6b7280' : '#6b7280'};
      --ion-tab-bar-color-selected: ${primaryColor};
    }
    
    ion-content {
      --background: ${isDark ? '#111827' : '#f0f2f5'};
    }
    
    ion-card {
      --background: ${isDark ? '#1f2937' : '#ffffff'};
      border-left: 2px solid ${primaryColor};
    }
    
    ion-item {
      --background: ${isDark ? '#1f2937' : '#ffffff'};
      --color: ${isDark ? '#f3f4f6' : '#111827'};
    }
    
    ion-button {
      --background: ${primaryColor};
      --color: ${getContrastText(primaryColor)};
    }
  `;
}

/**
 * Helper: Convert hex color to RGB format
 * @param {string} hex - Hex color code
 * @returns {string} RGB values as comma-separated string
 */
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
}

/**
 * Apply and inject all native theme settings
 * @param {string} colorName - Primary color name
 * @param {string} mode - 'light' or 'dark'
 */
export function applyCompleteNativeTheme(colorName, mode) {
  if (!Capacitor.isNativePlatform()) return;
  
  // Apply native UI styling
  applyNativeThemeStyling(colorName, mode);
  
  // Inject CSS for WebView
  const styleContent = generateNativeThemeStyles(colorName, mode);
  injectStylesheet(styleContent, 'native-theme-styles');
}

/**
 * Helper: Inject stylesheet into document
 * @param {string} css - CSS content
 * @param {string} id - ID for the style element
 */
function injectStylesheet(css, id) {
  // Remove existing style element if it exists
  const existingStyle = document.getElementById(id);
  if (existingStyle) {
    existingStyle.remove();
  }
  
  // Create and append new style element
  const style = document.createElement('style');
  style.id = id;
  style.textContent = css;
  document.head.appendChild(style);
}

export default applyCompleteNativeTheme;