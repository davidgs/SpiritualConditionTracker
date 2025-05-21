import React, { createContext, useContext, useEffect, useState } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Capacitor } from '@capacitor/core';
import { applyNativeTheme, applyNativeCssVariables, defaultThemeColors, getSystemColorScheme } from '../utils/nativeTheme';

// Helper function to lighten colors for dark mode
const lightenColor = (hex, percent) => {
  // Convert hex to RGB
  let r = parseInt(hex.slice(1, 3), 16);
  let g = parseInt(hex.slice(3, 5), 16);
  let b = parseInt(hex.slice(5, 7), 16);

  // Increase brightness by percentage
  r = Math.min(255, Math.floor(r * (1 + percent / 100)));
  g = Math.min(255, Math.floor(g * (1 + percent / 100)));
  b = Math.min(255, Math.floor(b * (1 + percent / 100)));

  // Convert back to hex
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

// Helper function to darken colors
const shadeColor = (hex, percent) => {
  // Convert hex to RGB
  let r = parseInt(hex.slice(1, 3), 16);
  let g = parseInt(hex.slice(3, 5), 16);
  let b = parseInt(hex.slice(5, 7), 16);

  // Decrease brightness by percentage
  r = Math.max(0, Math.floor(r * (1 - percent / 100)));
  g = Math.max(0, Math.floor(g * (1 - percent / 100)));
  b = Math.max(0, Math.floor(b * (1 - percent / 100)));

  // Convert back to hex
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

// Helper function for darkening colors (alias to shadeColor for clarity)
const darkenColor = (hex, percent) => {
  return shadeColor(hex, percent);
};
// Use window.db for accessing database functions after proper initialization
// This prevents initialization conflicts across multiple imports

// Using imported defaultThemeColors from nativeTheme.js

// Create a context for theme management
export const AppThemeContext = createContext();

/**
 * Material UI Theme Provider that handles all app theming functionality
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {React.ReactElement} ThemeProvider component
 */
const MuiThemeProvider = ({ children }) => {
  // Check if user has previously set a theme or use system preference
  const [initialTheme, setInitialTheme] = useState('light');
  // Add state for primary color theme (default to blue)
  const [primaryColor, setPrimaryColor] = useState('blue');
  
  // Load theme preferences from database on component mount
  useEffect(() => {
    const loadPreferencesFromDatabase = async () => {
      try {
        // Only access database if it's been properly initialized
        if (window.db && window.dbInitialized) {
          // Check for saved theme mode in database
          const savedTheme = await window.db.getPreference('theme');
          if (savedTheme === 'dark' || savedTheme === 'light') {
            setInitialTheme(savedTheme);
          }
          
          // Check for saved primary color preference
          const savedColor = await window.db.getPreference('primaryColor');
          if (savedColor && defaultThemeColors[savedColor]) {
            setPrimaryColor(savedColor);
          }
          
          return;
        }
        
        // Check system preference if database not available
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
          setInitialTheme('dark');
        }
      } catch (error) {
        console.error('Error accessing theme preferences:', error);
      }
    };
    
    loadPreferencesFromDatabase();
  }, []);
  
  const [theme, setTheme] = useState(initialTheme);
  const darkMode = theme === 'dark';
  
  // Get actual color value from the color name
  const primaryColorValue = defaultThemeColors[primaryColor] || defaultThemeColors.blue;
  
  // Update document class and save theme preferences to SQLite when changes occur
  useEffect(() => {
    try {
      // Apply theme to HTML element for Tailwind
      const htmlEl = document.documentElement;
      
      if (darkMode) {
        htmlEl.classList.add('dark');
        document.body.style.backgroundColor = '#121212';
        document.body.style.color = '#fff';
        console.log('Dark mode activated');
      } else {
        htmlEl.classList.remove('dark');
        document.body.style.backgroundColor = '#f0f2f5';
        document.body.style.color = '#111827';
        console.log('Light mode activated');
      }
      
      // Apply custom primary color as CSS variable
      htmlEl.style.setProperty('--primary-color', primaryColorValue);
      
      // Save theme choices to SQLite database
      if (window.db && window.dbInitialized && window.db.setPreference) {
        window.db.setPreference('theme', theme);
        window.db.setPreference('primaryColor', primaryColor);
      }
    } catch (error) {
      console.error('Error applying theme:', error);
    }
  }, [theme, darkMode, primaryColor, primaryColorValue]);
  
  // Toggle between light and dark mode
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };
  
  // Create a theme based on our app's dark/light mode and custom primary color
  const muiTheme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? 'dark' : 'light',
          primary: {
            light: darkMode ? lightenColor(primaryColorValue, 25) : lightenColor(primaryColorValue, 15),
            main: darkMode ? lightenColor(primaryColorValue, 15) : primaryColorValue,
            dark: darkMode ? primaryColorValue : darkenColor(primaryColorValue, 15),
            contrastText: '#ffffff',
          },
          secondary: {
            light: darkMode ? '#a78bfa' : '#9333ea',
            main: darkMode ? '#8b5cf6' : '#7c3aed',
            dark: darkMode ? '#6d28d9' : '#5b21b6',
            contrastText: '#ffffff',
          },
          error: {
            light: darkMode ? '#f87171' : '#ef4444',
            main: darkMode ? '#ef4444' : '#dc2626',
            dark: darkMode ? '#b91c1c' : '#991b1b',
            contrastText: '#ffffff',
          },
          warning: {
            light: darkMode ? '#fcd34d' : '#fbbf24',
            main: darkMode ? '#f59e0b' : '#d97706',
            dark: darkMode ? '#b45309' : '#92400e',
            contrastText: '#ffffff',
          },
          info: {
            light: darkMode ? '#93c5fd' : '#60a5fa',
            main: darkMode ? '#3b82f6' : '#2563eb',
            dark: darkMode ? '#1d4ed8' : '#1e40af',
            contrastText: '#ffffff',
          },
          success: {
            light: darkMode ? '#86efac' : '#4ade80',
            main: darkMode ? '#22c55e' : '#16a34a',
            dark: darkMode ? '#15803d' : '#166534',
            contrastText: '#ffffff',
          },
          background: {
            default: darkMode ? '#111827' : '#ffffff',
            paper: darkMode ? '#1f2937' : '#ffffff',
          },
          text: {
            primary: darkMode ? '#f3f4f6' : '#1f2937',
            secondary: darkMode ? '#9ca3af' : '#4b5563',
          },
        },
        typography: {
          fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
        },
        components: {
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                color: darkMode ? '#e5e7eb' : '#1f2937',
              },
            },
          },
          MuiDialog: {
            styleOverrides: {
              paper: {
                boxShadow: darkMode
                  ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                  : '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                color: darkMode ? '#e5e7eb' : '#1f2937',
              },
              root: {
                '& .MuiBackdrop-root': {
                  backgroundColor: darkMode ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.5)',
                },
              },
            },
          },
          MuiDialogTitle: {
            styleOverrides: {
              root: {
                backgroundColor: darkMode ? '#111827' : '#f9fafb',
                color: darkMode ? '#f3f4f6' : '#111827',
                borderBottom: '1px solid',
                borderColor: darkMode ? '#374151' : '#e5e7eb',
              },
            },
          },
          MuiDialogContent: {
            styleOverrides: {
              root: {
                backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                color: darkMode ? '#e5e7eb' : '#1f2937',
              },
            },
          },
          MuiDialogActions: {
            styleOverrides: {
              root: {
                backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                borderTop: '1px solid',
                borderColor: darkMode ? '#374151' : '#e5e7eb',
                padding: '16px',
              },
            },
          },
          MuiInputBase: {
            styleOverrides: {
              input: {
                color: darkMode ? '#e5e7eb' : '#1f2937',
              },
            },
          },
          MuiOutlinedInput: {
            styleOverrides: {
              root: {
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: darkMode ? '#4b5563' : '#d1d5db',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: darkMode ? '#6b7280' : '#9ca3af',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: darkMode ? '#60a5fa' : '#3b82f6',
                },
              },
            },
          },
          MuiButton: {
            styleOverrides: {
              root: {
                textTransform: 'none',
                borderRadius: '0.375rem',
                fontWeight: 500,
              },
              containedPrimary: {
                backgroundColor: darkMode ? lightenColor(primaryColorValue, 5) : primaryColorValue,
                '&:hover': {
                  backgroundColor: darkMode ? primaryColorValue : shadeColor(primaryColorValue, 15),
                },
              },
              outlinedPrimary: {
                color: darkMode ? '#e5e7eb' : '#4b5563',
                borderColor: darkMode ? '#4b5563' : '#d1d5db',
                '&:hover': {
                  backgroundColor: darkMode ? 'rgba(55, 65, 81, 0.1)' : 'rgba(243, 244, 246, 0.7)',
                  borderColor: darkMode ? '#6b7280' : '#9ca3af',
                },
              },
            },
          },
          MuiInputLabel: {
            styleOverrides: {
              root: {
                color: darkMode ? '#9ca3af' : '#4b5563',
              },
            },
          },
        },
      }),
    [darkMode]
  );

  // Create context value that will be provided to components
  const themeContextValue = {
    theme,
    setTheme,
    toggleTheme,
    mode: darkMode ? 'dark' : 'light',
    primaryColor,
    setPrimaryColor,
    availableColors: Object.keys(defaultThemeColors)
  };

  // Apply CSS variables for custom theming
  useEffect(() => {
    // Apply native theme settings for iOS
    if (Capacitor.isNativePlatform()) {
      // Apply theme to native elements (status bar, etc.)
      applyNativeTheme(primaryColor, darkMode);
    }
    
    // Apply CSS variables for consistent styling
    applyNativeCssVariables(primaryColor, darkMode, document.documentElement);
    
    // Set additional background color variables
    document.documentElement.style.setProperty(
      '--background-color', 
      darkMode ? muiTheme.palette.background.default : muiTheme.palette.background.paper
    );
    
    // Set primary color variables for easier usage in CSS
    document.documentElement.style.setProperty(
      '--primary-color-light', 
      lightenColor(primaryColorValue, 15)
    );
    
    // Apply a subtle color to the nav elements to make color change more visible
    const navElement = document.querySelector('.app-container nav');
    if (navElement) {
      navElement.style.borderBottom = `2px solid ${primaryColorValue}`;
      
      // Add extra visual indicator for iOS
      if (Capacitor.isNativePlatform()) {
        navElement.style.boxShadow = `0 2px 4px rgba(0,0,0,0.1)`;
      }
    }
    
    // Apply colors to buttons for more visible theme changes
    const buttons = document.querySelectorAll('button.MuiButton-containedPrimary');
    buttons.forEach(button => {
      button.style.backgroundColor = primaryColorValue;
    });
    
    console.log(`Theme updated: ${darkMode ? 'dark' : 'light'} mode with ${primaryColor} color (${primaryColorValue})`);
  }, [darkMode, muiTheme, primaryColor, primaryColorValue]);

  return (
    <AppThemeContext.Provider value={themeContextValue}>
      <ThemeProvider theme={muiTheme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </AppThemeContext.Provider>
  );
};

// Custom hook to use the theme context
export const useAppTheme = () => {
  const context = useContext(AppThemeContext);
  if (context === undefined) {
    throw new Error('useAppTheme must be used within a MuiThemeProvider');
  }
  return context;
};

export default MuiThemeProvider;