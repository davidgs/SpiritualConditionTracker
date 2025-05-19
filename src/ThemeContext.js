import React, { createContext, useState, useEffect } from 'react';

// Define theme colors and values
const lightTheme = {
  primary: '#3b82f6',
  primaryLight: '#60a5fa',
  primaryDark: '#2563eb',
  secondary: '#10b981',
  background: '#f3f4f6',
  card: '#ffffff',
  text: '#111827',
  textSecondary: '#4b5563',
  textMuted: '#6b7280',
  border: '#d1d5db',
  inputBg: '#ffffff',
  shadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
};

const darkTheme = {
  primary: '#60a5fa',
  primaryLight: '#93c5fd',
  primaryDark: '#3b82f6',
  secondary: '#10b981',
  background: '#111827',
  card: '#1f2937',
  text: '#f9fafb',
  textSecondary: '#e5e7eb',
  textMuted: '#d1d5db',
  border: '#4b5563',
  inputBg: 'rgba(31, 41, 55, 0.5)',
  shadow: '0 1px 3px rgba(0, 0, 0, 0.3)'
};

export const ThemeContext = createContext({
  theme: 'light',
  colors: lightTheme,
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }) => {
  // Check if user preference is stored in localStorage
  const storedTheme = localStorage.getItem('theme') || 'light';
  const [theme, setTheme] = useState(storedTheme);
  const colors = theme === 'dark' ? darkTheme : lightTheme;

  // Apply theme to the document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.classList.remove('light', 'dark');
    document.body.classList.add(theme);
    
    // Store user preference
    localStorage.setItem('theme', theme);
    
    // Set CSS variables for colors
    const root = document.documentElement;
    if (theme === 'dark') {
      root.style.setProperty('--text-primary', darkTheme.text);
      root.style.setProperty('--text-secondary', darkTheme.textSecondary);
      root.style.setProperty('--text-muted', darkTheme.textMuted);
      root.style.setProperty('--bg-app', darkTheme.background);
      root.style.setProperty('--bg-card', darkTheme.card);
      root.style.setProperty('--border-color', darkTheme.border);
      root.style.setProperty('--primary', darkTheme.primary);
      root.style.setProperty('--input-bg', darkTheme.inputBg);
    } else {
      root.style.setProperty('--text-primary', lightTheme.text);
      root.style.setProperty('--text-secondary', lightTheme.textSecondary);
      root.style.setProperty('--text-muted', lightTheme.textMuted);
      root.style.setProperty('--bg-app', lightTheme.background);
      root.style.setProperty('--bg-card', lightTheme.card);
      root.style.setProperty('--border-color', lightTheme.border);
      root.style.setProperty('--primary', lightTheme.primary);
      root.style.setProperty('--input-bg', lightTheme.inputBg);
    }
    
    console.log(`${theme === 'dark' ? 'Dark' : 'Light'} mode activated`);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, colors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;