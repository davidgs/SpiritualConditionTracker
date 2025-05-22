import React, { useState, useEffect } from 'react';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import StyledDialog from './StyledDialog';
import MuiThemeProvider from '../contexts/MuiThemeProvider';
import MeetingForm from './MeetingForm';

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
  
  // Get common text field styles for consistency
  const getTextFieldStyle = (theme) => ({
    width: '95%', // Slightly smaller to prevent focus border overflow
    padding: '0.5rem 0.75rem',
    borderRadius: '0.375rem',
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    border: `1px solid ${theme.palette.mode === 'dark' ? theme.palette.grey[700] : theme.palette.grey[300]}`,
    fontSize: '0.875rem',
    boxSizing: 'border-box'
  });
  
  return (
    <MuiThemeProvider>
      <StyledDialog
        open={open}
        onClose={onClose}
        aria-labelledby="log-activity-dialog-title"
        maxWidth="sm"
        PaperProps={{
          style: { 
            overflowX: 'hidden',
            width: '90%',
            maxWidth: '450px'
          }
        }}
      >
        <DialogTitle 
          id="log-activity-dialog-title"
          sx={(theme) => ({
            backgroundColor: theme.palette.background.default,
            color: theme.palette.text.primary,
            borderBottom: '1px solid',
            borderColor: theme.palette.divider,
          })}
        >
          Log New Activity
        </DialogTitle>
        
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={(theme) => ({
            position: 'absolute',
            right: 8,
            top: 8,
            color: theme.palette.text.secondary,
          })}
        >
          <CloseIcon />
        </IconButton>
        
        <DialogContent dividers>
          {/* Success message */}
          {showSuccess && (
            <Box
              sx={(theme) => ({
                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(6, 78, 59, 0.8)' : 'rgba(209, 250, 229, 0.8)',
                color: theme.palette.mode === 'dark' ? '#6ee7b7' : '#065f46',
                padding: '0.75rem',
                borderRadius: '0.375rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
                fontWeight: '500',
                fontSize: '0.875rem'
              })}
            >
              Activity saved successfully!
            </Box>
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
              <Box sx={{ marginBottom: '1rem', maxWidth: '100%' }}>
                <Box 
                  component="label"
                  sx={(theme) => ({
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    marginBottom: '0.25rem',
                    color: theme.palette.text.secondary
                  })}
                >
                  Activity Type
                </Box>
                <Box 
                  component="select"
                  value={activityType}
                  onChange={(e) => setActivityType(e.target.value)}
                  sx={(theme) => getTextFieldStyle(theme)}
                >
                  <option value="prayer">Prayer</option>
                  <option value="meditation">Meditation</option>
                  <option value="literature">Reading Literature</option>
                  <option value="service">Service Work</option>
                  <option value="call">Call</option>
                  <option value="meeting">AA Meeting</option>
                </Box>
                {errors.activityType && (
                  <Box 
                    component="p" 
                    sx={(theme) => ({
                      color: theme.palette.error.main,
                      fontSize: '0.75rem',
                      marginTop: '0.25rem'
                    })}
                  >
                    {errors.activityType}
                  </Box>
                )}
              </Box>
              
              {/* Duration dropdown */}
              <Box sx={{ marginBottom: '1rem', maxWidth: '100%' }}>
                <Box 
                  component="label"
                  sx={(theme) => ({
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    marginBottom: '0.25rem',
                    color: theme.palette.text.secondary
                  })}
                >
                  Duration
                </Box>
                <Box 
                  component="select"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  sx={(theme) => getTextFieldStyle(theme)}
                >
                  {getDurationOptions()}
                </Box>
                {errors.duration && (
                  <Box 
                    component="p" 
                    sx={(theme) => ({
                      color: theme.palette.error.main,
                      fontSize: '0.75rem',
                      marginTop: '0.25rem'
                    })}
                  >
                    {errors.duration}
                  </Box>
                )}
              </Box>
              
              {/* Date picker */}
              <Box sx={{ marginBottom: '1rem', maxWidth: '100%' }}>
                <Box 
                  component="label"
                  sx={(theme) => ({
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    marginBottom: '0.25rem',
                    color: theme.palette.text.secondary
                  })}
                >
                  Date
                </Box>
                <Box 
                  component="input"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  sx={(theme) => getTextFieldStyle(theme)}
                />
                {errors.date && (
                  <Box 
                    component="p" 
                    sx={(theme) => ({
                      color: theme.palette.error.main,
                      fontSize: '0.75rem',
                      marginTop: '0.25rem'
                    })}
                  >
                    {errors.date}
                  </Box>
                )}
              </Box>
              
              {/* Literature-specific fields */}
              {activityType === 'literature' && (
                <Box sx={{ marginBottom: '1rem', maxWidth: '100%' }}>
                  <Box 
                    component="label"
                    sx={(theme) => ({
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      marginBottom: '0.25rem',
                      color: theme.palette.text.secondary
                    })}
                  >
                    Literature Title
                  </Box>
                  <Box 
                    component="input"
                    type="text"
                    value={literatureTitle}
                    onChange={(e) => setLiteratureTitle(e.target.value)}
                    placeholder="e.g., Big Book, 12x12, Daily Reflections"
                    sx={(theme) => getTextFieldStyle(theme)}
                  />
                  {errors.literatureTitle && (
                    <Box 
                      component="p" 
                      sx={(theme) => ({
                        color: theme.palette.error.main,
                        fontSize: '0.75rem',
                        marginTop: '0.25rem'
                      })}
                    >
                      {errors.literatureTitle}
                    </Box>
                  )}
                </Box>
              )}
              
              {/* Meeting-specific fields */}
              {activityType === 'meeting' && !showMeetingForm && (
                <>
                  <Box sx={{ marginBottom: '1rem', maxWidth: '100%' }}>
                    <Box 
                      component="label"
                      sx={(theme) => ({
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        marginBottom: '0.25rem',
                        color: theme.palette.text.secondary
                      })}
                    >
                      Select Meeting
                    </Box>
                    <Box 
                      component="select"
                      value={selectedMeetingId}
                      onChange={handleMeetingSelect}
                      sx={(theme) => getTextFieldStyle(theme)}
                    >
                      <option value="">-- Select a saved meeting --</option>
                      {meetings.map(meeting => (
                        <option key={meeting.id} value={meeting.id}>
                          {meeting.name}
                        </option>
                      ))}
                    </Box>
                    
                    <Box 
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: '0.5rem'
                      }}
                    >
                      <Button 
                        variant="text" 
                        onClick={() => setShowMeetingForm(true)}
                        sx={(theme) => ({
                          fontSize: '0.75rem',
                          color: theme.palette.primary.main
                        })}
                      >
                        + Add New Meeting
                      </Button>
                    </Box>
                  </Box>
                  
                  <Box sx={{ marginBottom: '1rem', maxWidth: '100%' }}>
                    <Box 
                      component="label"
                      sx={(theme) => ({
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        marginBottom: '0.25rem',
                        color: theme.palette.text.secondary
                      })}
                    >
                      Meeting Name
                    </Box>
                    <Box 
                      component="input"
                      type="text"
                      value={meetingName}
                      onChange={(e) => setMeetingName(e.target.value)}
                      placeholder="Enter meeting name"
                      sx={(theme) => getTextFieldStyle(theme)}
                    />
                    {errors.meetingName && (
                      <Box 
                        component="p" 
                        sx={(theme) => ({
                          color: theme.palette.error.main,
                          fontSize: '0.75rem',
                          marginTop: '0.25rem'
                        })}
                      >
                        {errors.meetingName}
                      </Box>
                    )}
                  </Box>
                  
                  {/* Meeting participation checkboxes */}
                  <Box sx={{ marginBottom: '1rem' }}>
                    <Box 
                      component="p"
                      sx={(theme) => ({
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        marginBottom: '0.5rem',
                        color: theme.palette.text.secondary
                      })}
                    >
                      Participation (optional)
                    </Box>
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box 
                          component="input"
                          type="checkbox"
                          id="was-chair"
                          checked={wasChair}
                          onChange={(e) => setWasChair(e.target.checked)}
                        />
                        <Box 
                          component="label"
                          htmlFor="was-chair"
                          sx={(theme) => ({
                            marginLeft: '0.5rem',
                            fontSize: '0.875rem',
                            color: theme.palette.text.primary
                          })}
                        >
                          I chaired the meeting
                        </Box>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box 
                          component="input"
                          type="checkbox"
                          id="was-share"
                          checked={wasShare}
                          onChange={(e) => setWasShare(e.target.checked)}
                        />
                        <Box 
                          component="label"
                          htmlFor="was-share"
                          sx={(theme) => ({
                            marginLeft: '0.5rem',
                            fontSize: '0.875rem',
                            color: theme.palette.text.primary
                          })}
                        >
                          I shared during the meeting
                        </Box>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box 
                          component="input"
                          type="checkbox"
                          id="was-speaker"
                          checked={wasSpeaker}
                          onChange={(e) => setWasSpeaker(e.target.checked)}
                        />
                        <Box 
                          component="label"
                          htmlFor="was-speaker"
                          sx={(theme) => ({
                            marginLeft: '0.5rem',
                            fontSize: '0.875rem',
                            color: theme.palette.text.primary
                          })}
                        >
                          I was the speaker
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </>
              )}
              
              {/* Call-specific fields */}
              {activityType === 'call' && (
                <Box sx={{ marginBottom: '1rem' }}>
                  <Box 
                    component="p"
                    sx={(theme) => ({
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      marginBottom: '0.5rem',
                      color: theme.palette.text.secondary
                    })}
                  >
                    Call Type
                  </Box>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box 
                        component="input"
                        type="checkbox"
                        id="sponsor-call"
                        checked={isSponsorCall}
                        onChange={(e) => setIsSponsorCall(e.target.checked)}
                      />
                      <Box 
                        component="label"
                        htmlFor="sponsor-call"
                        sx={(theme) => ({
                          marginLeft: '0.5rem',
                          fontSize: '0.875rem',
                          color: theme.palette.text.primary
                        })}
                      >
                        Call with my sponsor
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box 
                        component="input"
                        type="checkbox"
                        id="sponsee-call"
                        checked={isSponseeCall}
                        onChange={(e) => setIsSponseeCall(e.target.checked)}
                      />
                      <Box 
                        component="label"
                        htmlFor="sponsee-call"
                        sx={(theme) => ({
                          marginLeft: '0.5rem',
                          fontSize: '0.875rem',
                          color: theme.palette.text.primary
                        })}
                      >
                        Call with my sponsee
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box 
                        component="input"
                        type="checkbox"
                        id="aa-member-call"
                        checked={isAAMemberCall}
                        onChange={(e) => setIsAAMemberCall(e.target.checked)}
                      />
                      <Box 
                        component="label"
                        htmlFor="aa-member-call"
                        sx={(theme) => ({
                          marginLeft: '0.5rem',
                          fontSize: '0.875rem',
                          color: theme.palette.text.primary
                        })}
                      >
                        Call with another AA member
                      </Box>
                    </Box>
                  </Box>
                  
                  {errors.callType && (
                    <Box 
                      component="p" 
                      sx={(theme) => ({
                        color: theme.palette.error.main,
                        fontSize: '0.75rem',
                        marginTop: '0.5rem'
                      })}
                    >
                      {errors.callType}
                    </Box>
                  )}
                </Box>
              )}
              
              {/* Notes field */}
              <Box sx={{ marginBottom: '1rem', maxWidth: '100%' }}>
                <Box 
                  component="label"
                  sx={(theme) => ({
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    marginBottom: '0.25rem',
                    color: theme.palette.text.secondary
                  })}
                >
                  Notes (optional)
                </Box>
                <Box 
                  component="textarea"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Enter any notes about this activity..."
                  rows={3}
                  sx={(theme) => ({
                    width: '98%', // Slightly smaller to prevent focus border from causing overflow
                    padding: '0.75rem',
                    borderRadius: '0.375rem',
                    backgroundColor: theme.palette.background.paper,
                    color: theme.palette.text.primary,
                    border: `1px solid ${theme.palette.mode === 'dark' ? theme.palette.grey[700] : theme.palette.grey[300]}`,
                    fontSize: '0.875rem',
                    resize: 'vertical',
                    minHeight: '5rem',
                    boxSizing: 'border-box'
                  })}
                />
              </Box>
              
              <DialogActions sx={{ justifyContent: 'flex-end', padding: '8px 0' }}>
                <Button onClick={onClose} color="inherit">
                  Cancel
                </Button>
                <Button type="submit" variant="contained" color="primary">
                  Save Activity
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