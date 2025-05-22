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
    width: 'calc(100% - 32px)',
    maxWidth: '500px',
    margin: '0 16px',
    overflowX: 'hidden',
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
  },
  '& .MuiDialogContent-root': {
    padding: '16px',
    overflowY: 'auto',
    overflowX: 'hidden',
  },
  '& .MuiDialogActions-root': {
    padding: '8px 16px',
  },
  // Basic overflow control to prevent horizontal scrolling
  '& textarea': {
    boxSizing: 'border-box',
    resize: 'vertical',
  },
  '& input, & select': {
    boxSizing: 'border-box',
  },
  // Ensure consistent form display
  '& form': {
    boxSizing: 'border-box',
  }
}));

export default StyledDialog;