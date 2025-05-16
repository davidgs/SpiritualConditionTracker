import React, { createContext, useState, useEffect, useContext } from 'react';

// Create a context for theme management
export const ThemeContext = createContext();

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
  
  // Update document class and localStorage when theme changes
  useEffect(() => {
    try {
      // Apply theme to HTML element for Tailwind
      const htmlEl = document.documentElement;
      
      if (theme === 'dark') {
        htmlEl.classList.add('dark');
        document.body.style.backgroundColor = '#111827';
        document.body.style.color = '#f3f4f6';
        console.log('Dark mode activated');
      } else {
        htmlEl.classList.remove('dark');
        document.body.style.backgroundColor = '#f0f2f5';
        document.body.style.color = '#111827';
        console.log('Light mode activated');
      }
      
      // Save theme choice to localStorage
      localStorage.setItem('theme', theme);
    } catch (error) {
      console.error('Error applying theme:', error);
    }
    
    // Clean up function
    return () => {
      try {
        document.documentElement.classList.remove('dark');
        document.body.style.backgroundColor = '';
        document.body.style.color = '';
      } catch (error) {
        console.error('Error cleaning up theme:', error);
      }
    };
  }, [theme]);
  
  // Toggle between light and dark mode
  const toggleTheme = () => {
    console.log('Toggling theme from', theme);
    setTheme(prevTheme => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      console.log('Theme toggled to:', newTheme);
      return newTheme;
    });
  };
  
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
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