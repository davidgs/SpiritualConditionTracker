import React from 'react';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import { useAppTheme } from '../contexts/MuiThemeProvider';
import { Select, MenuItem, FormControl, InputLabel } from '@mui/material';

export default function ThemeSelector() {
  const { theme, setTheme } = useAppTheme();
  const muiTheme = useMuiTheme();

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
      }}
    >
      <InputLabel id="theme-selector-label">
        Theme
      </InputLabel>
      <Select
        labelId="theme-selector-label"
        value={theme}
        onChange={handleThemeChange}
        label="Theme"
        sx={{
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