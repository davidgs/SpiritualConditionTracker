import React, { useEffect } from 'react';
import { Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useAppTheme } from '../contexts/MuiThemeProvider';
import { Capacitor } from '@capacitor/core';

/**
 * Component that applies theme colors to the page background
 * This ensures theme colors affect the entire application appearance
 */
const ThemeBackground = ({ children }) => {
  const muiTheme = useTheme();
  const { primaryColor, theme: themeMode } = useAppTheme();
  const isDark = themeMode === 'dark';
  
  // Apply theme colors to the entire document for full coverage
  useEffect(() => {
    // Get current theme colors
    const bgDefault = muiTheme.palette.background.default;
    const bgPaper = muiTheme.palette.background.paper;
    const primaryMain = muiTheme.palette.primary.main;
    const primaryLight = muiTheme.palette.primary.light;
    const textPrimary = muiTheme.palette.text.primary;
    const textSecondary = muiTheme.palette.text.secondary;
    
    // Create a CSS string with our theme variables
    const cssVars = `
      :root {
        --theme-bg-default: ${bgDefault};
        --theme-bg-paper: ${bgPaper};
        --theme-primary-main: ${primaryMain};
        --theme-primary-light: ${primaryLight};
        --theme-text-primary: ${textPrimary};
        --theme-text-secondary: ${textSecondary};
      }
    `;
    
    // Create or update the style element
    let styleEl = document.getElementById('theme-root-vars');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'theme-root-vars';
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = cssVars;
    
    // Apply directly to body - this ensures the theme affects the entire UI
    document.body.style.backgroundColor = bgDefault;
    document.body.style.color = textPrimary;
    
    // Add custom background effects based on theme
    if (isDark) {
      // Dark mode gets a subtle gradient with the primary color
      document.body.style.background = `linear-gradient(160deg, ${bgDefault} 0%, ${bgDefault} 92%, ${primaryMain}15 100%)`;
      // Add subtle noise texture for visual depth
      document.documentElement.classList.add('dark-theme');
      document.documentElement.classList.remove('light-theme');
    } else {
      // Light mode gets a cleaner gradient
      document.body.style.background = `linear-gradient(160deg, ${bgDefault} 0%, ${bgDefault} 94%, ${primaryLight}15 100%)`;
      document.documentElement.classList.add('light-theme');
      document.documentElement.classList.remove('dark-theme');
    }
    
    // Apply settings for Capacitor iOS builds
    if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios') {
      // Apply status bar styling for iOS
      try {
        if (window.StatusBar) {
          if (isDark) {
            window.StatusBar.styleDefault();
          } else {
            window.StatusBar.styleLightContent();
          }
        }
      } catch (err) {
        console.warn('Could not style iOS StatusBar:', err);
      }
    }
    
    // Clean up on unmount or theme change
    return () => {
      // Don't remove completely - just reset to defaults if needed
    };
  }, [muiTheme.palette, primaryColor, isDark]);
  
  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
        color: 'text.primary',
        transition: 'all 0.3s ease-in-out',
        position: 'relative',
        
        // Apply theme paper backgrounds to app content
        '& .MuiPaper-root': {
          bgcolor: 'background.paper',
          transition: 'background-color 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
        },
        
        // Apply theme button styling
        '& .MuiButton-contained': {
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          transition: 'background-color 0.3s ease',
          '&:hover': {
            bgcolor: 'primary.dark',
          },
        },
        
        // Apply theme to cards
        '& .MuiCard-root': {
          bgcolor: 'background.paper',
          borderLeftColor: 'primary.main',
          transition: 'all 0.3s ease',
        },
        
        // Apply theme accent to boxes
        '& .accent-box': {
          borderLeftColor: 'primary.main',
          borderLeft: '3px solid',
        },
        
        // Apply subtle background tint for visual interest
        '&::before': {
          content: '""',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.05,
          background: `radial-gradient(circle at top right, ${muiTheme.palette.primary.light}10, transparent 70%)`,
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