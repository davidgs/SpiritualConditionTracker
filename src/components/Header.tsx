import React from 'react';
import { useTheme } from '@mui/material/styles';
import { Typography, Box, IconButton } from '@mui/material';
import { useAppTheme } from '../contexts/MuiThemeProvider';
import SafeAreaHeader from './SafeAreaHeader';

function Header({ title, menuOpen, setMenuOpen, isMobile, onShowTour }) {
  const muiTheme = useTheme();
  const { primaryColor, toggleTheme } = useAppTheme();
  const darkMode = muiTheme.palette.mode === 'dark';
  
  // Use MUI theme colors for consistent styling
  const headerBackgroundColor = darkMode 
    ? muiTheme.palette.background.paper 
    : muiTheme.palette.grey[100];
  // Header text color from MUI theme
  const headerTextColor = muiTheme.palette.text.primary;
  // Add a primary color accent from the user's selected theme
  const accentColor = muiTheme.palette.primary.main;
  
  return (
    <SafeAreaHeader
      data-tour="header"
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1100,
        backgroundColor: headerBackgroundColor,
        borderBottom: `1px solid ${muiTheme.palette.divider}`,
        padding: '0.5rem 1rem',
        paddingTop: '0px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        gap: 1,
        minHeight: '44px',
      }}
    >
      {/* Logo and title - left aligned */}
      <Box
        component="img" 
        src="/assets/logo.jpg"
        alt="App Logo" 
        sx={{ 
          width: '20px',
          height: '20px',
          objectFit: 'cover',
          borderRadius: '3px'
        }}
      />
      
      <Typography 
        variant="h6" 
        sx={{ 
          fontWeight: 600,
          color: headerTextColor,
          fontSize: '0.95rem',
          lineHeight: 1.2,
          flex: 1
        }}
      >
        My Spiritual Condition
      </Typography>

      {/* Theme Toggle Button */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box
          component="button"
          onClick={onShowTour || (() => console.log('Tour handler not provided'))}
          sx={{
            border: 'none',
            backgroundColor: accentColor,
            color: 'white',
            cursor: 'pointer',
            fontSize: '1rem',
            padding: '6px',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
            '&:hover': {
              transform: 'scale(1.1)',
              opacity: 0.8
            }
          }}
          aria-label="Show welcome tour"
          title="Help - Welcome Tour"
        >❓
        </Box>
        
        <Box
          component="button"
          onClick={toggleTheme}
          sx={{
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            fontSize: '1.2rem',
            padding: '4px',
            borderRadius: '50%',
            transition: 'all 0.2s ease',
            '&:hover': {
              transform: 'scale(1.1)'
            }
          }}
          aria-label="Toggle theme"
        >
          {muiTheme.palette.mode === 'dark' ? '🌙' : '☀️'}
        </Box>
      </Box>
      

    </SafeAreaHeader>
  );
}

export default Header;