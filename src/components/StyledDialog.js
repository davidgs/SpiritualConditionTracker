import { Dialog, styled } from '@mui/material';

/**
 * A styled Dialog component that prevents horizontal scrolling issues
 * when text fields are focused or interacted with.
 * 
 * Designed to be reused across the app for consistent dialog styling
 * and behavior, particularly on mobile devices.
 */
const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-container': {
    alignItems: 'flex-start',
    paddingTop: '2.5rem',
  },
  '& .MuiDialog-paper': {
    width: '100%',
    maxWidth: '500px',
    margin: '0 auto',
    overflowX: 'hidden',
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
  },
  '& .MuiDialogContent-root': {
    padding: '16px',
    overflowY: 'auto',
    overflowX: 'hidden',
    width: '100%',
    maxWidth: '100%',
  },
  '& .MuiInputBase-root': {
    maxWidth: '100%',
  },
  '& .MuiDialogActions-root': {
    padding: '8px 16px',
  },
  // Prevent horizontal scrolling when input fields are clicked
  '& textarea': {
    maxWidth: '100%',
    boxSizing: 'border-box',
  },
  '& input': {
    boxSizing: 'border-box',
  }
}));

export default StyledDialog;