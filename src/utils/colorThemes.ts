/**
 * Color theme definitions for Material UI
 * This provides complete, properly structured theme objects for each color
 */

// Base color definitions
const baseColors = {
  blue: {
    light: '#60a5fa',
    main: '#3b82f6',
    dark: '#2563eb',
    contrastText: '#ffffff',
  },
  purple: {
    light: '#a78bfa',
    main: '#8b5cf6',
    dark: '#6d28d9',
    contrastText: '#ffffff',
  },
  green: {
    light: '#34d399',
    main: '#10b981',
    dark: '#059669',
    contrastText: '#ffffff',
  },
  red: {
    light: '#f87171',
    main: '#ef4444',
    dark: '#dc2626',
    contrastText: '#ffffff',
  },
  orange: {
    light: '#fb923c',
    main: '#f97316',
    dark: '#ea580c',
    contrastText: '#ffffff',
  },
  teal: {
    light: '#2dd4bf',
    main: '#14b8a6',
    dark: '#0d9488',
    contrastText: '#ffffff',
  },
};

/**
 * Generate color-tinted background based on the selected primary color
 * This ensures the background colors change with the theme color selection
 * 
 * @param {string} colorName - Name of the primary color
 * @param {boolean} isDarkMode - Whether dark mode is enabled
 * @returns {Object} Background color definitions
 */
function getBackgroundColors(colorName, isDarkMode) {
  // Get the color information to tint backgrounds
  const colorInfo = baseColors[colorName] || baseColors.blue;
  
  if (isDarkMode) {
    // Dark mode with color tinting
    return {
      // Default background with color tint for dark mode
      default: `#111827`,
      // Paper with color influence
      paper: `linear-gradient(145deg, #1f2937 0%, #1f2937 85%, ${colorInfo.dark}40 100%)`,
      // Card with stronger color influence 
      card: `linear-gradient(145deg, ${colorInfo.dark}80 0%, #1f2937 100%)`,
      // App bar with a color-influenced background
      appBar: `linear-gradient(90deg, #0f172a, ${colorInfo.dark}70)`,
      // Dialog with subtle color influence
      dialog: `#1f2937`,
      // Sidebar with stronger color influence
      sidebar: `#0f172a`
    };
  } else {
    // Light mode with color tinting
    return {
      // Default background with very subtle color tint
      default: `linear-gradient(145deg, #f5f7fa 0%, #f8f9fa 85%, ${colorInfo.light}20 100%)`,
      // Paper with subtle color influence
      paper: '#ffffff',
      // Card backgrounds with color influence
      card: `linear-gradient(145deg, #ffffff 0%, #ffffff 85%, ${colorInfo.light}50 100%)`,
      // App bar with color influence
      appBar: `linear-gradient(90deg, #ffffff, ${colorInfo.light}20)`,
      // Dialog with subtle color influence
      dialog: '#ffffff',
      // Sidebar with subtle color influence
      sidebar: '#ffffff'
    };
  }
}

// Light mode text colors
const lightModeText = {
  primary: '#111827',
  secondary: '#4b5563',
  disabled: '#9ca3af',
};

// Dark mode text colors
const darkModeText = {
  primary: '#f3f4f6',
  secondary: '#d1d5db',
  disabled: '#6b7280',
};

/**
 * Generate a full palette theme object for a given color in a specific mode
 * This applies the selected color to all aspects of the theme including backgrounds
 * 
 * @param {string} colorName - Name of the primary color
 * @param {string} mode - 'light' or 'dark'
 * @returns {Object} Complete theme palette configuration
 */
export function generateThemePalette(colorName, mode) {
  const isDarkMode = mode === 'dark';
  const selectedColor = baseColors[colorName] || baseColors.blue;
  
  // Get background colors that are tinted with the selected color
  const backgroundColors = getBackgroundColors(colorName, isDarkMode);
  
  return {
    mode: isDarkMode ? 'dark' : 'light',
    primary: {
      ...selectedColor,
      // For dark mode, we lighten the main color a bit to improve visibility
      main: isDarkMode ? selectedColor.light : selectedColor.main,
    },
    secondary: {
      light: baseColors.purple.light,
      main: baseColors.purple.main,
      dark: baseColors.purple.dark,
      contrastText: '#ffffff',
    },
    error: {
      light: baseColors.red.light,
      main: baseColors.red.main,
      dark: baseColors.red.dark,
      contrastText: '#ffffff',
    },
    warning: {
      light: '#fcd34d',
      main: '#f59e0b',
      dark: '#b45309',
      contrastText: '#ffffff',
    },
    info: {
      light: '#93c5fd',
      main: '#3b82f6',
      dark: '#1d4ed8',
      contrastText: '#ffffff',
    },
    success: {
      light: '#86efac',
      main: '#22c55e',
      dark: '#15803d',
      contrastText: '#ffffff',
    },
    text: isDarkMode ? darkModeText : lightModeText,
    background: backgroundColors, // Use our color-tinted backgrounds
    divider: isDarkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
  };
}

/**
 * Get simple hex code for a color name
 * Used for backward compatibility
 * 
 * @param {string} colorName - Name of the color (blue, purple, etc)
 * @returns {string} Hex code
 */
export function getColorHex(colorName) {
  return baseColors[colorName]?.main || baseColors.blue.main;
}

// Export base colors and theme generation functions
export default baseColors;