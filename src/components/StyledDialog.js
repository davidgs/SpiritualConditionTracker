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
    width: '100%',
    maxWidth: '100vw',
  },
  '& .MuiDialog-paper': {
    width: 'calc(100% - 32px)',
    maxWidth: '500px',
    margin: '0 16px',
    overflowX: 'hidden',
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    position: 'relative',
  },
  '& .MuiDialogContent-root': {
    padding: '16px',
    overflowY: 'auto',
    overflowX: 'hidden',
    width: '100%',
    maxWidth: '100%',
    boxSizing: 'border-box',
  },
  '& .MuiInputBase-root': {
    maxWidth: '100%',
    width: '100%',
    boxSizing: 'border-box',
  },
  '& .MuiDialogActions-root': {
    padding: '8px 16px',
    width: '100%',
    boxSizing: 'border-box',
  },
  // Prevent horizontal scrolling when input fields are clicked
  '& textarea': {
    maxWidth: '100%',
    width: '100%',
    boxSizing: 'border-box',
    overflow: 'hidden',
    resize: 'vertical',
  },
  '& input': {
    maxWidth: '100%',
    width: '100%',
    boxSizing: 'border-box',
  },
  '& select': {
    maxWidth: '100%',
    width: '100%',
    boxSizing: 'border-box',
  },
  // Force all form elements to respect container width
  '& form': {
    width: '100%',
    maxWidth: '100%',
    boxSizing: 'border-box',
  },
  '& .MuiBox-root': {
    maxWidth: '100%',
    boxSizing: 'border-box',
  }
}));

export default StyledDialog;