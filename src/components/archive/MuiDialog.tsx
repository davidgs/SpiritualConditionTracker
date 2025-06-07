import React from 'react';
import { 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

/**
 * A Material UI Dialog component that properly handles theming
 * 
 * @param {Object} props
 * @param {boolean} props.open - Whether the dialog is open
 * @param {Function} props.onClose - Function to call when the dialog should close
 * @param {React.ReactNode} props.children - Content to render inside the dialog
 * @param {string} props.title - Dialog title
 * @param {React.ReactNode} props.actions - Actions to show in the dialog footer
 * @param {string} props.maxWidth - Maximum width of the dialog ('xs', 'sm', 'md', 'lg', 'xl')
 * @returns {React.ReactElement}
 */
const MuiDialog = ({
  open,
  onClose,
  children,
  title,
  actions,
  maxWidth = 'sm'
}) => {
  const theme = useTheme();
  
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth
      aria-labelledby="dialog-title"
    >
      {title && (
        <DialogTitle id="dialog-title">
          {title}
        </DialogTitle>
      )}
      
      <DialogContent>
        {children}
      </DialogContent>
      
      {actions && (
        <DialogActions>
          {actions}
        </DialogActions>
      )}
    </Dialog>
  );
};

// Export additional sub-components for easier use
export const DialogTitle = ({ children, className, ...props }) => {
  return (
    <DialogTitle className={className} {...props}>
      {children}
    </DialogTitle>
  );
};

export const DialogContent = ({ children, className, ...props }) => {
  return (
    <DialogContent className={className} {...props}>
      {children}
    </DialogContent>
  );
};

export const DialogActions = ({ children, className, ...props }) => {
  return (
    <DialogActions className={className} {...props}>
      {children}
    </DialogActions>
  );
};

export default MuiDialog;