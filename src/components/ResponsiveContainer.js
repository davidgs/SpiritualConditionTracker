import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';

/**
 * ResponsiveContainer component that handles viewport adjustments
 * Particularly useful for iOS WebViews in Capacitor to prevent
 * horizontal scrolling issues when keyboard appears
 */
function ResponsiveContainer({ children, sx = {} }) {
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  
  useEffect(() => {
    // Handle resize events
    const handleResize = () => {
      setViewportWidth(window.innerWidth);
      
      // On iOS, detect potential keyboard appearance
      // When keyboard appears, viewport height reduces significantly
      if (window.visualViewport && window.visualViewport.height < window.innerHeight * 0.8) {
        setKeyboardVisible(true);
      } else {
        setKeyboardVisible(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    // visualViewport API is more reliable for keyboard events on iOS
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
      window.visualViewport.addEventListener('scroll', handleResize);
    }
    
    // Force initial calculation
    handleResize();
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
        window.visualViewport.removeEventListener('scroll', handleResize);
      }
    };
  }, []);
  
  return (
    <Box 
      sx={{
        width: '100%',
        maxWidth: viewportWidth,
        overflow: keyboardVisible ? 'hidden' : 'auto',
        paddingBottom: keyboardVisible ? '120px' : 0,
        boxSizing: 'border-box',
        // Apply any additional styles passed via props
        ...sx
      }}
    >
      {children}
    </Box>
  );
}

export default ResponsiveContainer;