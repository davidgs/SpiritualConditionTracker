import React, { createContext, useState, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define theme colors
export const lightTheme = {
  background: '#f8f9fa',
  card: '#ffffff',
  primary: '#4a86e8',
  secondary: '#90caf9',
  text: '#333333',
  textSecondary: '#666666',
  border: '#dddddd',
  tabBarBackground: '#ffffff',
  statusBar: 'dark',
  success: '#4CAF50',
  danger: '#f44336',
  warning: '#ff9800',
  info: '#2196F3',
  divider: '#f0f0f0',
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  }
};

export const darkTheme = {
  background: '#121212',
  card: '#1e1e1e',
  primary: '#4a86e8',
  secondary: '#5794d3',
  text: '#ffffff',
  textSecondary: '#aaaaaa',
  border: '#333333',
  tabBarBackground: '#1e1e1e',
  statusBar: 'light',
  success: '#81c784',
  danger: '#e57373',
  warning: '#ffb74d',
  info: '#64b5f6',
  divider: '#333333',
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 5,
  }
};

const ThemeContext = createContext({
  isDark: false,
  theme: lightTheme,
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }) => {
  const deviceTheme = useColorScheme();
  const [isDark, setIsDark] = useState(false);
  const [isThemeLoaded, setIsThemeLoaded] = useState(false);

  // Load theme preference from storage
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem('themePreference');
        if (storedTheme !== null) {
          setIsDark(storedTheme === 'dark');
        } else {
          // If no stored preference, use device theme
          setIsDark(deviceTheme === 'dark');
        }
        setIsThemeLoaded(true);
      } catch (error) {
        console.error('Failed to load theme preference:', error);
        setIsDark(deviceTheme === 'dark');
        setIsThemeLoaded(true);
      }
    };

    loadThemePreference();
  }, [deviceTheme]);

  // Toggle theme function
  const toggleTheme = async () => {
    try {
      const newTheme = !isDark;
      setIsDark(newTheme);
      await AsyncStorage.setItem('themePreference', newTheme ? 'dark' : 'light');
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  };

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ isDark, theme, toggleTheme }}>
      {isThemeLoaded ? children : null}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);