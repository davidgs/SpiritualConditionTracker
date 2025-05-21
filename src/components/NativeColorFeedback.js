import React, { useEffect } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { useAppTheme } from '../contexts/MuiThemeProvider';
import { Capacitor } from '@capacitor/core';

/**
 * Component that provides visual feedback when color theme changes in native environments
 * This helps users see the theme change effect immediately
 */
const NativeColorFeedback = () => {
  const { primaryColor, mode } = useAppTheme();
  const [showFeedback, setShowFeedback] = React.useState(false);
  const [isNative, setIsNative] = React.useState(false);
  
  // Check if running in native environment
  useEffect(() => {
    setIsNative(Capacitor.isNativePlatform());
  }, []);
  
  // Show feedback when theme changes
  useEffect(() => {
    if (!isNative) return;
    
    setShowFeedback(true);
    const timer = setTimeout(() => {
      setShowFeedback(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [primaryColor, mode, isNative]);
  
  if (!isNative || !showFeedback) return null;
  
  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        width: 'auto',
        padding: '0 10px'
      }}
    >
      <Paper
        elevation={3}
        sx={(theme) => ({
          padding: '12px 16px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          backgroundColor: theme.palette.background.paper,
          border: `2px solid ${theme.palette.primary.main}`,
          boxShadow: `0 4px 12px rgba(0,0,0,0.15)`,
          animation: 'fadeInUp 0.3s ease-out'
        })}
      >
        <Box
          sx={(theme) => ({
            width: 16,
            height: 16,
            borderRadius: '50%',
            backgroundColor: theme.palette.primary.main,
            marginRight: 2
          })}
        />
        <Typography variant="body2">
          Theme updated to {primaryColor}
        </Typography>
      </Paper>
    </Box>
  );
};

export default NativeColorFeedback;