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
  FormControlLabel
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
            console.error('Failed to parse schedule JSON during editing:', e);
            scheduleArray = [];
          }
        }
        
        if (Array.isArray(scheduleArray) && scheduleArray.length > 0) {
          setMeetingSchedule(scheduleArray);
        } else {
          // Fallback to legacy format conversion
          setMeetingSchedule([]);
        }
      } else if (meeting.days && meeting.time) {
        // Convert legacy format
        let daysArray = meeting.days;
        
        // Parse days if it's a JSON string (from SQLite storage)  
        if (typeof meeting.days === 'string') {
          try {
            daysArray = JSON.parse(meeting.days);
          } catch (e) {
            console.error('Failed to parse days JSON during editing:', e);
            daysArray = [meeting.days]; // Treat as single day if parsing fails
          }
        }
        
        // Ensure it's an array
        if (!Array.isArray(daysArray)) {
          daysArray = [daysArray];
        }
        
        const schedule = daysArray.map(day => ({
          day: day.toLowerCase(),
          time: meeting.time,
          format: meeting.format || 'discussion', // Default format
          locationType: meeting.locationType || 'in_person',
          access: meeting.access || 'open' // Default access
        }));
        setMeetingSchedule(schedule);
      }
    }
  }, [meeting]);

  // Get current location
  const detectLocation = () => {
    setSearchingLocation(true);
    setError('');
    
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.');
      setSearchingLocation(false);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        setLocation(coords);
        setSearchingLocation(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        setError('Unable to retrieve your location. Please enter address manually.');
        setSearchingLocation(false);
      }
    );
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('[MeetingFormCore] Form submitted');
    setError('');
    
    if (!meetingName.trim()) {
      console.log('[MeetingFormCore] Validation failed: Missing meeting name');
      setError('Meeting name is required');
      return;
    }
    
    if (meetingSchedule.length === 0) {
      console.log('[MeetingFormCore] Validation failed: No schedule');
      setError('Please add at least one meeting day and time');
      return;
    }

    // Only validate online URL if explicitly marked as online/hybrid meeting
    const hasOnlineMeeting = meetingSchedule.some(item => item.locationType === 'online' || item.locationType === 'hybrid');
    
    if (hasOnlineMeeting && !onlineUrl.trim()) {
      setError('Meeting URL is required for online and hybrid meetings');
      return;
    }
    
    // Combine address fields for display and backwards compatibility
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
        Add details for your regular AA meeting. Most meetings occur in the evenings, typically between 6-9 PM.
      </Typography>
      
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 2 }}
        >
          {error}
        </Alert>
      )}
      
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
            Meeting Name*
          </Box>
          <TextField
            value={meetingName}
            onChange={(e) => setMeetingName(e.target.value)}
            placeholder="Enter meeting name"
            size="medium"
            margin="none"
            sx={(theme) => getTextFieldStyle(theme)}
          />
        </Box>
        
        <Box>
          <Box sx={{ color: muiTheme.palette.text.secondary, fontSize: '14px', mb: '4px' }}>
            Meeting Schedule
          </Box>
          <TreeMeetingSchedule 
            schedule={meetingSchedule} 
            onChange={setMeetingSchedule}
            use24HourFormat={use24HourFormat}
          />
        </Box>
        
        {/* Show address fields for in-person and hybrid meetings */}
        {meetingSchedule.some(item => item.locationType === 'in_person' || item.locationType === 'hybrid') && (
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
                margin="none"
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
              margin="none"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton 
                      onClick={detectLocation}
                      disabled={searchingLocation}
                      size="small"
                      sx={(theme) => ({ color: theme.palette.text.secondary })}
                    >
                      {searchingLocation ? (
                        <CircularProgress size={16} color="inherit" />
                      ) : (
                        <i className="fas fa-location-arrow" />
                      )}
                    </IconButton>
                  </InputAdornment>
                )
              }}
              sx={(theme) => ({
                ...getTextFieldStyle(theme)
              })}
            />
            
            <TextField
              fullWidth
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="City"
              size="medium"
              margin="none"
              sx={(theme) => ({
                ...getTextFieldStyle(theme)
              })}
            />
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="State"
                size="medium"
                margin="none"
                sx={(theme) => ({
                  width: '50%',
                  ...getTextFieldStyle(theme)
                })}
              />
              
              <TextField
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                placeholder="Zip code"
                size="medium"
                margin="none"
                sx={(theme) => ({
                  width: '50%',
                  ...getTextFieldStyle(theme)
                })}
              />
            </Box>
          </Box>
        </Box>
          )}

      {/* Online URL Field - Show when any schedule item has online or hybrid location */}
      {meetingSchedule.some(item => item.locationType === 'online' || item.locationType === 'hybrid') && (
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
      
      {/* Home Group Checkbox */}
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
          >
            Save
          </Button>
        </Box>
      )}
    </Box>
    </Box>
  );
}