import React, { useEffect } from 'react';
import { Dialog } from '@mui/material';
import '../styles/dialog-fix.css';

/**
 * A styled Dialog component that prevents horizontal scrolling issues
 * when text fields are focused or interacted with.
 * 
 * This component wraps the standard Material UI Dialog and uses
 * a dedicated CSS file with !important rules to override the default
 * Material UI styling that causes horizontal scrolling.
 */
const StyledDialog = (props) => {
  // Apply a specific class to the body when dialog is open
  // This helps with controlling overflow behavior
  useEffect(() => {
    if (props.open) {
      document.body.classList.add('dialog-open');
    } else {
      document.body.classList.remove('dialog-open');
    }
    
    return () => {
      document.body.classList.remove('dialog-open');
    };
  }, [props.open]);

  return (
    <Dialog
      {...props}
      scroll="body"
      className="dialog-with-fix"
    >
      {props.children}
    </Dialog>
  );
};

export default StyledDialog;