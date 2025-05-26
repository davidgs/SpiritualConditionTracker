import React from 'react';
import { Box, Typography, Paper, Button, Divider, useTheme } from '@mui/material';
import { useAppTheme } from '../contexts/MuiThemeProvider';
import baseColors from '../utils/colorThemes';
import { defaultThemeColors } from '../utils/nativeTheme';

/**
 * A component that shows visual examples of the current theme
 * Uses the MUI theme system for consistent styling
 */
const ThemeDisplay = () => {
  const { primaryColor, theme } = useAppTheme();
  const darkMode = theme === 'dark';
  const muiTheme = useTheme(); // Use the MUI theme for proper styling
  
  // Get the selected color theme details 
  const selectedThemeColor = baseColors[primaryColor] || baseColors.blue;
  const baseHexColor = defaultThemeColors[primaryColor] || defaultThemeColors.blue;
  
  // Function to create color blocks
  const ColorBlock = ({ color, label }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, width: '100%' }}>
      <Box 
        sx={{ 
          width: 60, 
          height: 28, 
          borderRadius: 1, 
          bgcolor: color,
          border: '1px solid',
          borderColor: darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
          mr: 1,
          flexShrink: 0
        }}
      />
      <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
        {label}: {color}
      </Typography>
    </Box>
  );
  
  return (
    <Box sx={{ mt: 2, mb: 3 }}>
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
        {/* Preview card */}
        <Paper 
          elevation={2}
          sx={{
            width: '100%',
            p: 2,
            borderLeft: '8px solid',
            borderColor: 'primary.main',
            display: 'flex',
            flexDirection: 'column',
            gap: 1
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
            Theme Color Palette
          </Typography>
          
          <Divider sx={{ mb: 1 }}/>
          
          <Typography variant="caption" sx={{ fontWeight: 'bold', mb: 0.5 }}>
            Primary Colors
          </Typography>
          
          <ColorBlock color={selectedThemeColor.light} label="Light" />
          <ColorBlock color={selectedThemeColor.main} label="Main" />
          <ColorBlock color={selectedThemeColor.dark} label="Dark" />
          
          <Divider sx={{ my: 1 }}/>
          
          <Typography variant="caption" sx={{ fontWeight: 'bold', mb: 0.5 }}>
            UI Elements
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%' }}>
            {/* Sample button */}
            <Button 
              variant="contained"
              color="primary"
              sx={{ 
                fontWeight: 'medium',
                width: '100%'
              }}
            >
              Primary Button
            </Button>
            
            <Button 
              variant="outlined"
              color="primary"
              sx={{ 
                width: '100%'
              }}
            >
              Outlined Button
            </Button>
            
            <Button 
              variant="text"
              color="primary"
              sx={{ 
                width: '100%'
              }}
            >
              Text Button
            </Button>
          </Box>
          
          <Divider sx={{ my: 1 }} />
          
          <Typography variant="caption" sx={{ fontWeight: 'bold', mb: 0.5 }}>
            Background Colors ({darkMode ? 'Dark' : 'Light'} Mode)
          </Typography>
          
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            gap: 1,
            width: '100%'
          }}>
            <Box sx={{ 
              p: 1, 
              bgcolor: darkMode ? '#111827' : '#f0f2f5', 
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              alignItems: 'center'
            }}>
              <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }}>
                Background: {darkMode ? '#111827' : '#f0f2f5'}
              </Typography>
            </Box>
            
            <Box sx={{ 
              p: 1, 
              bgcolor: darkMode ? '#1f2937' : '#ffffff', 
              borderRadius: 1, 
              border: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              alignItems: 'center'
            }}>
              <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }}>
                Paper/Card: {darkMode ? '#1f2937' : '#ffffff'}
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default ThemeDisplay;