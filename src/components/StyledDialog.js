import { Dialog, styled } from '@mui/material';

/**
 * A styled Dialog component that prevents horizontal scrolling issues
 * when text fields are focused or interacted with.
 * 
 * Designed to be reused across the app for consistent dialog styling
 * and behavior, particularly on mobile devices.
 */
const StyledDialog = styled(Dialog)(({ theme }) => ({
  // Position dialog from top with padding
  '& .MuiDialog-container': {
    alignItems: 'flex-start',
    paddingTop: '2.5rem',
  },
  // Overall dialog paper styling
  '& .MuiDialog-paper': {
    width: 'calc(100% - 32px)',
    maxWidth: '500px',
    margin: '0 16px',
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    position: 'relative',
  },
  // Content area styling
  '& .MuiDialogContent-root': {
    padding: '16px',
    overflowX: 'auto', // Allow horizontal scroll if needed rather than breaking layout
  },
  // Actions area styling
  '& .MuiDialogActions-root': {
    padding: '8px 16px',
  }
}));

export default StyledDialog;