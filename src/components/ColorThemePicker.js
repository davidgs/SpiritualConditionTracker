import React from 'react';
import { Box, Typography, ToggleButtonGroup, ToggleButton, Paper, useTheme } from '@mui/material';
import { useAppTheme } from '../contexts/MuiThemeProvider';
import { defaultThemeColors } from '../utils/nativeTheme';
import baseColors from '../utils/colorThemes';

/**
 * A compact and elegant color theme picker component
 * 
 * @returns {React.ReactElement} ColorThemePicker component
 */
const ColorThemePicker = () => {
  const { primaryColor, setPrimaryColor, availableColors, theme } = useAppTheme();
  const darkMode = theme === 'dark';
  const muiTheme = useTheme();
  
  // Get colors from our theme system
  const getColorInfo = (colorName) => {
    const themeColor = baseColors[colorName] || baseColors.blue;
    return { 
      label: colorName.charAt(0).toUpperCase() + colorName.slice(1),
      color: themeColor.main,
      light: themeColor.light,
      dark: themeColor.dark,
    };
  };

  // Handle color selection
  const handleColorChange = (event, newColor) => {
    if (newColor !== null) {
      setPrimaryColor(newColor);
    }
  };

  return (
    <Paper 
      elevation={1}
      sx={{
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        p: 2,
        mb: 2
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5, justifyContent: 'space-between' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
          App Color
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {primaryColor.charAt(0).toUpperCase() + primaryColor.slice(1)}
        </Typography>
      </Box>
      
      {/* Compact color selector */}
      <ToggleButtonGroup
        value={primaryColor}
        exclusive
        onChange={handleColorChange}
        aria-label="theme color"
        sx={{ 
          width: '100%', 
          display: 'flex', 
          flexWrap: 'wrap',
          '& .MuiToggleButtonGroup-grouped': {
            m: 0.5,
            borderRadius: '50%!important',
            border: '2px solid',
            borderColor: 'divider',
            width: 40,
            height: 40,
            minWidth: 'unset',
            p: 0
          }
        }}
      >
        {availableColors && availableColors.map((colorName) => {
          const colorInfo = getColorInfo(colorName);
          const isSelected = primaryColor === colorName;
          
          return (
            <ToggleButton 
              key={colorName} 
              value={colorName}
              sx={{
                position: 'relative',
                bgcolor: colorInfo.color,
                '&.Mui-selected': {
                  bgcolor: colorInfo.color,
                  border: '2px solid white',
                  boxShadow: '0 0 0 2px ' + colorInfo.color,
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 14,
                    height: 14,
                    borderRadius: '50%',
                    backgroundColor: 'white',
                    zIndex: 1
                  }
                },
                '&:hover': {
                  bgcolor: colorInfo.light,
                }
              }}
            >
              <span style={{ color: 'transparent' }}>{colorName}</span>
            </ToggleButton>
          );
        })}
      </ToggleButtonGroup>
    </Paper>
  );
};

export default ColorThemePicker;