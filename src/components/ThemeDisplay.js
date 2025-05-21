import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { useAppTheme } from '../contexts/MuiThemeProvider';
import { defaultThemeColors } from '../utils/nativeTheme';

/**
 * A component that shows visual examples of the current theme
 */
const ThemeDisplay = () => {
  const { primaryColor, theme } = useAppTheme();
  const darkMode = theme === 'dark';
  
  // Get the actual hex color value from our color mapping
  const actualColorValue = defaultThemeColors[primaryColor];
  
  return (
    <Box sx={{ mt: 2, mb: 2 }}>
      <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
        Current Theme: {primaryColor.charAt(0).toUpperCase() + primaryColor.slice(1)}
      </Typography>
      
      <Box sx={{ 
        display: 'flex', 
        gap: 2, 
        flexWrap: 'wrap',
        justifyContent: 'center',
        mt: 2
      }}>
        {/* Show examples of the theme color in various UI elements */}
        <Paper 
          elevation={3} 
          sx={(theme) => ({
            width: '100%',
            p: 2,
            borderLeft: `8px solid ${actualColorValue}`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1
          })}
        >
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            Theme Preview
          </Typography>
          
          {/* Sample button */}
          <Box 
            sx={{ 
              bgcolor: actualColorValue,
              color: '#fff',
              p: 1,
              borderRadius: 1,
              textAlign: 'center',
              width: '80%',
              mb: 1,
              fontWeight: 'bold',
              fontSize: '0.875rem'
            }}
          >
            Button Example
          </Box>
          
          {/* Sample card */}
          <Box 
            sx={{ 
              border: `2px solid ${actualColorValue}`,
              borderRadius: 1,
              p: 1,
              width: '80%',
              textAlign: 'center',
              fontSize: '0.875rem'
            }}
          >
            Card Border
          </Box>
          
          {/* Sample text */}
          <Typography 
            variant="body2" 
            sx={{ 
              color: actualColorValue,
              fontWeight: 'bold',
              mt: 1
            }}
          >
            Text in theme color
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
};

export default ThemeDisplay;