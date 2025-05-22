import { Dialog, styled } from '@mui/material';

/**
 * A styled Dialog component that prevents horizontal scrolling issues
 * when text fields are focused or interacted with.
 * 
 * Designed to be reused across the app for consistent dialog styling
 * and behavior, particularly on mobile devices.
 */
const StyledDialog = styled(Dialog)(({ theme }) => ({
  // Dialog container takes full width with small padding from top
  '& .MuiDialog-container': {
    alignItems: 'flex-start',
    paddingTop: '2.5rem',
    width: '100%',
  },
  // Dialog paper with fixed margins to prevent horizontal shifts
  '& .MuiDialog-paper': {
    // Add a 4px buffer to account for focus states
    width: 'calc(100% - 36px)', 
    maxWidth: '500px',
    margin: '0 18px',
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    position: 'relative',
  },
  // Dialog content
  '& .MuiDialogContent-root': {
    padding: '16px',
    // Prevent horizontal scrolling entirely
    overflowX: 'hidden',
  },
  // Handle input focusing - account for the focus ring width
  '& .MuiOutlinedInput-root': {
    // Give a small margin to account for focus state
    marginLeft: '1px',
    marginRight: '1px',
    width: 'calc(100% - 2px)',
  },
  // Dialog actions
  '& .MuiDialogActions-root': {
    padding: '8px 16px',
  }
}));

export default StyledDialog;