import React, { createContext } from 'react';
import { useAppTheme } from './contexts/MuiThemeProvider';

// This file is kept for backward compatibility
// We're using the MUI ThemeProvider for all theme management

export const ThemeContext = createContext({
  theme: 'light',
  toggleTheme: () => {}
});

// This component just passes through to the real theme provider
export const ThemeProvider = ({ children }) => {
  return children;
};