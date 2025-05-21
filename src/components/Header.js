import React from 'react';
import { useTheme } from '@mui/material/styles';
import { Typography, Box, IconButton } from '@mui/material';
import { useAppTheme } from '../contexts/MuiThemeProvider';
import SafeAreaHeader from './SafeAreaHeader';

function Header({ title, menuOpen, setMenuOpen, isMobile }) {
  const muiTheme = useTheme();
  const { primaryColor } = useAppTheme();
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
        position: 'relative', // Not sticky anymore
        zIndex: 20,
        backgroundColor: headerBackgroundColor,
        borderBottom: `1px solid ${muiTheme.palette.divider}`,
        borderLeft: `4px solid ${accentColor}`,
        padding: isMobile ? '2.75rem .25rem .25rem .25rem' : '0.75rem 1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: isMobile ? 'space-between' : 'center',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        flexDirection: isMobile ? 'row' : 'column'
      }}
    >
      {/* Logo - Left aligned on mobile, centered on desktop */}
      {isMobile ? (
        // Mobile layout: Logo on left, text in center, hamburger on right
        <>
          <Box sx={{ 
            display: 'flex',
            alignItems: 'center'
          }}>
            <Box
              component="img" 
              src="./assets/logo.jpg"
              alt="App Logo" 
              sx={{ 
                width: '50px',
                height: '50px',
                objectFit: 'contain',
                borderRadius: '8px',
                border: `2px solid ${accentColor}`
              }}
            />
          </Box>
          
          <Box sx={{
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            flex: 1
          }}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 'bold',
                color: headerTextColor,
                margin: 0,
                lineHeight: 1.2
              }}
            >
              Spiritual Condition Tracker
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                lineHeight: 1.1,
                margin: 0,
                borderBottom: `2px solid ${accentColor}`,
                paddingBottom: '2px'
              }}
            >
              Track your spiritual journey
            </Typography>
          </Box>
        </>
      ) : (
        // Desktop layout: Logo and text centered vertically
        <Box sx={{ 
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <Box 
            component="img"
            src="./logo.jpg"
            alt="App Logo" 
            sx={{ 
              width: '80px',
              height: '80px',
              objectFit: 'contain',
              borderRadius: '12px',
              marginBottom: '0.5rem',
              border: `2px solid ${accentColor}`
            }}
          />
          <Typography
            variant="h4"
            sx={{ 
              fontWeight: 'bold', 
              color: headerTextColor,
              marginBottom: '0.25rem',
              lineHeight: 1.1
            }}
          >
            Spiritual Condition Tracker
          </Typography>
          <Typography 
            variant="caption"
            sx={{ 
              color: 'text.secondary',
              lineHeight: 1.1,
              margin: 0,
              borderBottom: `2px solid ${accentColor}`,
              paddingBottom: '2px'
            }}
          >
            Track your spiritual journey
          </Typography>
        </Box>
      )}
      
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
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: `${accentColor}22`,
            }
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