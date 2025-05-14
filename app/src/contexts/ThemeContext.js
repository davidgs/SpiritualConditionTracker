import React, { createContext, useState, useEffect, useContext } from 'react';

// Create a context for theme management
const ThemeContext = createContext();

// Theme provider component
export function ThemeProvider({ children }) {
  // Check if user has previously set a theme or use system preference
  const getInitialTheme = () => {
    try {
      // Check for saved theme in localStorage
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'dark' || savedTheme === 'light') {
        return savedTheme;
      }
      
      // Check system preference
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    } catch (error) {
      console.error('Error accessing localStorage:', error);
    }
    
    // Default to light mode
    return 'light';
  };
  
  const [theme, setTheme] = useState(getInitialTheme);
  
  // Apply dark mode class to HTML element
  const applyTheme = (themeName) => {
    try {
      const root = window.document.documentElement;
      const body = window.document.body;
      
      // First, clean up any existing theme classes
      root.classList.remove('light', 'dark');
      body.classList.remove('light', 'dark');
      
      // Apply the new theme
      if (themeName === 'dark') {
        console.log('Applying dark theme');
        root.classList.add('dark');
        body.classList.add('dark');
        // Force background color via direct style for debugging
        document.body.style.backgroundColor = '#111827';
      } else {
        console.log('Applying light theme');
        document.body.style.backgroundColor = '#f0f2f5';
      }
      
      // Save theme choice to localStorage
      localStorage.setItem('theme', themeName);
    } catch (error) {
      console.error('Error applying theme:', error);
    }
  };
  
  // Update body class and localStorage when theme changes
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);
  
  // Toggle between light and dark mode
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    console.log('Theme toggled to:', newTheme);
  };
  
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook to use the theme context
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}