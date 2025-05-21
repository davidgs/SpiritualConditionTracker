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

// Light mode background definitions
const lightModeBackground = {
  default: '#f0f2f5',
  paper: '#ffffff',
  card: '#ffffff',
  appBar: '#ffffff',
  dialog: '#ffffff',
  sidebar: '#ffffff',
};

// Dark mode background definitions
const darkModeBackground = {
  default: '#111827',
  paper: '#1f2937',
  card: '#1f2937',
  appBar: '#111827',
  dialog: '#1f2937',
  sidebar: '#0f172a',
};

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
 * 
 * @param {string} colorName - Name of the primary color
 * @param {string} mode - 'light' or 'dark'
 * @returns {Object} Complete theme palette configuration
 */
export function generateThemePalette(colorName, mode) {
  const isDarkMode = mode === 'dark';
  const selectedColor = baseColors[colorName] || baseColors.blue;
  
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
    background: isDarkMode ? darkModeBackground : lightModeBackground,
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