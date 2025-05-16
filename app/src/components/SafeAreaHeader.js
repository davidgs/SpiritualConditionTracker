import React from 'react';
import { Box, useTheme } from '@mui/material';
import { isPlatform } from '@ionic/react';

/**
 * SafeAreaHeader component that adds proper spacing for native iOS and Android devices
 * to prevent content from being hidden behind notches, status bars, and camera cutouts
 */
const SafeAreaHeader = ({ children, ...props }) => {
  const theme = useTheme();
  
  // Determine if we're on iOS (for different spacing needs)
  const isIOS = isPlatform('ios');
  
  // Dynamic top padding based on platform
  // For iOS, we add more top padding (44px) to account for the notch and status bar
  // For Android, we use a smaller value (24px) for the status bar
  const topPadding = isIOS ? '44px' : '24px';
  
  return (
    <Box
      sx={{
        width: '100%',
        position: 'sticky',
        top: 0,
        zIndex: theme.zIndex.appBar,
        paddingTop: topPadding,
        backgroundColor: theme.palette.background.paper,
        borderBottom: `1px solid ${theme.palette.divider}`,
        transition: 'padding-top 0.3s ease-in-out',
        ...props.sx
      }}
      {...props}
    >
      {children}
    </Box>
  );
};

export default SafeAreaHeader;