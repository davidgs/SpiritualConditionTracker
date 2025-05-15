import React from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useTheme } from './ThemeContext';
import CssBaseline from '@mui/material/CssBaseline';

/**
 * Material UI Theme Provider that adapts to the app's dark/light mode
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {React.ReactElement} ThemeProvider component
 */
const MuiThemeProvider = ({ children }) => {
  const { darkMode } = useTheme();
  
  // Create a theme based on our app's dark/light mode
  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? 'dark' : 'light',
          primary: {
            main: darkMode ? '#60a5fa' : '#3b82f6', // blue
          },
          secondary: {
            main: darkMode ? '#8b5cf6' : '#7c3aed', // purple
          },
          error: {
            main: darkMode ? '#ef4444' : '#dc2626', // red
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
          MuiDialog: {
            styleOverrides: {
              paper: {
                boxShadow: darkMode
                  ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                  : '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
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
            },
          },
        },
      }),
    [darkMode]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};

export default MuiThemeProvider;