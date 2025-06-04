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
  Divider,
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
export default function MeetingForm({ 
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
  
  // Legacy structure kept for compatibility
  const [meetingDays, setMeetingDays] = useState({
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
    sunday: false
  });
  const [meetingTime, setMeetingTime] = useState('');
  
  // Address fields
  const [locationName, setLocationName] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  
  // Store full address for backward compatibility
  const [meetingAddress, setMeetingAddress] = useState('');
  
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
      if (meeting.schedule && Array.isArray(meeting.schedule)) {
        setMeetingSchedule(meeting.schedule);
      } else if (meeting.days && meeting.time) {
        // Convert legacy format
        const days = Array.isArray(meeting.days) ? meeting.days : [meeting.days];
        const schedule = days.map(day => ({
          day: day.toLowerCase(),
          time: meeting.time,
          type: 'in-person',
          locationType: 'in-person'
        }));
        setMeetingSchedule(schedule);
      }
    }
  }, [meeting]);

  // Add a new schedule item
  const addScheduleItem = () => {
    setMeetingSchedule([...meetingSchedule, {
      day: 'monday',
      time: '19:00',
      type: 'in-person',
      locationType: 'in-person'
    }]);
  };

  // Remove a schedule item
  const removeScheduleItem = (index) => {
    setMeetingSchedule(meetingSchedule.filter((_, i) => i !== index));
  };

  // Update a schedule item
  const updateScheduleItem = (index, field, value) => {
    const updated = [...meetingSchedule];
    updated[index] = { ...updated[index], [field]: value };
    setMeetingSchedule(updated);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('[MeetingForm] Form submitted');
    setError('');
    
    if (!meetingName.trim()) {
      console.log('[MeetingForm] Validation failed: Missing meeting name');
      setError('Meeting name is required');
      return;
    }
    
    if (meetingSchedule.length === 0) {
      console.log('[MeetingForm] Validation failed: No schedule');
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
      console.log('[MeetingForm] Calling onSave with meeting data:', meetingData);
      
      if (onSave) {
        await onSave(meetingData);
        console.log('[MeetingForm] Meeting saved successfully');
      }
    } catch (error) {
      console.error('[MeetingForm] Error saving meeting:', error);
      setError('An error occurred while saving the meeting. Please try again.');
    }
  };

  const dayOptions = [
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
    { value: 'saturday', label: 'Saturday' },
    { value: 'sunday', label: 'Sunday' }
  ];

  const getTextFieldStyle = (theme) => ({
    '& .MuiOutlinedInput-root': {
      borderRadius: 2,
      backgroundColor: theme.palette.background.paper,
      '& fieldset': {
        borderColor: theme.palette.divider,
      },
      '&:hover fieldset': {
        borderColor: theme.palette.primary.main,
      },
      '&.Mui-focused fieldset': {
        borderColor: theme.palette.primary.main,
      },
    },
    '& .MuiInputBase-input': {
      color: theme.palette.text.primary,
    },
    '& .MuiInputLabel-root': {
      color: theme.palette.text.secondary,
    }
  });

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
        gap: 2
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
            fullWidth
            sx={getTextFieldStyle}
          />
        </Box>

        {/* Meeting Schedule Section */}
        <Box>
          <Box sx={{ color: muiTheme.palette.primary.main, fontSize: '14px', mb: '4px' }}>
            Meeting Schedule*
          </Box>
          
          {meetingSchedule.map((item, index) => (
            <Box key={index} sx={{ 
              display: 'flex', 
              gap: 1, 
              mb: 1, 
              alignItems: 'center',
              flexWrap: 'wrap'
            }}>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select
                  value={item.day}
                  onChange={(e) => updateScheduleItem(index, 'day', e.target.value)}
                  sx={getTextFieldStyle}
                >
                  {dayOptions.map(day => (
                    <MenuItem key={day.value} value={day.value}>
                      {day.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <TextField
                type="time"
                value={item.time}
                onChange={(e) => updateScheduleItem(index, 'time', e.target.value)}
                size="small"
                sx={{ ...getTextFieldStyle, minWidth: 120 }}
              />
              
              <FormControl size="small" sx={{ minWidth: 100 }}>
                <Select
                  value={item.locationType || 'in-person'}
                  onChange={(e) => updateScheduleItem(index, 'locationType', e.target.value)}
                  sx={getTextFieldStyle}
                >
                  <MenuItem value="in-person">In-Person</MenuItem>
                  <MenuItem value="online">Online</MenuItem>
                  <MenuItem value="hybrid">Hybrid</MenuItem>
                </Select>
              </FormControl>
              
              <Button 
                size="small" 
                color="error" 
                onClick={() => removeScheduleItem(index)}
                sx={{ minWidth: 'auto', px: 1 }}
              >
                Remove
              </Button>
            </Box>
          ))}
          
          <Button 
            variant="outlined" 
            size="small" 
            onClick={addScheduleItem}
            sx={{ mt: 1 }}
          >
            Add Day/Time
          </Button>
        </Box>

        {/* Location fields */}
        <Box>
          <Box sx={{ color: muiTheme.palette.primary.main, fontSize: '14px', mb: '4px' }}>
            Location Name
          </Box>
          <TextField
            value={locationName}
            onChange={(e) => setLocationName(e.target.value)}
            placeholder="e.g., Central Community Center"
            size="medium"
            margin="none"
            fullWidth
            sx={getTextFieldStyle}
          />
        </Box>

        <Box>
          <Box sx={{ color: muiTheme.palette.primary.main, fontSize: '14px', mb: '4px' }}>
            Street Address
          </Box>
          <TextField
            value={streetAddress}
            onChange={(e) => setStreetAddress(e.target.value)}
            placeholder="Enter street address"
            size="medium"
            margin="none"
            fullWidth
            sx={getTextFieldStyle}
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ color: muiTheme.palette.primary.main, fontSize: '14px', mb: '4px' }}>
              City
            </Box>
            <TextField
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="City"
              size="medium"
              margin="none"
              fullWidth
              sx={getTextFieldStyle}
            />
          </Box>
          
          <Box sx={{ width: '100px' }}>
            <Box sx={{ color: muiTheme.palette.primary.main, fontSize: '14px', mb: '4px' }}>
              State
            </Box>
            <TextField
              value={state}
              onChange={(e) => setState(e.target.value)}
              placeholder="State"
              size="medium"
              margin="none"
              fullWidth
              sx={getTextFieldStyle}
            />
          </Box>
          
          <Box sx={{ width: '100px' }}>
            <Box sx={{ color: muiTheme.palette.primary.main, fontSize: '14px', mb: '4px' }}>
              ZIP
            </Box>
            <TextField
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              placeholder="ZIP"
              size="medium"
              margin="none"
              fullWidth
              sx={getTextFieldStyle}
            />
          </Box>
        </Box>

        {/* Online URL for virtual meetings */}
        {meetingSchedule.some(item => item.locationType === 'online' || item.locationType === 'hybrid') && (
          <Box>
            <Box sx={{ color: muiTheme.palette.primary.main, fontSize: '14px', mb: '4px' }}>
              Meeting URL*
            </Box>
            <TextField
              value={onlineUrl}
              onChange={(e) => setOnlineUrl(e.target.value)}
              placeholder="https://zoom.us/j/..."
              size="medium"
              margin="none"
              fullWidth
              sx={getTextFieldStyle}
            />
          </Box>
        )}

        {/* Home Group toggle */}
        <FormControlLabel
          control={
            <Switch
              checked={isHomeGroup}
              onChange={(e) => setIsHomeGroup(e.target.checked)}
              color="primary"
            />
          }
          label="This is my home group"
          sx={{ color: muiTheme.palette.text.primary }}
        />

        {/* Action buttons */}
        {showButtons && (
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
            {onCancel && (
              <Button
                variant="outlined"
                onClick={onCancel}
                color="secondary"
              >
                Cancel
              </Button>
            )}
            
            <Button
              variant="contained"
              type="submit"
              color="primary"
            >
              Save Meeting
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
}