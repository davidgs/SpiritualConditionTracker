import React from 'react';
import { useTheme } from '@mui/material/styles';
import MeetingFormCore from './MeetingFormCore';

export default function MeetingForm({ 
  meeting = null, 
  onSave, 
  onClose,
  isEdit = false,
  open = true,
  darkMode: propDarkMode,
  isOverlay = false
}) {
  const muiTheme = useTheme();
  const isDarkMode = propDarkMode !== undefined ? propDarkMode : (muiTheme.palette.mode === 'dark');

  const containerClass = isOverlay 
    ? "fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm"
    : "";

  return (
    <div className={containerClass}>
      <div className={isOverlay ? "max-w-lg w-full bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden p-6" : ""}>
        <MeetingFormCore
          meeting={meeting}
          onSave={onSave}
          onCancel={onClose}
          onClose={onClose}
          isEdit={isEdit}
          darkMode={isDarkMode}
          use24HourFormat={false}
        />
      </div>
    </div>
  );
}