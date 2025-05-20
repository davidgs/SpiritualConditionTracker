import React, { createContext, useContext, useEffect, useState } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
// Use window.db for accessing database functions after proper initialization
// This prevents initialization conflicts across multiple imports

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
  
  // Load theme from database on component mount
  useEffect(() => {
    const loadThemeFromDatabase = async () => {
      try {
        // Only access database if it's been properly initialized
        if (window.db && window.dbInitialized) {
          // Check for saved theme in database
          const savedTheme = await window.db.getPreference('theme');
          if (savedTheme === 'dark' || savedTheme === 'light') {
            setInitialTheme(savedTheme);
            return;
          }
        }
        
        // Check system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
          setInitialTheme('dark');
          return;
        }
      } catch (error) {
        console.error('Error accessing theme preference:', error);
      }
    };
    
    loadThemeFromDatabase();
  }, []);
  
  const [theme, setTheme] = useState(initialTheme);
  const darkMode = theme === 'dark';
  
  // Update document class and save theme to SQLite when theme changes
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
      
      // Save theme choice to SQLite database
      if (window.db && window.dbInitialized && window.db.setPreference) {
        window.db.setPreference('theme', theme);
      }
    } catch (error) {
      console.error('Error applying theme:', error);
    }
  }, [theme, darkMode]);
  
  // Toggle between light and dark mode
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };
  
  // Create a theme based on our app's dark/light mode
  const muiTheme = React.useMemo(
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

  // Create context value that will be provided to components
  const themeContextValue = {
    theme,
    setTheme,
    toggleTheme,
    mode: darkMode ? 'dark' : 'light'
  };

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