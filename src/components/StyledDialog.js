import React from 'react';
import { Dialog } from '@mui/material';

/**
 * A styled Dialog component that prevents horizontal scrolling issues
 * when text fields are focused or interacted with.
 * 
 * This component wraps the standard Material UI Dialog with specific
 * props that prevent horizontal scrolling issues on mobile devices.
 */
const StyledDialog = (props) => {
  return (
    <Dialog
      {...props}
      PaperProps={{
        ...props.PaperProps,
        style: {
          ...props.PaperProps?.style,
          overflowX: 'hidden',
          position: 'relative',
          margin: '0 16px',
          width: 'calc(100% - 32px)', 
          maxWidth: '500px',
        }
      }}
      // Use scroll=body to prevent dialog content from scrolling
      // This moves scrolling responsibility to the browser itself
      scroll="body"
    >
      {props.children}
    </Dialog>
  );
};

export default StyledDialog;