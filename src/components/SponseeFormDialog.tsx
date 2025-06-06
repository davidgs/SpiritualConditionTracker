import React from 'react';
import { Dialog } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import PersonForm from './shared/PersonForm';

export default function SponseeFormDialog({ open, onClose, onSubmit, initialData }) {
  const theme = useTheme();

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      fullScreen
      PaperProps={{
        sx: {
          bgcolor: theme.palette.background.default,
          color: theme.palette.text.primary
        }
      }}
    >
      <PersonForm
        initialData={initialData}
        onSave={onSubmit}
        onCancel={onClose}
        title={initialData ? 'Edit Sponsee' : 'Add Sponsee'}
        isDialog={false}
      />
    </Dialog>
  );
}