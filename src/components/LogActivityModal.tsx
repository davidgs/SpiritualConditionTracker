import React, { useState, useEffect } from 'react';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import { useTheme } from '@mui/material/styles';
import StyledDialog from './StyledDialog';
import MuiThemeProvider from '../contexts/MuiThemeProvider';
import MeetingFormDialog from './MeetingFormDialog';

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
  // Get theme context
  const muiTheme = useTheme();
  
  // Dark mode detection
  const darkMode = document.documentElement.classList.contains('dark');
  const [isDarkMode, setIsDarkMode] = useState(darkMode);
  
  // Activity form states
  const [activityType, setActivityType] = useState('prayer');
  const [duration, setDuration] = useState('15');
  const [date, setDate] = useState(getCurrentDateString());
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<{
    activityType?: string;
    duration?: string;
    date?: string;
    literatureTitle?: string;
    meetingName?: string;
    callType?: string;
  }>({});
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
    
    if (activityType === 'prayer' || activityType === 'meditation') {
      maxMinutes = 60; // 1 hour
      increment = 5; // 5 minute increments for prayer/meditation
    } else if (activityType === 'meeting') {
      maxMinutes = 150; // 2.5 hours
      increment = 30; // 30 minute increments
    } else if (activityType === 'sponsee' || activityType === 'service') {
      maxMinutes = 120; // 2 hours
    }
    
    for (let i = increment; i <= maxMinutes; i += increment) {
      options.push({
        value: i.toString(),
        label: `${i} minutes`
      });
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
   // console.log('[LogActivityModal:147] Submitting activity form...')
    // Validate form
    const newErrors = {};
    if (!activityType) newErrors.activityType = 'Activity type is required';
    if (!duration) newErrors.duration = 'Duration is required';
    if (!date) newErrors.date = 'Date is required';
    
    // Validate activity-specific fields
    if (activityType === 'literature' && !(literatureTitle || '').trim()) {
      newErrors.literatureTitle = 'Literature title is required';
    }
    
    if (activityType === 'meeting' && !showMeetingForm && !selectedMeetingId && !(meetingName || '').trim()) {
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
    
    // Create new activity object with core fields (let SQLite auto-generate the ID)
    const newActivity: any = {
      type: activityType,
      duration: parseInt(duration, 10),
      date: new Date(`${date}T12:00:00`).toISOString(), // Convert to full ISO format
      notes: (notes || '').trim(),
      location: 'completed', // Mark all logged activities as completed so they appear in the activity list
      // Initialize all database fields with defaults
      meetingName: '',
      meetingId: null,
      wasChair: 0,
      wasShare: 0,
      wasSpeaker: 0,
      literatureTitle: '',
      isSponsorCall: 0,
      isSponseeCall: 0,
      isAAMemberCall: 0,
      callType: '',
      stepNumber: null,
      personCalled: '',
      serviceType: '',
      completed: 1
    };
    
  //  console.log('[ LogActivityModal.tsx:179 handleSubmit ] Created activity with ISO date:', newActivity.date);
  //  console.log('[ LogActivityModal.tsx:180 handleSubmit ] Original date input:', date);
    
    // Add activity-specific fields
    if (activityType === 'literature') {
      newActivity.literatureTitle = (literatureTitle || '').trim();
    }
    
    if (activityType === 'meeting') {
      newActivity.meetingName = (meetingName || '').trim();
      newActivity.wasChair = wasChair ? 1 : 0;
      newActivity.wasShare = wasShare ? 1 : 0;
      newActivity.wasSpeaker = wasSpeaker ? 1 : 0;
      
      // Include meeting ID if one was selected
      if (selectedMeetingId) {
        newActivity.meetingId = parseInt(selectedMeetingId, 10);
      }
    }
    
    if (activityType === 'call') {
      newActivity.isSponsorCall = isSponsorCall ? 1 : 0;
      newActivity.isSponseeCall = isSponseeCall ? 1 : 0;
      newActivity.isAAMemberCall = isAAMemberCall ? 1 : 0;
      
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
    
    // Hide success message and close modal after 2 seconds
    setTimeout(() => {
      setShowSuccess(false);
      
      // Only close the dialog on success if it's not a meeting form
      if (!showMeetingForm) {
        resetForm();
        onClose(); // Auto-close the modal
      }
    }, 2000);
  };
  
  // Handle meeting selection
  function handleMeetingSelect(e) {
    const meetingId = e.target.value;
    setSelectedMeetingId(meetingId);
    
    if (meetingId) {
      // Convert to number for comparison since database IDs are integers
      const meetingIdNum = parseInt(meetingId, 10);
      const meeting = meetings.find(m => m.id === meetingIdNum);
      // console.log('LogActivityModal - Meeting selection:', { meetingId, meetingIdNum, meeting, availableMeetings: meetings });
      if (meeting) {
        setMeetingName(meeting.name);
      //  console.log('LogActivityModal - Set meeting name to:', meeting.name);
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
                backgroundColor: theme.palette.success.light,
                color: theme.palette.success.dark,
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
            <MeetingFormDialog
              open={showMeetingForm}
              onSave={handleSaveMeeting}
              onClose={() => setShowMeetingForm(false)}
              isEdit={false}
            />
          ) : (
            <form onSubmit={handleSubmit}>
              {/* Activity Type */}
              <Box sx={{ marginBottom: '0.5rem', maxWidth: '100%' }}>
                <TextField
                  select
                  fullWidth
                  label="Activity Type"
                  value={activityType}
                  onChange={(e) => setActivityType(e.target.value)}
                  error={!!errors.activityType}
                  helperText={errors.activityType}
                  variant="outlined"
                  InputProps={{
                    sx: {
                      height: '56px'
                    }
                  }}
                  sx={{
                    mb: 1,
                    "sx={getTextFieldStyle()} .MuiOutlinedInput-root": {
                      height: 56,
                      borderRadius: 2
                    },
                    "sx={getTextFieldStyle()} .MuiOutlinedInput-input": {
                      fontSize: 16,
                      padding: "15px 14px"
                    }
                  }}
                >
                  <MenuItem value="prayer">Prayer</MenuItem>
                  <MenuItem value="meditation">Meditation</MenuItem>
                  <MenuItem value="literature">Reading Literature</MenuItem>
                  <MenuItem value="service">Service Work</MenuItem>
                  <MenuItem value="call">Call</MenuItem>
                  <MenuItem value="meeting">AA Meeting</MenuItem>
                </TextField>
              </Box>
              
              {/* Duration dropdown */}
              <Box sx={{ marginBottom: '0.5rem', maxWidth: '100%' }}>
                <TextField
                  select
                  fullWidth
                  label="Duration"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  error={!!errors.duration}
                  helperText={errors.duration}
                  variant="outlined"
                  InputProps={{
                    sx: {
                      height: '56px'
                    }
                  }}
                  sx={{
                    mb: 1,
                    "sx={getTextFieldStyle()} .MuiOutlinedInput-root": {
                      height: 56,
                      borderRadius: 2
                    },
                    "sx={getTextFieldStyle()} .MuiOutlinedInput-input": {
                      fontSize: 16,
                      padding: "15px 14px"
                    }
                  }}
                >
                  {getDurationOptions().map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
              
              {/* Date picker */}
              <Box sx={{ marginBottom: '0.5rem', maxWidth: '100%' }}>
                <TextField
                  fullWidth
                  type="date"
                  label="Date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  error={!!errors.date}
                  helperText={errors.date}
                  variant="outlined"
                  InputProps={{
                    sx: {
                      height: '56px'
                    }
                  }}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  sx={{
                    mb: 1,
                    "sx={getTextFieldStyle()} .MuiOutlinedInput-root": {
                      height: 56,
                      borderRadius: 2
                    },
                    "sx={getTextFieldStyle()} .MuiOutlinedInput-input": {
                      fontSize: 16,
                      padding: "15px 14px"
                    }
                  }}
                />
              </Box>
              
              {/* Literature-specific fields */}
              {activityType === 'literature' && (
                <Box sx={{ marginBottom: '1rem', maxWidth: '100%' }}>
                  <TextField
                    fullWidth
                    label="Literature Title"
                    value={literatureTitle}
                    onChange={(e) => setLiteratureTitle(e.target.value)}
                    placeholder="e.g., Big Book, 12x12, Daily Reflections"
                    error={!!errors.literatureTitle}
                    helperText={errors.literatureTitle}
                    variant="outlined"
                    InputProps={{
                      sx: {
                        height: '56px'
                      }
                    }}
                    sx={{
                    mb: 2,
                    "sx={getTextFieldStyle()} .MuiOutlinedInput-root": {
                      height: 56,
                      borderRadius: 2
                    },
                    "sx={getTextFieldStyle()} .MuiOutlinedInput-input": {
                      fontSize: 16,
                      padding: "15px 14px"
                    }
                  }}
                  />
                </Box>
              )}
              
              {/* Meeting-specific fields */}
              {activityType === 'meeting' && !showMeetingForm && (
                <>
                  <Box sx={{ marginBottom: '0.5rem', maxWidth: '100%' }}>
                    <Box 
                      component="label"
                      sx={(theme) => ({
                        display: 'block',
                        fontSize: '1rem',
                        fontWeight: '500',
                        marginBottom: '0.125rem',
                        color: theme.palette.text.secondary
                      })}
                    >
                      Select Meeting
                    </Box>
                    <Box 
                      component="select"
                      value={selectedMeetingId}
                      onChange={handleMeetingSelect}
                      InputProps={{
                        sx: {
                          height: '56px'
                        }
                      }}
                      sx={{
                    mb: 2,
                    "sx={getTextFieldStyle()} .MuiOutlinedInput-root": {
                      height: 56,
                      borderRadius: 2
                    },
                    "sx={getTextFieldStyle()} .MuiOutlinedInput-input": {
                      fontSize: 16,
                      padding: "10px 14px"
                    }
                  }}
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
                        marginTop: '0.25rem'
                      }}
                    >
                      <Button 
                        variant="text" 
                        onClick={() => setShowMeetingForm(true)}
                        sx={(theme) => ({
                          fontSize: '1rem',
                          color: theme.palette.primary.main
                        })}
                      >
                        + Add New Meeting
                      </Button>
                    </Box>
                  </Box>
                  
                  {/* Meeting Name field - only show if no meeting selected from dropdown */}
                  {!selectedMeetingId && (
                    <Box sx={{ marginBottom: '0.5rem', maxWidth: '100%' }}>
                      <TextField
                        fullWidth
                        label="Meeting Name"
                        value={meetingName || ''}
                        onChange={(e) => {
                          const inputValue = e.target.value;
                          setMeetingName(inputValue);
                          
                          // Try to match existing meeting by name
                          if (inputValue.trim()) {
                            const matchingMeeting = meetings.find(m => 
                              m.name.toLowerCase() === inputValue.toLowerCase()
                            );
                            if (matchingMeeting) {
                              setSelectedMeetingId(matchingMeeting.id);
                              setMeetingName(matchingMeeting.name);
                            }
                          }
                        }}
                        placeholder="Enter meeting name"
                        error={!!errors.meetingName}
                        helperText={errors.meetingName}
                        variant="outlined"
                        InputProps={{
                          sx: {
                            height: '56px'
                          }
                        }}
                        sx={{
                    mb: 2,
                    "sx={getTextFieldStyle()} .MuiOutlinedInput-root": {
                      height: 56,
                      borderRadius: 2
                    },
                    "sx={getTextFieldStyle()} .MuiOutlinedInput-input": {
                      fontSize: 16,
                      padding: "15px 14px"
                    }
                  }}
                      />
                    </Box>
                  )}
                  
                  {/* Meeting participation checkboxes */}
                  <Box sx={{ marginBottom: '0.5rem' }}>
                    <Box 
                      component="p"
                      sx={(theme) => ({
                        fontSize: '1.25rem',
                        fontWeight: '500',
                        marginBottom: '0.25rem',
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
                            fontSize: '1rem',
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
                            fontSize: '1rem',
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
                            fontSize: '1rem',
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
                <Box sx={{ marginBottom: '0.5rem' }}>
                  <Box 
                    component="p"
                    sx={(theme) => ({
                      fontSize: '1.25rem',
                      fontWeight: '500',
                      marginBottom: '0.25rem',
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
                          fontSize: '1rem',
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
                          fontSize: '1rem',
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
                          fontSize: '1rem',
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
              <Box sx={{ marginBottom: '0.5rem', maxWidth: '100%' }}>
                <TextField
                  fullWidth
                  label="Notes (optional)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Enter any notes about this activity..."
                  multiline
                  rows={3}
                  variant="outlined"
                  sx={{
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2
                    },
                    '& .MuiOutlinedInput-input': {
                      fontSize: 16,
                      padding: '15px 14px'
                    }
                  }}
                />
              </Box>
              
              <DialogActions sx={{ justifyContent: 'flex-end', padding: '8px 0' }}>
                <Button onClick={onClose} 
                  size="small"
                  variant="contained"
                  color="error">
                  Cancel
                </Button>
                <Button type="submit" variant="contained" size="small" color="success">
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