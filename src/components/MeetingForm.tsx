import React from 'react';
import MeetingFormDialog from './MeetingFormDialog';

export default function MeetingForm({ 
  meeting = null, 
  onSave, 
  onClose,
  isEdit = false,
  open = true,
  darkMode: propDarkMode,
  isOverlay = false
}) {
  // Convert old MeetingForm props to MeetingFormDialog props
  return (
    <MeetingFormDialog
      meeting={meeting}
      onSave={onSave}
      onClose={onClose}
      isEdit={isEdit}
      open={open}
    />
  );
}