import React, { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import MuiThemeProvider from '../contexts/MuiThemeProvider';
import MeetingForm from './MeetingForm';

// Use the theme system and only style custom elements that MUI doesn't cover
const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiPaper-root': {
    maxWidth: '100%',
    width: 'calc(100% - 32px)',
    margin: '16px',
    overflowX: 'hidden',
  },
  '& .MuiDialogContent-root': {
    padding: '16px',
    overflowX: 'hidden',
    maxWidth: '100%',
    boxSizing: 'border-box',
  },
  '& .MuiDialogActions-root': {
    padding: '8px 16px',
  },
  // Style form elements that aren't Material UI components
  '& select': {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    border: `1px solid ${theme.palette.mode === 'dark' ? theme.palette.grey[700] : theme.palette.grey[300]}`,
    padding: '0.5rem 0.75rem',
    borderRadius: theme.shape.borderRadius,
    fontSize: '0.875rem',
    width: '100%',
    appearance: 'auto',
  },
  '& select:focus': {
    borderColor: theme.palette.primary.main,
    outline: 'none',
  },
  '& select option': {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
  },
  '& textarea': {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    border: `1px solid ${theme.palette.mode === 'dark' ? theme.palette.grey[700] : theme.palette.grey[300]}`,
    borderRadius: theme.shape.borderRadius,
    padding: '0.5rem 0.75rem',
    fontSize: '0.875rem',
  },
  '& textarea::placeholder': {
    color: theme.palette.text.secondary,
  },
  '& input[type="date"]': {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    border: `1px solid ${theme.palette.mode === 'dark' ? theme.palette.grey[700] : theme.palette.grey[300]}`,
    padding: '0.5rem 0.75rem',
    borderRadius: theme.shape.borderRadius,
    fontSize: '0.875rem',
  },
}));

/**
 * Material UI Dialog component that displays the activity logging form
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.open - Whether the dialog is open
 * @param {Function} props.onClose - Function to call when the dialog should close
 * @param {Function} props.onSave - Function to save the activity
 * @param {Function} props.onSaveMeeting - Function to save a meeting
 * @param {Array} props.meetings - List of meetings for selection in the form
 * @returns {React.ReactElement} The dialog component
 */
const LogActivityModal = ({ open, onClose, onSave, onSaveMeeting, meetings = [] }) => {
  // Dark mode detection
  const darkMode = document.documentElement.classList.contains('dark');
  const [isDarkMode, setIsDarkMode] = useState(darkMode);
  
  // Activity form states
  const [activityType, setActivityType] = useState('prayer');
  const [duration, setDuration] = useState('15');
  const [date, setDate] = useState(getCurrentDateString());
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Additional fields for specific activity types
  const [literatureTitle, setLiteratureTitle] = useState('');
  const [meetingName, setMeetingName] = useState('');
  const [wasChair, setWasChair] = useState(false);
  const [wasShare, setWasShare] = useState(false);
  const [wasSpeaker, setWasSpeaker] = useState(false);
  
  // Call type checkboxes
  const [isSponsorCall, setIsSponsorCall] = useState(false);
  const [isSponseeCall, setIsSponseeCall] = useState(false);
  const [isAAMemberCall, setIsAAMemberCall] = useState(false);
  
  // Meeting selection fields
  const [selectedMeetingId, setSelectedMeetingId] = useState('');
  const [showMeetingForm, setShowMeetingForm] = useState(false);
  
  // Generate current date in YYYY-MM-DD format
  function getCurrentDateString() {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  }
  
  // Watch for dark mode changes
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setIsDarkMode(document.documentElement.classList.contains('dark'));
        }
      });
    });
    
    observer.observe(document.documentElement, { attributes: true });
    
    return () => observer.disconnect();
  }, []);
  
  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [open]);
  
  // Reset additional fields when activity type changes
  useEffect(() => {
    // Set default duration based on activity type
    if (activityType === 'meeting') {
      setDuration('60'); // Default duration for meetings is 60 minutes
    } else {
      setDuration('15'); // Default duration for other activities
    }
    
    setLiteratureTitle('');
    setMeetingName('');
    setWasChair(false);
    setWasShare(false);
    setWasSpeaker(false);
    setIsSponsorCall(false);
    setIsSponseeCall(false);
    setIsAAMemberCall(false);
    setSelectedMeetingId('');
    setShowMeetingForm(false);
  }, [activityType]);
  
  // Get duration options based on activity type
  const getDurationOptions = () => {
    const options = [];
    let maxMinutes = 60; // Default max is 1 hour
    let increment = 15; // Default increment is 15 minutes
    
    if (activityType === 'meeting') {
      maxMinutes = 150; // 2.5 hours
      increment = 30; // 30 minute increments
    } else if (activityType === 'sponsee' || activityType === 'service') {
      maxMinutes = 120; // 2 hours
    }
    
    for (let i = increment; i <= maxMinutes; i += increment) {
      options.push(
        <option key={i} value={i.toString()}>{i} minutes</option>
      );
    }
    
    return options;
  };
  
  // Reset form fields
  const resetForm = () => {
    setActivityType('prayer');
    setDuration('15');
    setDate(getCurrentDateString());
    setNotes('');
    setErrors({});
    setShowSuccess(false);
    setLiteratureTitle('');
    setMeetingName('');
    setWasChair(false);
    setWasShare(false);
    setWasSpeaker(false);
    setIsSponsorCall(false);
    setIsSponseeCall(false);
    setIsAAMemberCall(false);
    setSelectedMeetingId('');
    setShowMeetingForm(false);
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    const newErrors = {};
    if (!activityType) newErrors.activityType = 'Activity type is required';
    if (!duration) newErrors.duration = 'Duration is required';
    if (!date) newErrors.date = 'Date is required';
    
    // Validate activity-specific fields
    if (activityType === 'literature' && !literatureTitle.trim()) {
      newErrors.literatureTitle = 'Literature title is required';
    }
    
    if (activityType === 'meeting' && !showMeetingForm && !meetingName.trim()) {
      newErrors.meetingName = 'Meeting name is required';
    }
    
    if (activityType === 'call' && !isSponsorCall && !isSponseeCall && !isAAMemberCall) {
      newErrors.callType = 'At least one call type must be selected';
    }
    
    // If there are errors, show them and don't submit
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Create a unique ID for the activity
    const activityId = Date.now().toString();
    
    // Create new activity object with core fields
    const newActivity = {
      id: activityId,
      type: activityType,
      duration: parseInt(duration, 10),
      date: date, // Store as-is in YYYY-MM-DD format
      notes: notes.trim(),
    };
    
    // Add activity-specific fields
    if (activityType === 'literature') {
      newActivity.literatureTitle = literatureTitle.trim();
    }
    
    if (activityType === 'meeting') {
      newActivity.meetingName = meetingName.trim();
      newActivity.wasChair = wasChair;
      newActivity.wasShare = wasShare;
      newActivity.wasSpeaker = wasSpeaker;
      
      // Include meeting ID if one was selected
      if (selectedMeetingId) {
        newActivity.meetingId = selectedMeetingId;
      }
    }
    
    if (activityType === 'call') {
      newActivity.isSponsorCall = isSponsorCall;
      newActivity.isSponseeCall = isSponseeCall;
      newActivity.isAAMemberCall = isAAMemberCall;
      
      // Determine the actual type for filtering/display purposes
      if (isSponsorCall && !isSponseeCall && !isAAMemberCall) {
        newActivity.callType = 'sponsor';
      } else if (!isSponsorCall && isSponseeCall && !isAAMemberCall) {
        newActivity.callType = 'sponsee';
      } else if (!isSponsorCall && !isSponseeCall && isAAMemberCall) {
        newActivity.callType = 'aa_call';
      } else {
        newActivity.callType = 'multiple'; // Multiple types selected
      }
    }
    
    // Save the activity
    onSave(newActivity);
    
    // Show success message
    setShowSuccess(true);
    
    // Hide success message after 2 seconds
    setTimeout(() => {
      setShowSuccess(false);
      
      // Only close the dialog on success if it's not a meeting form
      if (!showMeetingForm) {
        resetForm();
      }
    }, 2000);
  };
  
  // Handle meeting selection
  function handleMeetingSelect(e) {
    const meetingId = e.target.value;
    setSelectedMeetingId(meetingId);
    
    if (meetingId) {
      const meeting = meetings.find(m => m.id === meetingId);
      if (meeting) {
        setMeetingName(meeting.name);
      }
    } else {
      setMeetingName('');
    }
  }
  
  // Handle saving a meeting from the meeting form
  function handleSaveMeeting(meeting) {
    // Call the parent's onSaveMeeting function to persist the meeting
    if (onSaveMeeting) {
      const savedMeeting = onSaveMeeting(meeting);
      if (savedMeeting) {
        setSelectedMeetingId(savedMeeting.id);
        setMeetingName(savedMeeting.name);
      }
    }
    
    // Close the form
    setShowMeetingForm(false);
  }
  
  // Common styles for form elements using the current dark/light mode
  // Don't use complex theme for now, just direct color mapping
  const palette = {
    mode: darkMode ? 'dark' : 'light',
    background: { 
      paper: darkMode ? '#1f2937' : '#ffffff',
      default: darkMode ? '#111827' : '#f9fafb'
    },
    text: { 
      primary: darkMode ? '#e5e7eb' : '#1f2937', 
      secondary: darkMode ? '#9ca3af' : '#4b5563' 
    },
    grey: { 
      300: darkMode ? '#4b5563' : '#d1d5db', 
      700: darkMode ? '#1f2937' : '#374151' 
    },
    primary: {
      main: darkMode ? '#60a5fa' : '#3b82f6'
    },
    error: {
      main: darkMode ? '#ef4444' : '#dc2626'
    }
  };
  
  const labelStyle = {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: '500',
    marginBottom: '0.25rem',
    color: palette.text.secondary
  };
  
  const inputStyle = {
    width: '100%',
    padding: '0.5rem 0.75rem',
    borderRadius: '0.375rem',
    backgroundColor: palette.background.paper,
    color: palette.text.primary,
    border: `1px solid ${palette.mode === 'dark' ? palette.grey[700] : palette.grey[300]}`,
    fontSize: '0.875rem'
  };
  
  const errorStyle = { 
    color: palette.error?.main || '#ef4444', 
    fontSize: '0.75rem', 
    marginTop: '0.25rem' 
  };
  
  const checkboxStyle = {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '0.5rem'
  };
  
  return (
    <MuiThemeProvider>
      <StyledDialog
        open={open}
        onClose={onClose}
        aria-labelledby="log-activity-dialog-title"
        maxWidth="md"
        PaperProps={{
          style: {
            backgroundColor: darkMode ? '#1f2937' : '#ffffff',
            color: darkMode ? '#e5e7eb' : '#1f2937',
          },
        }}
      >
        <DialogTitle 
          id="log-activity-dialog-title"
          sx={{
            backgroundColor: darkMode ? '#111827' : '#f9fafb',
            color: darkMode ? '#f3f4f6' : '#111827',
            borderBottom: '1px solid',
            borderColor: darkMode ? '#374151' : '#e5e7eb',
          }}
        >
          Log New Activity
        </DialogTitle>
        
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: palette.text.secondary,
          }}
        >
          <CloseIcon />
        </IconButton>
        
        <DialogContent 
          dividers
          sx={{
            backgroundColor: darkMode ? '#1f2937' : '#ffffff',
            color: darkMode ? '#e5e7eb' : '#1f2937',
          }}
        >
          {/* Success message */}
          {showSuccess && (
            <div style={{
              backgroundColor: darkMode ? '#064e3b' : '#d1fae5',
              color: darkMode ? '#6ee7b7' : '#065f46',
              padding: '0.75rem',
              borderRadius: '0.375rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
              fontWeight: '500',
              fontSize: '0.875rem'
            }}>
              <i className="fas fa-check-circle mr-2"></i>
              Activity saved successfully!
            </div>
          )}
          
          {/* Display the meeting form inside the modal when needed */}
          {activityType === 'meeting' && showMeetingForm ? (
            <MeetingForm
              onSave={handleSaveMeeting}
              onCancel={() => setShowMeetingForm(false)}
              darkMode={isDarkMode}
              isOverlay={false}
            />
          ) : (
            <form onSubmit={handleSubmit}>
              {/* Activity Type */}
              <div style={{ marginBottom: '1rem', maxWidth: '100%' }}>
                <label style={labelStyle}>
                  Activity Type
                </label>
                <select
                  style={{...inputStyle, maxWidth: '100%', boxSizing: 'border-box'}}
                  value={activityType}
                  onChange={(e) => setActivityType(e.target.value)}
                >
                  <option value="prayer">Prayer</option>
                  <option value="meditation">Meditation</option>
                  <option value="literature">Reading Literature</option>
                  <option value="service">Service Work</option>
                  <option value="call">Call</option>
                  <option value="meeting">AA Meeting</option>
                </select>
                {errors.activityType && (
                  <p style={errorStyle}>{errors.activityType}</p>
                )}
              </div>
              
              {/* Duration dropdown */}
              <div style={{ marginBottom: '1rem', maxWidth: '100%' }}>
                <label style={labelStyle}>
                  Duration
                </label>
                <select
                  style={{...inputStyle, maxWidth: '100%', boxSizing: 'border-box'}}
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                >
                  {getDurationOptions()}
                </select>
                {errors.duration && (
                  <p style={errorStyle}>{errors.duration}</p>
                )}
              </div>
              
              {/* Date picker */}
              <div style={{ marginBottom: '1rem', maxWidth: '100%' }}>
                <label style={labelStyle}>
                  Date
                </label>
                <input
                  type="date"
                  style={{...inputStyle, maxWidth: '100%', boxSizing: 'border-box'}}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
                {errors.date && (
                  <p style={errorStyle}>{errors.date}</p>
                )}
              </div>
              
              {/* Call Type Options - only for Call activity type */}
              {activityType === 'call' && (
                <div style={{ marginBottom: '1rem', maxWidth: '100%' }}>
                  <label style={{...labelStyle, marginBottom: '0.5rem'}}>
                    Call Type
                  </label>
                  <div style={{...checkboxStyle, maxWidth: '100%'}}>
                    <input
                      type="checkbox"
                      id="isSponsorCall"
                      checked={isSponsorCall}
                      onChange={() => setIsSponsorCall(!isSponsorCall)}
                      style={{ marginRight: '0.5rem' }}
                    />
                    <label 
                      htmlFor="isSponsorCall"
                      style={{
                        fontSize: '0.875rem',
                        color: darkMode ? '#e5e7eb' : '#4b5563'
                      }}
                    >
                      Sponsor
                    </label>
                  </div>
                  <div style={{...checkboxStyle, maxWidth: '100%'}}>
                    <input
                      type="checkbox"
                      id="isSponseeCall"
                      checked={isSponseeCall}
                      onChange={() => setIsSponseeCall(!isSponseeCall)}
                      style={{ marginRight: '0.5rem' }}
                    />
                    <label 
                      htmlFor="isSponseeCall"
                      style={{
                        fontSize: '0.875rem',
                        color: darkMode ? '#e5e7eb' : '#4b5563'
                      }}
                    >
                      Sponsee
                    </label>
                  </div>
                  <div style={{...checkboxStyle, maxWidth: '100%'}}>
                    <input
                      type="checkbox"
                      id="isAAMemberCall"
                      checked={isAAMemberCall}
                      onChange={() => setIsAAMemberCall(!isAAMemberCall)}
                      style={{ marginRight: '0.5rem' }}
                    />
                    <label 
                      htmlFor="isAAMemberCall"
                      style={{
                        fontSize: '0.875rem',
                        color: darkMode ? '#e5e7eb' : '#4b5563'
                      }}
                    >
                      AA Member
                    </label>
                  </div>
                  {errors.callType && (
                    <p style={errorStyle}>{errors.callType}</p>
                  )}
                </div>
              )}
              
              {/* Literature Title - only for Literature activity type */}
              {activityType === 'literature' && (
                <div style={{ marginBottom: '1rem', maxWidth: '100%' }}>
                  <label style={labelStyle}>
                    Literature Title
                  </label>
                  <input
                    type="text"
                    style={{...inputStyle, maxWidth: '100%', boxSizing: 'border-box'}}
                    value={literatureTitle}
                    onChange={(e) => setLiteratureTitle(e.target.value)}
                    placeholder="Enter title of the literature"
                  />
                  {errors.literatureTitle && (
                    <p style={errorStyle}>{errors.literatureTitle}</p>
                  )}
                </div>
              )}
              
              {/* Meeting Selection - only for Meeting activity type and not showing meeting form */}
              {activityType === 'meeting' && !showMeetingForm && (
                <div style={{ marginBottom: '1rem', maxWidth: '100%' }}>
                  <label style={labelStyle}>
                    Select Meeting
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem', maxWidth: '100%' }}>
                    <select
                      style={{...inputStyle, flex: 1, maxWidth: '100%', boxSizing: 'border-box'}}
                      value={selectedMeetingId}
                      onChange={handleMeetingSelect}
                    >
                      <option value="">Select a meeting or add new</option>
                      {meetings.map(meeting => (
                        <option key={meeting.id} value={meeting.id}>
                          {meeting.name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setShowMeetingForm(true)}
                      style={{
                        backgroundColor: darkMode ? '#1f2937' : '#f3f4f6',
                        color: darkMode ? '#60a5fa' : '#2563eb',
                        border: 'none',
                        borderRadius: '0.375rem',
                        padding: '0.5rem',
                        fontSize: '0.875rem',
                        cursor: 'pointer'
                      }}
                      title="Add New Meeting"
                    >
                      <i className="fas fa-plus"></i>
                    </button>
                  </div>
                </div>
              )}
              
              {/* Meeting Name - only for Meeting activity type and when no meeting is selected */}
              {activityType === 'meeting' && !showMeetingForm && !selectedMeetingId && (
                <div style={{ marginBottom: '1rem', maxWidth: '100%' }}>
                  <label style={labelStyle}>
                    Meeting Name
                  </label>
                  <input
                    type="text"
                    style={{...inputStyle, maxWidth: '100%', boxSizing: 'border-box'}}
                    value={meetingName}
                    onChange={(e) => setMeetingName(e.target.value)}
                    placeholder="Enter meeting name"
                  />
                  {errors.meetingName && (
                    <p style={errorStyle}>{errors.meetingName}</p>
                  )}
                </div>
              )}
              
              {/* Meeting Role Checkboxes - only for Meeting activity type and when not showing meeting form */}
              {activityType === 'meeting' && !showMeetingForm && (
                <div style={{ marginBottom: '1rem', maxWidth: '100%' }}>
                  <label style={labelStyle}>
                    Your Role
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '100%' }}>
                    <div style={checkboxStyle}>
                      <input
                        type="checkbox"
                        id="wasChair"
                        checked={wasChair}
                        onChange={() => setWasChair(!wasChair)}
                        style={{ marginRight: '0.5rem' }}
                      />
                      <label 
                        htmlFor="wasChair"
                        style={{
                          fontSize: '0.875rem',
                          color: darkMode ? '#e5e7eb' : '#4b5563'
                        }}
                      >
                        Chaired the meeting
                      </label>
                    </div>
                    <div style={checkboxStyle}>
                      <input
                        type="checkbox"
                        id="wasShare"
                        checked={wasShare}
                        onChange={() => setWasShare(!wasShare)}
                        style={{ marginRight: '0.5rem' }}
                      />
                      <label 
                        htmlFor="wasShare"
                        style={{
                          fontSize: '0.875rem',
                          color: darkMode ? '#e5e7eb' : '#4b5563'
                        }}
                      >
                        Shared during the meeting
                      </label>
                    </div>
                    <div style={checkboxStyle}>
                      <input
                        type="checkbox"
                        id="wasSpeaker"
                        checked={wasSpeaker}
                        onChange={() => setWasSpeaker(!wasSpeaker)}
                        style={{ marginRight: '0.5rem' }}
                      />
                      <label 
                        htmlFor="wasSpeaker"
                        style={{
                          fontSize: '0.875rem',
                          color: darkMode ? '#e5e7eb' : '#4b5563'
                        }}
                      >
                        Was the speaker
                      </label>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Notes - for all activity types */}
              <div style={{ marginBottom: '1rem', maxWidth: '100%' }}>
                <label style={labelStyle}>
                  Notes (Optional)
                </label>
                <textarea
                  style={{
                    ...inputStyle,
                    maxWidth: '100%',
                    boxSizing: 'border-box',
                    minHeight: '80px',
                    resize: 'vertical'
                  }}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any notes about this activity..."
                ></textarea>
              </div>
              
              <DialogActions sx={{ 
                justifyContent: 'flex-end', 
                gap: '8px',
                backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                borderTop: '1px solid',
                borderColor: darkMode ? '#374151' : '#e5e7eb',
                padding: '16px',
              }}>
                <Button 
                  onClick={onClose} 
                  variant="outlined"
                  color="inherit"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant="contained"
                  color="primary"
                  startIcon={<i className="fas fa-save"></i>}
                >
                  Save
                </Button>
              </DialogActions>
            </form>
          )}
        </DialogContent>
      </StyledDialog>
    </MuiThemeProvider>
  );
};

export default LogActivityModal;