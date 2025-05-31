import React from 'react';
import { useTheme } from '@mui/material/styles';
import { Box } from '@mui/material';

interface BottomNavBarProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

function BottomNavBar({ currentView, onNavigate }: BottomNavBarProps) {
  const muiTheme = useTheme();
  const isDark = muiTheme.palette.mode === 'dark';
  
  const navItems = [
    { id: 'dashboard', name: 'Home', icon: '🏠' },
    { id: 'meetings', name: 'Meetings', icon: '📍' },
    { id: 'stepwork', name: 'Steps', icon: '📖' },
    { id: 'sponsor', name: 'Sponsor', icon: '👥' },
    { id: 'profile', name: 'Profile', icon: '👤' }
  ];

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: isDark ? muiTheme.palette.background.paper : muiTheme.palette.background.default,
        borderTop: `1px solid ${muiTheme.palette.divider}`,
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: '8px 0 16px 0', // Extra bottom padding for iPhone home indicator
        paddingBottom: 'max(16px, env(safe-area-inset-bottom))', // iOS safe area
        zIndex: 1000,
        boxShadow: '0 -2px 8px rgba(0,0,0,0.1)'
      }}
    >
      {navItems.map((item) => {
        const isActive = currentView === item.id;
        return (
          <Box
            key={item.id}
            component="button"
            onClick={() => onNavigate(item.id)}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px 12px',
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              minWidth: '60px',
              '&:hover': {
                backgroundColor: isDark 
                  ? muiTheme.palette.action.hover 
                  : muiTheme.palette.action.hover,
              },
              '&:active': {
                transform: 'scale(0.95)'
              }
            }}
          >
            <Box
              sx={{
                fontSize: '20px',
                marginBottom: '2px',
                filter: isActive ? 'none' : isDark ? 'grayscale(0.3)' : 'grayscale(0.5)',
                opacity: isActive ? 1 : isDark ? 0.7 : 0.6,
                transition: 'all 0.2s ease'
              }}
            >
              {item.icon}
            </Box>
            <Box
              sx={{
                fontSize: '10px',
                fontWeight: isActive ? 600 : 400,
                color: isActive 
                  ? muiTheme.palette.primary.main 
                  : muiTheme.palette.text.secondary,
                transition: 'all 0.2s ease'
              }}
            >
              {item.name}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}

export default BottomNavBar;