import React, { createContext, useContext, useEffect, useState } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Capacitor } from '@capacitor/core';
import { applyNativeTheme, applyNativeCssVariables, defaultThemeColors, getSystemColorScheme } from '../utils/nativeTheme';
import { getCompleteTheme } from '../utils/muiThemeColors';

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
  
  // Available color options for the theme picker
  const availableColors = Object.keys(defaultThemeColors);
  
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
    () => createTheme(getCompleteTheme(primaryColor, theme)),
    [primaryColor, theme]
  );
  
  // Also apply native theme settings for iOS and Android when applicable
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      // Apply theme to native elements 
      applyNativeTheme(primaryColor, darkMode);
      
      // Apply CSS variables for native compatibility
      applyNativeCssVariables(primaryColor, darkMode);
    }
  }, [primaryColor, darkMode]);
  
  return (
    <AppThemeContext.Provider
      value={{
        theme,
        setTheme,
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