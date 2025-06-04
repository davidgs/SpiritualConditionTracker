import React from 'react';
import MeetingFormCore from './MeetingFormCore';
import { useTheme } from '@mui/material/styles';
import StyledDialog from './StyledDialog';
import { 
  DialogTitle,
  DialogContent
} from '@mui/material';

export default function MeetingFormDialog({ 
  meeting = null, 
  onSave, 
  onClose,
  isEdit = false,
  open = true,
  use24HourFormat = false
}) {
  const muiTheme = useTheme();

  const handleFormSave = async (meetingData) => {
    await onSave(meetingData);
    onClose();
  };

  return (
    <StyledDialog
      open={open} 
      onClose={onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle sx={(theme) => ({ 
        color: theme.palette.text.primary,
        borderBottom: `1px solid ${theme.palette.divider}`,
        pb: 1,
        display: 'flex',
        alignItems: 'center',
        gap: 1
      })}>
        <i className="fa-regular fa-calendar-plus mr-2 text-gray-400 dark:text-gray-500"></i>
        {isEdit ? 'Edit Meeting' : 'Add New Meeting'}
      </DialogTitle>
      
      <DialogContent sx={(theme) => ({
        py: 2,
        overflowX: 'hidden',
        maxWidth: '100%',
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary,
        '& .MuiFormControl-root': {
          maxWidth: '100%'
        }
      })}>
        <MeetingFormCore
          meeting={meeting}
          onSave={handleFormSave}
          onCancel={onClose}
          use24HourFormat={use24HourFormat}
          showButtons={true}
        />
      </DialogContent>
    </StyledDialog>
  );
}