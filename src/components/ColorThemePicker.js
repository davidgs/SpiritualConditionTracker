import React from 'react';
import { Box, Typography, Radio, RadioGroup, FormControlLabel, Paper } from '@mui/material';
import { useAppTheme } from '../contexts/MuiThemeProvider';

/**
 * A component that allows users to select a color theme for the app
 * 
 * @returns {React.ReactElement} ColorThemePicker component
 */
const ColorThemePicker = () => {
  const { primaryColor, setPrimaryColor, availableColors, mode } = useAppTheme();
  const darkMode = mode === 'dark';
  
  // Color preview circles with labels
  const colorOptions = {
    blue: { label: 'Blue', color: '#3b82f6', darkColor: '#60a5fa' },
    purple: { label: 'Purple', color: '#8b5cf6', darkColor: '#a78bfa' },
    green: { label: 'Green', color: '#10b981', darkColor: '#34d399' },
    red: { label: 'Red', color: '#ef4444', darkColor: '#f87171' },
    orange: { label: 'Orange', color: '#f97316', darkColor: '#fb923c' },
    teal: { label: 'Teal', color: '#14b8a6', darkColor: '#2dd4bf' }
  };

  return (
    <Paper 
      elevation={0}
      sx={(theme) => ({
        p: 3,
        borderRadius: 2,
        bgcolor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        mb: 2
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
                    color: darkMode ? option.darkColor : option.color,
                    '&.Mui-checked': {
                      color: darkMode ? option.darkColor : option.color,
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
                      bgcolor: darkMode ? option.darkColor : option.color,
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
    </Paper>
  );
};

export default ColorThemePicker;