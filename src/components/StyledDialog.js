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
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
  },
  '& .MuiDialogContent-root': {
    padding: '16px',
    overflow: 'hidden',
  },
  '& .MuiDialogActions-root': {
    padding: '8px 16px',
  }
}));

export default StyledDialog;