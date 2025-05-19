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
                backgroundColor: darkMode ? '#3b82f6' : '#2563eb',
                '&:hover': {
                  backgroundColor: darkMode ? '#2563eb' : '#1d4ed8',
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

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};

export default MuiThemeProvider;