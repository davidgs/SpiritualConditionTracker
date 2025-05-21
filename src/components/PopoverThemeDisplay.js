import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  IconButton, 
  Tooltip, 
  Popover,
  Button 
} from '@mui/material';
import { useAppTheme } from '../contexts/MuiThemeProvider';
import ThemeDisplay from './ThemeDisplay';

/**
 * A component that shows the theme details in a popover
 * This saves space on the Profile page by hiding theme details until requested
 */
const PopoverThemeDisplay = () => {
  const { primaryColor } = useAppTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  
  // Handle opening the theme details popover
  const handleOpenThemeDetails = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  // Handle closing the theme details popover
  const handleCloseThemeDetails = () => {
    setAnchorEl(null);
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
        Theme Details
      </Typography>
      
      {/* Button to show theme details */}
      <Tooltip title="View theme details">
        <Button 
          variant="outlined"
          size="small"
          onClick={handleOpenThemeDetails}
          sx={{ textTransform: 'none' }}
        >
          View Theme Details
        </Button>
      </Tooltip>
      
      {/* Theme details popover */}
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleCloseThemeDetails}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        PaperProps={{
          sx: { 
            maxWidth: '90%', 
            width: 400,
            maxHeight: '80vh',
            overflow: 'auto'
          }
        }}
      >
        {/* Use the existing ThemeDisplay component inside our popover */}
        <Box sx={{ p: 2 }}>
          <ThemeDisplay />
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button 
              onClick={handleCloseThemeDetails}
              size="small"
            >
              Close
            </Button>
          </Box>
        </Box>
      </Popover>
    </Box>
  );
};

export default PopoverThemeDisplay;