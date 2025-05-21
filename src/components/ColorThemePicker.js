import React, { useEffect, useState } from 'react';
import { Box, Typography, Radio, RadioGroup, FormControlLabel, Paper, Button, useTheme } from '@mui/material';
import { useAppTheme } from '../contexts/MuiThemeProvider';
import { Capacitor } from '@capacitor/core';
import { defaultThemeColors } from '../utils/nativeTheme';
import baseColors from '../utils/colorThemes';

/**
 * A component that allows users to select a color theme for the app
 * 
 * @returns {React.ReactElement} ColorThemePicker component
 */
const ColorThemePicker = () => {
  const { primaryColor, setPrimaryColor, availableColors, mode } = useAppTheme();
  const darkMode = mode === 'dark';
  
  // Track if we're in a native environment for enhanced styling
  const [isNative, setIsNative] = useState(false);
  
  // Check if we're running in a native environment on component mount
  useEffect(() => {
    setIsNative(Capacitor.isNativePlatform());
  }, []);
  
  // Get the current MUI theme
  const muiTheme = useTheme();
  
  // Color preview with complete theme information, using our full theme objects
  const colorOptions = Object.keys(baseColors).reduce((acc, colorName) => {
    const themeColor = baseColors[colorName];
    acc[colorName] = { 
      label: colorName.charAt(0).toUpperCase() + colorName.slice(1),
      color: themeColor.main,
      light: themeColor.light,
      dark: themeColor.dark,
    };
    return acc;
  }, {});

  return (
    <Paper 
      elevation={isNative ? 1 : 0} // Add elevation for native platforms
      sx={(theme) => ({
        p: 3,
        borderRadius: isNative ? 3 : 2, // Larger border radius on native
        bgcolor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        mb: 2,
        ...(isNative && { // Add iOS-friendly shadow when in native app
          boxShadow: darkMode ? 
            '0 2px 10px rgba(0,0,0,0.2)' : 
            '0 2px 10px rgba(0,0,0,0.1)'
        })
      })}
    >
      <Typography 
        variant="h6" 
        sx={{ 
          mb: 2,
          color: 'text.primary'
        }}
      >
        App Color Theme
      </Typography>
      
      <Typography 
        variant="body2" 
        sx={{ 
          mb: 2,
          color: 'text.secondary' 
        }}
      >
        Choose your preferred color theme for a more personalized experience.
      </Typography>
      
      {/* Enhanced color picker UI for native environments */}
      {isNative ? (
        // Native-optimized color selector with larger touch targets
        <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 2 }}>
          {availableColors && availableColors.map((colorName) => {
            const option = colorOptions[colorName];
            if (!option) return null;
            
            const isSelected = primaryColor === colorName;
            
            return (
              <Button
                key={colorName}
                variant={isSelected ? "contained" : "outlined"}
                onClick={() => setPrimaryColor(colorName)}
                sx={{
                  minWidth: '90px',
                  height: '60px',
                  borderRadius: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: '2px',
                  borderColor: option.color,
                  transition: 'all 0.2s ease',
                  backgroundColor: isSelected ? option.color : 'transparent',
                  color: isSelected ? '#fff' : option.color,
                  '&:hover': {
                    backgroundColor: isSelected ? option.color : `${option.color}22`,
                    transform: 'translateY(-2px)'
                  },
                  mb: 1
                }}
              >
                <Box 
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    bgcolor: option.color,
                    mb: 0.5,
                    border: '4px solid',
                    borderColor: isSelected ? 'white' : option.color,
                    boxShadow: isSelected ? '0 0 10px 2px rgba(255,255,255,0.3)' : 'none'
                  }}
                />
                <Typography variant="body2" sx={{ fontWeight: isSelected ? 'bold' : 'normal' }}>
                  {option.label}
                </Typography>
              </Button>
            );
          })}
        </Box>
      ) : (
        // Standard web RadioGroup for non-native environments
        <RadioGroup
          value={primaryColor}
          onChange={(e) => setPrimaryColor(e.target.value)}
          name="color-theme-group"
          sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 1 }}
        >
          {availableColors && availableColors.map((colorName) => {
            const option = colorOptions[colorName];
            if (!option) return null;
            
            return (
              <FormControlLabel
                key={colorName}
                value={colorName}
                control={
                  <Radio 
                    sx={{
                      color: darkMode ? option.color : option.color,
                      '&.Mui-checked': {
                        color: darkMode ? option.color : option.color,
                      }
                    }}
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box 
                      sx={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        bgcolor: option.color,
                        border: '1px solid',
                        borderColor: 'divider'
                      }}
                    />
                    <Typography variant="body2">{option.label}</Typography>
                  </Box>
                }
                sx={{ minWidth: '100px' }}
              />
            );
          })}
        </RadioGroup>
      )}
    </Paper>
  );
};

export default ColorThemePicker;