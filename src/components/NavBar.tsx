import React, { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import { useAppTheme } from '../contexts/MuiThemeProvider';
import Header from './Header';
import { Box } from '@mui/material';

function NavBar({ currentView, setCurrentView }) {
  const muiTheme = useTheme();
  const { theme, primaryColor } = useAppTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const darkMode = muiTheme.palette.mode === 'dark';
  
  // Use MUI theme colors instead of hard-coded values
  const navBackgroundColor = darkMode 
    ? muiTheme.palette.background.paper 
    : muiTheme.palette.grey[100];
  
  const navItems = [
    { id: 'dashboard', name: 'Dashboard', icon: 'fa-solid fa-house' },
    { id: 'meetings', name: 'Meetings', icon: 'fa-solid fa-map-marker-alt' },
    { id: 'stepwork', name: 'Step Work', icon: 'fa-solid fa-book-open' },
    { id: 'sponsor', name: 'Sponsor', icon: 'fa-solid fa-user-plus' },
    { id: 'sponsee', name: 'Sponsees', icon: 'fa-solid fa-users' },
    { id: 'profile', name: 'Profile', icon: 'fa-solid fa-user' }
  ];
  
  // Function to get the current screen title based on the currentView
  const getCurrentTitle = () => {
    const currentItem = navItems.find(item => item.id === currentView);
    return currentItem ? currentItem.name : 'Spiritual Condition Tracker';
  };
  
  // Function to check if the screen size is mobile
  const checkMobileSize = () => {
    setIsMobile(window.innerWidth < 768); // 768px is a common breakpoint for mobile
  };
  
  // Add event listener to check screen size on resize
  useEffect(() => {
    checkMobileSize(); // Check on initial render
    window.addEventListener('resize', checkMobileSize);
    
    // Cleanup event listener
    return () => window.removeEventListener('resize', checkMobileSize);
  }, []);
  
  // Handle navigation item click
  const handleNavClick = (id) => {
    setCurrentView(id);
    if (isMobile) {
      setMenuOpen(false); // Close menu after selection on mobile
    }
  };
  
  // Mobile menu styles
  const mobileMenuStyles = {
    menu: {
      position: 'absolute', // Position relative to the nearest positioned ancestor (header)
      top: '100%', // Position directly below the header
      left: 0,
      right: 0,
      zIndex: 19, // Below header but above content
      backgroundColor: navBackgroundColor,
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      transform: menuOpen ? 'translateY(0)' : 'translateY(-100%)',
      opacity: menuOpen ? 1 : 0,
      visibility: menuOpen ? 'visible' : 'hidden',
      transition: 'transform 0.3s ease, opacity 0.3s ease, visibility 0.3s ease',
      padding: '8px 16px',
      display: 'flex',
      flexDirection: 'column'
    },
    menuItem: {
      display: 'flex',
      alignItems: 'center',
      padding: '12px 16px',
      marginBottom: '8px',
      borderRadius: '8px',
      backgroundColor: 'transparent',
      border: 'none',
      cursor: 'pointer',
      textAlign: 'left',
      width: '100%'
    },
    menuIcon: {
      marginRight: '16px',
      width: '24px',
      textAlign: 'center'
    },
    activeItem: {
      backgroundColor: darkMode 
        ? muiTheme.palette.action.selected
        : muiTheme.palette.action.hover
    },
    overlay: {
      display: menuOpen ? 'block' : 'none',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      zIndex: 18
    }
  };

  return (
    <>
      {/* Container for header and mobile menu for proper positioning */}
      <div style={{ position: 'relative' }}>
        {/* Header is always visible on both mobile and desktop */}
        <Header 
          title={getCurrentTitle()}
          menuOpen={menuOpen}
          setMenuOpen={setMenuOpen}
          isMobile={isMobile}
        />
        
        {/* Mobile menu directly below header */}
        {isMobile && (
          <div style={mobileMenuStyles.menu}>
            {navItems.map((item) => (
              <button 
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                style={{
                  ...mobileMenuStyles.menuItem,
                  ...(currentView === item.id ? mobileMenuStyles.activeItem : {}),
                  color: currentView === item.id ? muiTheme.palette.primary.main : muiTheme.palette.text.secondary,
                }}
              >
                <i className={`${item.icon}`} style={mobileMenuStyles.menuIcon}></i>
                <span style={{ fontSize: '1rem' }}>{item.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* Mobile overlay - separate from the menu positioning */}
      {isMobile && menuOpen && (
        <div 
          style={mobileMenuStyles.overlay}
          onClick={() => setMenuOpen(false)}
        />
      )}
      
      {/* Desktop bottom navigation - only shown on desktop */}
      {!isMobile && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          display: 'flex',
          justifyContent: 'space-around',
          backgroundColor: navBackgroundColor,
          borderTop: `1px solid ${muiTheme.palette.divider}`,
          paddingBottom: '5px' // Add some bottom padding for devices with home indicators
        }}>
          {navItems.map((item) => (
            <Box
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              component="button"
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '12px 0',
                flex: 1,
                backgroundColor: 'transparent',
                border: 'none',
                color: currentView === item.id ? muiTheme.palette.primary.main : muiTheme.palette.text.secondary,
                cursor: 'pointer',
                position: 'relative',
                '&::after': currentView === item.id ? {
                  content: '""',
                  position: 'absolute',
                  bottom: '-1px',
                  left: '20%',
                  width: '60%',
                  height: '3px', 
                  backgroundColor: muiTheme.palette.primary.main,
                  borderRadius: '3px 3px 0 0'
                } : {}
              }}
            >
              <i className={`${item.icon}`} style={{ fontSize: '1.25rem' }}></i>
              <span style={{ fontSize: '0.75rem', marginTop: '4px' }}>{item.name}</span>
            </Box>
          ))}
        </div>
      )}
    </>
  );
}

export default NavBar;