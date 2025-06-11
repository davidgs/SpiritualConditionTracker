import React, { useState, useEffect } from 'react';
import TreeMeetingSchedule from './TreeMeetingSchedule';
import { useTheme } from '@mui/material/styles';
import { 
  TextField, 
  InputAdornment, 
  IconButton, 
  Button,
  Box,
  CircularProgress,
  Alert,
  Typography,
  Checkbox,
  FormControlLabel,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';

// Common TextField style to ensure consistent iOS-native styling
const getTextFieldStyle = (theme) => ({
  width: '100%',
  maxWidth: '100%',
  mb: 2,
  '& .MuiOutlinedInput-root': { 
    height: 56,
    borderRadius: 2,
    width: '100%',
    maxWidth: '100%',
    bgcolor: theme.palette.mode === 'dark' ? theme.palette.background.default : theme.palette.grey[50],
    '& fieldset': {
      borderColor: theme.palette.divider,
    },
    '&:hover fieldset': {
      borderColor: theme.palette.action.hover,
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main,
    }
  },
  '& .MuiOutlinedInput-input': {
    fontSize: 16,
    padding: '15px 14px',
    color: theme.palette.text.primary
  }
});

// Standalone meeting form component that can be embedded anywhere
export default function MeetingFormCore({ 
  meeting = null,
  onSave,
  onCancel,
  use24HourFormat = false,
  showButtons = true,
  className = ''
}) {
  // Get theme context
  const muiTheme = useTheme();
  const darkMode = muiTheme.palette.mode === 'dark';
  
  // Form state
  const [meetingName, setMeetingName] = useState('');
  
  // New structure to store day-time combinations
  const [meetingSchedule, setMeetingSchedule] = useState([
    // Each item will be {day: 'monday', time: '18:00'} format
  ]);
  
  // Address fields
  const [locationName, setLocationName] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  
  const [location, setLocation] = useState(null);
  const [error, setError] = useState('');
  const [searchingLocation, setSearchingLocation] = useState(false);
  const [isHomeGroup, setIsHomeGroup] = useState(false);
  const [onlineUrl, setOnlineUrl] = useState('');

  // Stepper state
  const [activeStep, setActiveStep] = useState(0);

  // Helper function to check if meeting schedule is complete
  const isScheduleComplete = () => {
    // Check if there's at least one complete meeting in the schedule
    return meetingSchedule.length > 0 && meetingSchedule.every(item => 
      item.day && item.time && item.format && item.locationType && item.access
    );
  };

  // Define steps for the stepper
  const steps = [
    {
      label: 'Name',
      description: 'Enter the name of your meeting',
      required: true
    },
    {
      label: 'Schedule',
      description: 'Set meeting days and times',
      required: true
    },
    {
      label: 'Location',
      description: 'Add meeting location details',
      required: true
    },
    {
      label: 'Details',
      description: 'Home group and online options',
      required: false
    }
  ];

  // Validation functions for each step
  const isStepComplete = (stepIndex) => {
    switch (stepIndex) {
      case 0: // Meeting Name
        return meetingName.trim().length > 0;
      case 1: // Schedule
        return meetingSchedule.length > 0;
      case 2: // Location
        return streetAddress.trim().length > 0 && city.trim().length > 0;
      case 3: // Additional Details
        return true; // This step is optional
      default:
        return false;
    }
  };

  // Check if all required steps are complete
  const isFormValid = () => {
    return steps.filter(step => step.required).every((step, index) => isStepComplete(index));
  };

  // Update active step based on form completion
  useEffect(() => {
    let nextActiveStep = 0;
    for (let i = 0; i < steps.length; i++) {
      if (isStepComplete(i)) {
        nextActiveStep = Math.min(i + 1, steps.length - 1);
      } else {
        break;
      }
    }
    setActiveStep(nextActiveStep);
  }, [meetingName, meetingSchedule, streetAddress, city]);

  // Initialize form with meeting data if provided
  useEffect(() => {
    if (meeting) {
      setMeetingName(meeting.name || '');
      setLocationName(meeting.locationName || '');
      setStreetAddress(meeting.streetAddress || '');
      setCity(meeting.city || '');
      setState(meeting.state || '');
      setZipCode(meeting.zipCode || '');
      setLocation(meeting.coordinates || null);
      setIsHomeGroup(meeting.isHomeGroup || false);
      setOnlineUrl(meeting.onlineUrl || '');
      
      // Handle schedule format
      if (meeting.schedule) {
        let scheduleArray = meeting.schedule;
        
        // Parse schedule if it's a JSON string (from SQLite storage)
        if (typeof meeting.schedule === 'string') {
          try {
            scheduleArray = JSON.parse(meeting.schedule);
          } catch (e) {
            console.warn('[MeetingFormCore] Failed to parse meeting schedule:', e);
            scheduleArray = [];
          }
        }
        
        // Ensure it's an array
        if (Array.isArray(scheduleArray)) {
          setMeetingSchedule(scheduleArray);
        } else {
          console.warn('[MeetingFormCore] Meeting schedule is not an array:', scheduleArray);
        }
      }
    }
  }, [meeting]);

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    
    if (!isFormValid()) {
      setError('Please complete all required fields before saving.');
      return;
    }
    
    // Construct address
    const formattedAddress = [
      streetAddress.trim(),
      city.trim(),
      state.trim(),
      zipCode.trim()
    ].filter(Boolean).join(', ');
    
    // Create arrays of unique days for backwards compatibility
    const uniqueDays = [...new Set(meetingSchedule.map(item => item.day))];
    
    // Use the first time in the schedule for backwards compatibility
    const firstTime = meetingSchedule.length > 0 ? meetingSchedule[0].time : '';
    
    // Extract meeting types for display
    const meetingTypes = [...new Set(meetingSchedule.map(item => item.type).filter(Boolean))];
    
    const meetingData = {
      // For editing existing meetings, keep their ID
      ...(meeting ? { id: meeting.id } : {}),
      name: meetingName.trim(),
      // For backward compatibility
      days: uniqueDays,
      time: firstTime,
      // New format
      schedule: meetingSchedule,
      // Store meeting types for easy access
      types: meetingTypes,
      address: formattedAddress,
      // Store the location name
      locationName: locationName.trim(),
      // Store individual address components for better editing
      streetAddress: streetAddress.trim(),
      city: city.trim(),
      state: state.trim(),
      zipCode: zipCode.trim(),
      coordinates: location,
      isHomeGroup: isHomeGroup,
      // Store online URL for virtual meetings
      onlineUrl: onlineUrl.trim(),
      createdAt: meeting ? meeting.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    try {
      console.log('[MeetingFormCore] Calling onSave with meeting data:', meetingData);
      
      if (onSave) {
        await onSave(meetingData);
        console.log('[MeetingFormCore] Meeting saved successfully');
      }
    } catch (error) {
      console.error('[MeetingFormCore] Error saving meeting:', error);
      setError('An error occurred while saving the meeting. Please try again.');
    }
  };

  return (
    <Box className={className}>
      <Typography variant="body2" sx={(theme) => ({ 
        mb: 2,
        color: theme.palette.text.secondary
      })}>
        Add details for your regular AA Group and meetings. Most meetings occur in the evenings, typically between 6-9 PM.
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {/* Compact horizontal stepper at the top */}
      <Box sx={{ mb: 3 }}>
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 2 }}>
          {steps.map((step, index) => (
            <Step key={step.label} completed={isStepComplete(index)}>
              <StepLabel 
                error={step.required && activeStep > index && !isStepComplete(index)}
                sx={{
                  '& .MuiStepLabel-label': {
                    fontSize: '0.75rem',
                    fontWeight: activeStep === index ? 600 : 400
                  }
                }}
              >
                {step.label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      <Box component="form" onSubmit={handleSubmit} noValidate sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 2, 
        mt: 1,
        width: '100%', 
        maxWidth: '100%',
        boxSizing: 'border-box',
        overflow: 'hidden'
      }}>
        <Box>
          <Box sx={{ color: muiTheme.palette.primary.main, fontSize: '14px', mb: '4px' }}>
            Group Name*
          </Box>
          <TextField
            value={meetingName}
            onChange={(e) => setMeetingName(e.target.value)}
            placeholder="Enter meeting name"
            size="medium"
            sx={(theme) => getTextFieldStyle(theme)}
          />
        </Box>
        
        {meetingName.trim() && (
          <Box>
            <Box sx={{ color: muiTheme.palette.text.secondary, fontSize: '14px', mb: '4px' }}>
              Meeting Schedule
            </Box>
            <TreeMeetingSchedule 
              schedule={meetingSchedule} 
              onChange={setMeetingSchedule}
              use24HourFormat={use24HourFormat}
              meetingName={meetingName}
            />
          </Box>
        )}
        
        {/* Show address fields for in-person and hybrid meetings */}
        {isScheduleComplete() && meetingSchedule.some(item => item.locationType === 'in_person' || item.locationType === 'hybrid') && (
          <Box>
            <Box sx={{ color: muiTheme.palette.text.secondary, fontSize: '14px', mb: '4px' }}>
              Location
            </Box>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="Location name (e.g. Apex United Methodist Church)"
                size="medium"
                sx={(theme) => ({
                  ...getTextFieldStyle(theme)
                })}
              />
            
            <TextField
              fullWidth
              value={streetAddress}
              onChange={(e) => setStreetAddress(e.target.value)}
              placeholder="Street address"
              size="medium"
              sx={(theme) => getTextFieldStyle(theme)}
            />
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City"
                size="medium"
                sx={(theme) => ({
                  ...getTextFieldStyle(theme),
                  flex: '2'
                })}
              />
              
              <TextField
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="State"
                size="medium"
                sx={(theme) => ({
                  ...getTextFieldStyle(theme),
                  flex: '1'
                })}
              />
              
              <TextField
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                placeholder="ZIP"
                size="medium"
                sx={(theme) => ({
                  ...getTextFieldStyle(theme),
                  flex: '1'
                })}
              />
            </Box>
          </Box>
        </Box>
        )}

        {/* Online URL Field - Show when any schedule item has online or hybrid location */}
        {isScheduleComplete() && meetingSchedule.some(item => item.locationType === 'online' || item.locationType === 'hybrid') && (
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
              Online Meeting URL
            </Typography>
            <TextField
              fullWidth
              value={onlineUrl}
              onChange={(e) => setOnlineUrl(e.target.value)}
              placeholder="https://zoom.us/j/123456789 or meeting platform URL"
              size="medium"
              sx={(theme) => getTextFieldStyle(theme)}
            />
            <Typography variant="body2" sx={{ mt: 0.5 }} color="text.secondary">
              Enter the URL participants will use to join the online meeting.
            </Typography>
          </Box>
        )}
        
        {/* Home Group Checkbox - Only show when schedule is complete */}
        {isScheduleComplete() && (
          <Box>
          <FormControlLabel
            control={
              <Checkbox
                checked={isHomeGroup}
                onChange={(e) => setIsHomeGroup(e.target.checked)}
                color="primary"
              />
            }
            label={
              <Typography component="span" sx={(theme) => ({ color: theme.palette.text.primary })}>
                This is my Home Group
              </Typography>
            }
          />
          <Typography variant="body2" sx={{ mt: 0.5, ml: 4 }} color="text.secondary">
            Your Home Group is your primary AA group where you regularly attend and participate.
          </Typography>
          </Box>
        )}

        {/* Action buttons */}
        {showButtons && (
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
            {onCancel && (
              <Button
                variant="contained"
                onClick={onCancel}
                color="error"
              >
                Cancel
              </Button>
            )}
            
            <Button
              variant="contained"
              type="submit"
              color="success"
              disabled={!isFormValid()}
              sx={{
                opacity: !isFormValid() ? 0.6 : 1,
                cursor: !isFormValid() ? 'not-allowed' : 'pointer'
              }}
            >
              Save
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
}