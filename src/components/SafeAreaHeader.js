import React, { useEffect, useState } from 'react';
import { Box, useTheme } from '@mui/material';
import { isPlatform } from '@ionic/react';

/**
 * SafeAreaHeader component that adds proper spacing for native iOS and Android devices
 * to prevent content from being hidden behind notches, status bars, and camera cutouts
 */
const SafeAreaHeader = ({ children, ...props }) => {
  const theme = useTheme();
  const [safeAreaInsets, setSafeAreaInsets] = useState({ top: 0, right: 0, bottom: 0, left: 0 });
  
  // Determine if we're on iOS (for different spacing needs)
  const isIOS = isPlatform('ios') || 
               /iPad|iPhone|iPod/.test(navigator.userAgent) || 
               (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  
  // Default padding values
  // For iOS, we add more top padding to account for the notch and status bar
  // For Android, we use a smaller value for the status bar
  const defaultTopPadding = isIOS ? 75 : 24;
  
  useEffect(() => {
    // Check if the environment supports safe area insets
    if (typeof window !== 'undefined' && window.CSS && CSS.supports('padding-top: env(safe-area-inset-top)')) {
      // Get safe area insets if available
      const computedStyle = getComputedStyle(document.documentElement);
      
      const safeAreaTop = parseInt(computedStyle.getPropertyValue('--safe-area-inset-top') || '0', 10);
      const safeAreaRight = parseInt(computedStyle.getPropertyValue('--safe-area-inset-right') || '0', 10);
      const safeAreaBottom = parseInt(computedStyle.getPropertyValue('--safe-area-inset-bottom') || '0', 10);
      const safeAreaLeft = parseInt(computedStyle.getPropertyValue('--safe-area-inset-left') || '0', 10);
      
      setSafeAreaInsets({
        top: safeAreaTop || (isIOS ? defaultTopPadding : 0),
        right: safeAreaRight,
        bottom: safeAreaBottom,
        left: safeAreaLeft
      });
    } else {
      // Use default values based on platform detection
      setSafeAreaInsets({
        top: isIOS ? defaultTopPadding : 24,
        right: 0,
        bottom: 0,
        left: 0
      });
    }
    
    // Add CSS variables for safe area insets
    const style = document.createElement('style');
    style.innerHTML = `
      :root {
        --safe-area-inset-top: env(safe-area-inset-top, ${isIOS ? defaultTopPadding + 'px' : '24px'});
        --safe-area-inset-right: env(safe-area-inset-right, 0px);
        --safe-area-inset-bottom: env(safe-area-inset-bottom, 0px);
        --safe-area-inset-left: env(safe-area-inset-left, 0px);
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, [isIOS, defaultTopPadding]);
  
  return (
    <Box
      sx={{
        width: '100%',
        position: 'sticky',
        top: 0,
        zIndex: theme.zIndex.appBar,
        paddingTop: `${safeAreaInsets.top}px`,
        paddingRight: `${safeAreaInsets.right}px`,
        paddingLeft: `${safeAreaInsets.left}px`,
        backgroundColor: theme.palette.background.paper,
        borderBottom: `1px solid ${theme.palette.divider}`,
        transition: 'padding 0.3s ease-in-out',
        // Support for older iOS browsers
        '@supports (padding-top: constant(safe-area-inset-top))': {
          paddingTop: 'constant(safe-area-inset-top)',
          paddingRight: 'constant(safe-area-inset-right)',
          paddingLeft: 'constant(safe-area-inset-left)'
        },
        // Support for newer iOS browsers
        '@supports (padding-top: env(safe-area-inset-top))': {
          paddingTop: 'env(safe-area-inset-top)',
          paddingRight: 'env(safe-area-inset-right)',
          paddingLeft: 'env(safe-area-inset-left)'
        },
        ...props.sx
      }}
      {...props}
    >
      {children}
    </Box>
  );
};

export default SafeAreaHeader;