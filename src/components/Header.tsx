import React from 'react';
import { useTheme } from '@mui/material/styles';
import { Typography, Box, IconButton } from '@mui/material';
import { useAppTheme } from '../contexts/MuiThemeProvider';
import SafeAreaHeader from './SafeAreaHeader';

function Header({ title, menuOpen, setMenuOpen, isMobile }) {
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
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 1100,
        backgroundColor: headerBackgroundColor,
        borderBottom: `1px solid ${muiTheme.palette.divider}`,
        padding: '0.5rem 1rem',
        paddingTop: 'max(0.5rem, env(safe-area-inset-top))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        gap: 1
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
        {muiTheme.palette.mode === 'light' ? '🌑' : '☀️'}
      </Box>
      
      {/* Mobile Hamburger Menu Button */}
      {isMobile && (
        <IconButton
          onClick={() => setMenuOpen(!menuOpen)}
          color="primary"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          sx={{
            padding: '8px',
            fontSize: '1.75rem',
            border: 'none',
            transition: 'all 0.2s ease'
          }}
        >
          {menuOpen ? 
            <i className="fa-solid fa-xmark"></i> : 
            <i className="fa-solid fa-bars"></i>
          }
        </IconButton>
      )}
    </SafeAreaHeader>
  );
}

export default Header;