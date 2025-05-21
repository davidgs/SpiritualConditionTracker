import React from 'react';
import { Box, Typography, Paper, Button, useTheme } from '@mui/material';
import { useAppTheme } from '../contexts/MuiThemeProvider';

/**
 * A component that shows visual examples of the current theme
 * Uses the MUI theme system for consistent styling
 */
const ThemeDisplay = () => {
  const { primaryColor, theme } = useAppTheme();
  const darkMode = theme === 'dark';
  const muiTheme = useTheme(); // Use the MUI theme for proper styling
  
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
          elevation={2}
          sx={{
            width: '100%',
            p: 2,
            borderLeft: '8px solid',
            borderColor: 'primary.main',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            Theme Preview
          </Typography>
          
          {/* Sample button */}
          <Button 
            variant="contained"
            fullWidth
            sx={{ 
              mb: 1,
              width: '80%',
              fontWeight: 'bold',
              fontSize: '0.875rem'
            }}
          >
            Button Example
          </Button>
          
          {/* Sample card */}
          <Paper
            variant="outlined"
            sx={{ 
              p: 1,
              width: '80%',
              textAlign: 'center',
              fontSize: '0.875rem',
              borderColor: 'primary.main',
              borderWidth: 2
            }}
          >
            Card Border
          </Paper>
          
          {/* Sample text */}
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'primary.main',
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