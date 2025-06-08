import React, { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import { Box } from '@mui/material';

interface BottomNavBarProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

function BottomNavBar({ currentView, onNavigate }: BottomNavBarProps) {
  const muiTheme = useTheme();
  const isDark = muiTheme.palette.mode === 'dark';
  const [safeAreaBottom, setSafeAreaBottom] = useState(0);
  
  const navItems = [
    { id: 'dashboard', name: 'Home', icon: '🏠' },
    { id: 'meetings', name: 'Meetings', icon: '📍' },
    { id: 'stepwork', name: 'Steps', icon: '📖' },
    { id: 'sponsor', name: 'Sponsorship', icon: '👥' },
    { id: 'profile', name: 'Profile', icon: '👤' }
  ];

  useEffect(() => {
    // Function to get safe area inset bottom
    const getSafeAreaBottom = () => {
      // Method 1: Try CSS env() with computed styles
      const testElement = document.createElement('div');
      testElement.style.cssText = `
        position: fixed;
        bottom: 0;
        height: env(safe-area-inset-bottom);
        visibility: hidden;
        pointer-events: none;
      `;
      document.body.appendChild(testElement);
      
      const computedHeight = window.getComputedStyle(testElement).height;
      document.body.removeChild(testElement);
      
      // Parse the computed height
      if (computedHeight && computedHeight !== 'env(safe-area-inset-bottom)') {
        const pixels = parseInt(computedHeight);
        if (pixels > 0) return pixels;
      }
      
      // Method 2: Check viewport height vs visual viewport (iOS Safari)
      if (window.visualViewport) {
        const heightDiff = window.innerHeight - window.visualViewport.height;
        if (heightDiff > 0) return heightDiff;
      }
      
      // Method 3: Device-specific detection
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isCapacitor = !!(window as any).Capacitor;
      
      if (isIOS && isCapacitor) {
        // Modern iPhones with home indicator
        const screenHeight = window.screen.height;
        const screenWidth = window.screen.width;
        
        // iPhone models with home indicator (34px safe area)
        const hasHomeIndicator = (
          (screenHeight === 812 && screenWidth === 375) || // iPhone X, XS, 11 Pro
          (screenHeight === 896 && screenWidth === 414) || // iPhone XR, 11, XS Max, 11 Pro Max
          (screenHeight === 844 && screenWidth === 390) || // iPhone 12, 12 Pro, 13, 13 Pro
          (screenHeight === 926 && screenWidth === 428) || // iPhone 12 Pro Max, 13 Pro Max
          (screenHeight === 852 && screenWidth === 393) || // iPhone 14, 14 Pro, 15, 15 Pro
          (screenHeight === 932 && screenWidth === 430) || // iPhone 14 Pro Max, 15 Pro Max, 14 Plus, 15 Plus
          screenHeight >= 812 // Any newer iPhone
        );
        
        if (hasHomeIndicator) return 34;
      }
      
      return 0;
    };

    const updateSafeArea = () => {
      const safeArea = getSafeAreaBottom();
      console.log('BottomNavBar: Detected safe area bottom:', safeArea, 'px');
      console.log('BottomNavBar: Screen dimensions:', window.screen.width, 'x', window.screen.height);
      console.log('BottomNavBar: Is Capacitor:', !!(window as any).Capacitor);
      setSafeAreaBottom(safeArea);
    };

    updateSafeArea();
    
    // Re-check on resize/orientation change
    window.addEventListener('resize', updateSafeArea);
    window.addEventListener('orientationchange', updateSafeArea);
    
    return () => {
      window.removeEventListener('resize', updateSafeArea);
      window.removeEventListener('orientationchange', updateSafeArea);
    };
  }, []);

  return (
    <Box
      data-tour="bottom-nav"
      sx={{
        position: 'fixed',
        bottom: safeAreaBottom > 0 ? `-${safeAreaBottom}px` : 0, // Move down into safe area
        left: 0,
        right: 0,
        backgroundColor: isDark ? muiTheme.palette.background.paper : muiTheme.palette.background.default,
        borderTop: `1px solid ${muiTheme.palette.divider}`,
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: '8px 0',
        paddingBottom: `${16 + safeAreaBottom}px`, // Add safe area to padding
        zIndex: 1000,
        boxShadow: '0 -2px 8px rgba(0,0,0,0.1)'
      }}
    >
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <Box
              key={item.id}
              data-tour={`nav-${item.id === 'dashboard' ? 'home' : item.id === 'stepwork' ? 'steps' : item.id === 'sponsor' ? 'sponsorship' : item.id}`}
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