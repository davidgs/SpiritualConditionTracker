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
      // Ensure we stay within the available width
      setViewportWidth(Math.min(window.innerWidth * 0.95, window.visualViewport ? window.visualViewport.width * 0.95 : window.innerWidth * 0.95));
      
      // On iOS, detect potential keyboard appearance
      // When keyboard appears, viewport height reduces significantly
      if (window.visualViewport && window.visualViewport.height < window.innerHeight * 0.8) {
        setKeyboardVisible(true);
      } else {
        setKeyboardVisible(false);
      }
    };
    
    // Setup focus/blur listeners for input fields
    const handleFocusIn = () => {
      // When an input field gets focus, potentially a keyboard will appear
      // Force a narrow width to prevent horizontal scrolling
      setViewportWidth(Math.min(window.innerWidth * 0.90, 
                                window.visualViewport ? window.visualViewport.width * 0.90 : window.innerWidth * 0.90));
    };
    
    const handleFocusOut = () => {
      // When focus leaves an input, recalculate the viewport
      handleResize();
    };
    
    window.addEventListener('resize', handleResize);
    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);
    
    // visualViewport API is more reliable for keyboard events on iOS
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
      window.visualViewport.addEventListener('scroll', handleResize);
    }
    
    // Force initial calculation
    handleResize();
    
    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
      
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
        overflowX: 'hidden', // Always hide horizontal overflow
        overflowY: keyboardVisible ? 'auto' : 'visible',
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