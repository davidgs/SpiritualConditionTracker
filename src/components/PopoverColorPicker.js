import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  ToggleButtonGroup, 
  ToggleButton, 
  Paper, 
  useTheme, 
  IconButton,
  Popover,
  Tooltip
} from '@mui/material';
import { useAppTheme } from '../contexts/MuiThemeProvider';
import { defaultThemeColors } from '../utils/nativeTheme';
import baseColors from '../utils/colorThemes';

/**
 * A color theme picker component that uses a popover interface
 * This is a cleaner, more compact version of the color picker
 */
const PopoverColorPicker = () => {
  const { primaryColor, setPrimaryColor, availableColors, theme } = useAppTheme();
  const muiTheme = useTheme();
  
  // State for popover
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  
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
  
  // Handle opening the popover
  const handleOpenColorPicker = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  // Handle closing the popover
  const handleCloseColorPicker = () => {
    setAnchorEl(null);
  };
  
  // Get current color information
  const currentColorInfo = getColorInfo(primaryColor);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, justifyContent: 'space-between' }}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'medium', mr: 1 }}>
          App Color
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
          {primaryColor.charAt(0).toUpperCase() + primaryColor.slice(1)}
        </Typography>
      </Box>
      
      {/* Color indicator button that opens the popover */}
      <Tooltip title="Change theme color">
        <IconButton 
          onClick={handleOpenColorPicker}
          aria-label="Change theme color"
          sx={{
            width: 36,
            height: 36,
            bgcolor: currentColorInfo.color,
            border: '2px solid',
            borderColor: 'divider',
            '&:hover': {
              bgcolor: currentColorInfo.light,
            }
          }}
        >
          <span style={{ color: 'transparent' }}>color</span>
        </IconButton>
      </Tooltip>
      
      {/* Color picker popover */}
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleCloseColorPicker}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Paper 
          elevation={2}
          sx={{
            p: 2,
            width: 250,
            maxWidth: '100%'
          }}
        >
          <Box sx={{ mb: 1.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'medium' }}>
              Choose Theme Color
            </Typography>
          </Box>
          
          {/* Color selector in popover */}
          <ToggleButtonGroup
            value={primaryColor}
            exclusive
            onChange={handleColorChange}
            aria-label="theme color"
            sx={{ 
              width: '100%', 
              display: 'flex', 
              flexWrap: 'wrap',
              justifyContent: 'center',
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
      </Popover>
    </Box>
  );
};

export default PopoverColorPicker;