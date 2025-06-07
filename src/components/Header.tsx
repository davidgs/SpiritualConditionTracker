import React from 'react';
import { useTheme } from '@mui/material/styles';
import { Typography, Box } from '@mui/material';
import { useAppTheme } from '../contexts/MuiThemeProvider';

function Header({ title, menuOpen, setMenuOpen, isMobile, onShowTour }) {
  const muiTheme = useTheme();
  const { primaryColor, toggleTheme } = useAppTheme();
  const darkMode = muiTheme.palette.mode === 'dark';
  
  // Use MUI theme colors for consistent styling
  const headerBackgroundColor = darkMode 
    ? muiTheme.palette.background.paper 
    : muiTheme.palette.grey[100];
  const headerTextColor = muiTheme.palette.text.primary;
  const accentColor = muiTheme.palette.primary.main;
  
  return (
    <Box
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
        paddingTop: 'max(env(safe-area-inset-top), 44px)',
        paddingBottom: '0.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        gap: 1,
        minHeight: 'calc(max(env(safe-area-inset-top), 44px) + 60px)',
      }}
    >
      {/* Logo and title - left aligned */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
        <Box
          component="img" 
          src="/assets/logo.jpg"
          alt="App Logo" 
          sx={{ 
            width: '40px',
            height: '40px',
            objectFit: 'cover',
            borderRadius: '20px'
          }}
        />
        
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 600,
            color: headerTextColor,
            fontSize: '1.1rem',
            lineHeight: 1.2
          }}
        >
          My Spiritual Condition
        </Typography>
      </Box>

      {/* Right side buttons */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {onShowTour && (
          <Box
            component="button"
            onClick={onShowTour}
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
        )}
        
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
    </Box>
  );
}

export default Header;