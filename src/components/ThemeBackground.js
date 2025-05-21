import React, { useEffect } from 'react';
import { Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useAppTheme } from '../contexts/MuiThemeProvider';

/**
 * Component that applies theme colors to the page background
 * This ensures theme colors affect the entire application appearance
 */
const ThemeBackground = ({ children }) => {
  const muiTheme = useTheme();
  const { primaryColor, theme: themeMode } = useAppTheme();
  const isDark = themeMode === 'dark';
  
  // Apply background theme color to body element directly
  useEffect(() => {
    // Get the correct background color based on theme mode
    const bgDefault = muiTheme.palette.background.default;
    const primaryLight = muiTheme.palette.primary.light;
    
    // Apply to body element for full page coverage
    document.body.style.backgroundColor = bgDefault;
    
    // Add a subtle colored background gradient for visual interest
    if (isDark) {
      document.body.style.background = `linear-gradient(145deg, ${bgDefault} 0%, ${bgDefault} 80%, ${muiTheme.palette.primary.dark}22 100%)`;
    } else {
      document.body.style.background = `linear-gradient(145deg, ${bgDefault} 0%, ${bgDefault} 85%, ${primaryLight}33 100%)`;
    }
    
    // Clean up on unmount
    return () => {
      document.body.style.backgroundColor = '';
      document.body.style.background = '';
    };
  }, [muiTheme.palette.background.default, muiTheme.palette.primary, isDark]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        bgcolor: 'background.default',
        color: 'text.primary',
        transition: 'all 0.3s ease',
        // Apply a very subtle primary color overlay to app backgrounds
        // This helps theme colors affect the overall visual appearance
        '&::before': {
          content: '""',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `${muiTheme.palette.primary.main}03`, // Very subtle - 1% opacity
          pointerEvents: 'none',
          zIndex: -1,
        }
      }}
    >
      {children}
    </Box>
  );
};

export default ThemeBackground;