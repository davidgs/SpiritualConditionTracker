import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Select, MenuItem, FormControl, InputLabel } from '@mui/material';

export default function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  const isDarkMode = theme === 'dark';

  // Handle theme change
  const handleThemeChange = (event) => {
    setTheme(event.target.value);
  };

  return (
    <FormControl 
      variant="outlined" 
      size="small" 
      fullWidth
      sx={{ 
        minWidth: 120,
        '.MuiOutlinedInput-root': {
          backgroundColor: isDarkMode ? 'rgba(55, 65, 81, 0.3)' : 'transparent',
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: isDarkMode ? '#4b5563' : '#d1d5db',
          },
        },
        '.MuiOutlinedInput-notchedOutline': {
          borderColor: isDarkMode ? '#4b5563' : '#d1d5db',
        },
        '.MuiSvgIcon-root': {
          color: isDarkMode ? '#9ca3af' : '#6b7280',
        }
      }}
    >
      <InputLabel 
        id="theme-selector-label"
        sx={{ 
          color: isDarkMode ? '#9ca3af' : '#6b7280',
          '&.Mui-focused': {
            color: isDarkMode ? '#60a5fa' : '#3b82f6'
          }
        }}
      >
        Theme
      </InputLabel>
      <Select
        labelId="theme-selector-label"
        value={theme}
        onChange={handleThemeChange}
        label="Theme"
        sx={{
          color: isDarkMode ? '#d1d5db' : '#374151',
          '.MuiSelect-select': {
            paddingY: 1.2,
          }
        }}
      >
        <MenuItem value="light">Light</MenuItem>
        <MenuItem value="dark">Dark</MenuItem>
      </Select>
    </FormControl>
  );
}