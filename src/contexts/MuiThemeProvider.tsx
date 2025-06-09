import React, { createContext, useContext, useEffect, useState } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Capacitor } from '@capacitor/core';
import { applyNativeTheme, applyNativeCssVariables, defaultThemeColors, getSystemColorScheme } from '../utils/nativeTheme';
import { getCompleteTheme } from '../utils/muiThemeColors';
import applyThemeDirectly from '../utils/applyThemeDirectly';
import applyMuiThemeToIOS from '../utils/iOSThemeAdapter';
import { useThemePreferences } from '../utils/themePreferences';

// Create a context for theme management
export const AppThemeContext = createContext({
  theme: 'light',
  toggleTheme: () => {},
  primaryColor: 'blue',
  setPrimaryColor: (color: string) => {},
  availableColors: [] as string[],
  mode: 'light'
});

/**
 * Material UI Theme Provider that handles all app theming functionality
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {React.ReactElement} ThemeProvider component
 */
const MuiThemeProvider = ({ children }) => {
  // Get theme preferences from user database
  const { themePreferences, toggleDarkMode } = useThemePreferences();
  
  // Use system preference as fallback if no user preference is set
  const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const [primaryColor, setPrimaryColor] = useState('blue');
  const [localDarkMode, setLocalDarkMode] = useState(() => {
    // First check localStorage for immediate theme loading
    try {
      const savedTheme = localStorage.getItem('darkMode');
      if (savedTheme !== null) {
        return savedTheme === 'true';
      }
    } catch (error) {
      console.log('localStorage not available, using system preference');
    }
    // Fallback to system preference, but default to light mode
    return systemPrefersDark || false;
  });
  
  // Available color options for the theme picker
  const availableColors = Object.keys(defaultThemeColors);
  
  // Use database preference if available, otherwise use local state
  const darkMode = themePreferences.darkMode !== undefined ? themePreferences.darkMode : localDarkMode;
  const theme = darkMode ? 'dark' : 'light';

  // Sync localStorage state with database when user data becomes available
  useEffect(() => {
    if (themePreferences.darkMode !== undefined && themePreferences.darkMode !== localDarkMode) {
      setLocalDarkMode(themePreferences.darkMode);
      try {
        localStorage.setItem('darkMode', themePreferences.darkMode.toString());
      } catch (error) {
        console.log('localStorage not available');
      }
    }
  }, [themePreferences.darkMode, localDarkMode]);
  
  // Get actual color value from the color name
  const primaryColorValue = defaultThemeColors[primaryColor] || defaultThemeColors.blue;
  
  // Update document class and save theme preferences to SQLite when changes occur
  useEffect(() => {
    try {
      // Apply theme to HTML element for Tailwind
      const htmlEl = document.documentElement;
      
      if (darkMode) {
        htmlEl.classList.add('dark');
        document.body.style.backgroundColor = '#111827';
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
      
      // Apply theme changes directly to DOM elements for immediate visual feedback
      applyThemeDirectly(primaryColor, theme);
      
      // Update root-level background for immediate color feedback
      const primaryColorObj = defaultThemeColors[primaryColor] || defaultThemeColors.blue;
      const colorValue = darkMode ? primaryColorObj.dark : primaryColorObj.light;
      
      // Apply theme colors directly to background elements
      document.body.style.backgroundImage = darkMode
        ? `linear-gradient(160deg, #111827 0%, #111827 90%, ${colorValue}30 100%)`
        : `linear-gradient(160deg, #f0f2f5 0%, #f9f9f9 85%, ${colorValue}40 100%)`;
      
      // Apply theme colors to cards via CSS variables
      document.documentElement.style.setProperty('--card-bg-color', darkMode
        ? `linear-gradient(145deg, #1f2937 0%, #1f2937 85%, ${colorValue}40 100%)`
        : `linear-gradient(145deg, #ffffff 0%, #ffffff 85%, ${colorValue}30 100%)`);
      
      // Save theme to localStorage for immediate persistence
      try {
        localStorage.setItem('darkMode', darkMode.toString());
        localStorage.setItem('primaryColor', primaryColor);
      } catch (error) {
        console.log('localStorage not available');
      }
      
      // Save theme choices to SQLite database
      if (window.db && window.dbInitialized && window.db.setPreference) {
        window.db.setPreference('theme', theme);
        window.db.setPreference('primaryColor', primaryColor);
      }
    } catch (error) {
      console.error('Error applying theme:', error);
    }
  }, [theme, darkMode, primaryColor, primaryColorValue]);
  
  // Toggle between light and dark mode - now persists to database and localStorage
  const toggleTheme = () => {
    if (themePreferences.darkMode !== undefined) {
      // User data is loaded, use database toggle
      toggleDarkMode();
    } else {
      // User data not loaded yet, update local state and localStorage
      setLocalDarkMode(prev => {
        const newValue = !prev;
        try {
          localStorage.setItem('darkMode', newValue.toString());
        } catch (error) {
          console.log('localStorage not available');
        }
        return newValue;
      });
    }
  };
  
  // Create a theme based on our app's dark/light mode and custom primary color
  const muiTheme = React.useMemo(
    () => createTheme(getCompleteTheme(primaryColor, theme as 'light' | 'dark')),
    [primaryColor, theme]
  );
  
  // Apply MUI theme to native iOS components for consistent styling 
  // This directly integrates with iOS native components
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      // Apply basic theme to native elements
      applyNativeTheme(primaryColor, darkMode);
      
      // Apply CSS variables for native compatibility
      applyNativeCssVariables(primaryColor, darkMode);
      
      // Apply MUI theme to iOS components - this ensures iOS-specific styling
      // using the proper MUI theme objects
      if (muiTheme && Capacitor.getPlatform() === 'ios') {
        applyMuiThemeToIOS(muiTheme);
        console.log('Applied MUI theme to iOS native components:', primaryColor);
      }
    }
  }, [primaryColor, darkMode, muiTheme]);
  
  return (
    <AppThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        primaryColor,
        setPrimaryColor,
        availableColors,
        mode: theme, // For backward compatibility
      }}
    >
      <ThemeProvider theme={muiTheme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </AppThemeContext.Provider>
  );
};

/**
 * Custom hook to access the theme context
 * @returns {Object} Theme context values
 */
export const useAppTheme = () => useContext(AppThemeContext);

export default MuiThemeProvider;