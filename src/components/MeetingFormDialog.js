import React, { useState, useEffect } from 'react';
import SimpleMeetingSchedule from './SimpleMeetingSchedule';
import { useTheme } from '@mui/material/styles';
import { useAppTheme } from '../contexts/MuiThemeProvider';
import { 
  TextField, 
  InputAdornment, 
  IconButton, 
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  CircularProgress,
  Alert,
  Typography,
  Divider,
  Checkbox,
  FormControlLabel
} from '@mui/material';

export default function MeetingFormDialog({ 
  meeting = null, 
  onSave, 
  onClose,
  isEdit = false,
  open = true,
  use24HourFormat = false
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
  
  // Initialize form with meeting data if provided
  useEffect(() => {
    // If it's a new meeting, start with one schedule item
    if (!meeting) {
      setMeetingSchedule([{ day: 'monday', time: '18:00' }]);
      return;
    }
    
    if (meeting) {
      setMeetingName(meeting.name);
      
      // Check if this meeting has the new schedule format
      if (meeting.schedule && Array.isArray(meeting.schedule) && meeting.schedule.length > 0) {
        // Use the new schedule format
        setMeetingSchedule(meeting.schedule);
        
        // Also update legacy format for compatibility
        const days = {
          monday: false,
          tuesday: false,
          wednesday: false,
          thursday: false,
          friday: false,
          saturday: false,
          sunday: false
        };
        
        // Mark all days that appear in the schedule
        meeting.schedule.forEach(item => {
          if (item.day) {
            days[item.day] = true;
          }
        });
        
        setMeetingDays(days);
        
        // Set the time to the first schedule item's time for compatibility
        if (meeting.schedule[0].time) {
          setMeetingTime(meeting.schedule[0].time);
        }
      } else {
        // Use the legacy format
        const days = {
          monday: false,
          tuesday: false,
          wednesday: false,
          thursday: false,
          friday: false,
          saturday: false,
          sunday: false
        };
        
        meeting.days.forEach(day => {
          days[day] = true;
        });
        
        setMeetingDays(days);
        setMeetingTime(meeting.time);
        
        // Create schedule items from days and time
        const newSchedule = meeting.days.map(day => ({
          day,
          time: meeting.time
        }));
        
        setMeetingSchedule(newSchedule);
      }
      
      // Set full address
      setMeetingAddress(meeting.address);
      
      // Try to extract address components if available
      if (meeting.locationName) {
        setLocationName(meeting.locationName);
      }
      
      if (meeting.streetAddress) {
        setStreetAddress(meeting.streetAddress);
        setCity(meeting.city || '');
        setState(meeting.state || '');
        setZipCode(meeting.zipCode || '');
      } else {
        // Attempt to parse address components from full address
        try {
          const addressParts = meeting.address ? meeting.address.split(',').map(part => part.trim()) : [];
          
          if (addressParts.length >= 4) {
            // Assume the format is like: "Street, City, State, Zip"
            setStreetAddress(addressParts[0]);
            setCity(addressParts[1]);
            setState(addressParts[2]);
            setZipCode(addressParts[3]);
          }
        } catch (error) {
          console.error('[ MeetingFormDialog.js ] Error parsing address:', error);
          // Keep full address in first field as fallback
          setStreetAddress(meeting.address);
        }
      }
      
      setLocation(meeting.coordinates);
      
      // Set isHomeGroup if it exists in the meeting data
      setIsHomeGroup(meeting.isHomeGroup || false);
    }
  }, [meeting]);
  
  // Helper function to update address fields
  const updateAddressFields = (addressData) => {
    // Combine different address fields for backward compatibility
    const fullAddress = [
      addressData.streetAddress || addressData.street || addressData.road || '',
      addressData.city || addressData.town || addressData.village || '',
      addressData.state || addressData.county || '',
      addressData.zipCode || addressData.postcode || ''
    ].filter(Boolean).join(', ');
    
    setMeetingAddress(fullAddress);
    
    // Update individual fields
    setStreetAddress(addressData.streetAddress || addressData.street || addressData.road || '');
    setCity(addressData.city || addressData.town || addressData.village || '');
    setState(addressData.state || addressData.county || '');
    setZipCode(addressData.zipCode || addressData.postcode || '');
  };
  
  // Try to get user location
  const detectLocation = () => {
    setSearchingLocation(true);
    setError('');
    
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setSearchingLocation(false);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });
          
          // Try to get address from coordinates
          let response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          
          if (response.ok) {
            const data = await response.json();
            
            if (data.address) {
              // Process street address
              const streetAddress = (data.address.house_number ? data.address.house_number + ' ' : '') + 
                               (data.address.road || data.address.street || '');
              
              // For city, ONLY use actual city/town/village - don't use alternatives
              const city = data.address.city || data.address.town || data.address.village || '';
              
              const addressData = {
                streetAddress: streetAddress,
                city: city,  // This will be blank if no city/town/village is available
                state: data.address.state || data.address.county || '',
                zipCode: data.address.postcode || ''
              };
              
              // Update the form fields
              updateAddressFields(addressData);
            } else if (data.display_name) {
              // Fallback to display_name
              setMeetingAddress(data.display_name);
              
              // Extract just the street address from display_name if possible
              const parts = data.display_name.split(',').map(part => part.trim());
              
              if (parts.length >= 1) {
                setStreetAddress(parts[0]);
              }
              
              // Leave city blank as we can't reliably determine it
              
              // Try to get state from parts
              if (parts.length >= 3) {
                setState(parts[2]);
              }
              
              // Try to extract zip code
              const zipMatch = data.display_name.match(/\\b\\d{5}(?:-\\d{4})?\\b/);
              if (zipMatch) {
                setZipCode(zipMatch[0]);
              }
            }
          }
        } catch (error) {
          console.error('[ MeetingFormDialog.js ] Error getting address:', error);
        } finally {
          setSearchingLocation(false);
        }
      },
      (error) => {
        console.error('[ MeetingFormDialog.js ] Error getting location:', error);
        setError('Unable to retrieve your location. Please enter address manually.');
        setSearchingLocation(false);
      }
    );
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    if (!meetingName.trim()) {
      setError('Meeting name is required');
      return;
    }
    
    if (meetingSchedule.length === 0) {
      setError('Please add at least one meeting day and time');
      return;
    }
    
    if (!streetAddress.trim()) {
      setError('Street address is required');
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
    
    const meetingData = {
      // For editing existing meetings, keep their ID
      // For new meetings, let the database generate the ID with AUTOINCREMENT
      ...(meeting ? { id: meeting.id } : {}),
      name: meetingName.trim(),
      // For backward compatibility
      days: uniqueDays,
      time: firstTime,
      // New format
      schedule: meetingSchedule,
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
      createdAt: meeting ? meeting.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    try {
      // Call the onSave callback with the meeting data
      onSave(meetingData);
      
      // Close the dialog
      onClose();
    } catch (error) {
      console.error('[ MeetingFormDialog.js ] Error saving meeting:', error);
      setError('An error occurred while saving the meeting. Please try again.');
    }
  };
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm" // Increase from xs to sm for more width
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: darkMode ? '#1f2937' : 'white',
          color: darkMode ? '#d1d5db' : '#374151',
          borderRadius: 2,
          overflowX: 'hidden', // Prevent horizontal scrolling
          m: 1, // Add margin to prevent the dialog from touching the screen edges
          maxWidth: { xs: 'calc(100% - 16px)', sm: 'auto' } // Ensure proper mobile sizing
        }
      }}
    >
      <DialogTitle sx={{ 
        color: darkMode ? '#d1d5db' : '#374151',
        borderBottom: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
        pb: 1,
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}>
        <i className="fa-regular fa-calendar-plus mr-2 text-gray-400 dark:text-gray-500"></i>
        {isEdit ? 'Edit Meeting' : 'Add New Meeting'}
      </DialogTitle>
      
      <DialogContent sx={{ 
        py: 2,
        overflowX: 'hidden', // Prevent horizontal scroll within content area
        maxWidth: '100%', // Ensure content doesn't exceed dialog width
        '& .MuiFormControl-root': {
          maxWidth: '100%' // Ensure form controls don't exceed available width
        }
      }}>
        <Typography variant="body2" sx={{ 
          mb: 2,
          color: darkMode ? '#9ca3af' : '#4b5563'
        }}>
          Add details for your regular AA meeting. Most meetings occur in the evenings, typically between 6-9 PM.
        </Typography>
        
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 2, 
              bgcolor: darkMode ? 'rgba(220, 38, 38, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              color: darkMode ? '#fca5a5' : '#b91c1c'
            }}
          >
            {error}
          </Alert>
        )}
        
        <Box component="form" id="meeting-form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, color: darkMode ? '#d1d5db' : '#374151' }}>
              Meeting Name
            </Typography>
            <TextField
              fullWidth
              value={meetingName}
              onChange={(e) => setMeetingName(e.target.value)}
              placeholder="Enter meeting name"
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: darkMode ? '#374151' : '#f9fafb',
                  '& fieldset': {
                    borderColor: darkMode ? '#4b5563' : '#d1d5db',
                  },
                  '&:hover fieldset': {
                    borderColor: darkMode ? '#6b7280' : '#9ca3af',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: darkMode ? '#60a5fa' : '#3b82f6',
                  },
                },
                '& .MuiInputBase-input': {
                  color: darkMode ? '#d1d5db' : '#374151',
                }
              }}
            />
          </Box>
          
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, color: darkMode ? '#d1d5db' : '#374151' }}>
              Meeting Schedule
            </Typography>
            <SimpleMeetingSchedule 
              schedule={meetingSchedule} 
              onChange={setMeetingSchedule}
              darkMode={darkMode}
              use24HourFormat={use24HourFormat}
            />
          </Box>
          
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, color: darkMode ? '#d1d5db' : '#374151' }}>
              Location
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <TextField
                fullWidth
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="Location name (e.g. Apex United Methodist Church)"
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: darkMode ? '#374151' : '#f9fafb',
                    '& fieldset': {
                      borderColor: darkMode ? '#4b5563' : '#d1d5db',
                    },
                    '&:hover fieldset': {
                      borderColor: darkMode ? '#6b7280' : '#9ca3af',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: darkMode ? '#60a5fa' : '#3b82f6',
                    },
                  },
                  '& .MuiInputBase-input': {
                    color: darkMode ? '#d1d5db' : '#374151',
                  }
                }}
              />
              
              <TextField
                fullWidth
                value={streetAddress}
                onChange={(e) => setStreetAddress(e.target.value)}
                placeholder="Street address"
                size="small"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton 
                        onClick={detectLocation}
                        disabled={searchingLocation}
                        size="small"
                        sx={{ color: darkMode ? '#9ca3af' : '#6b7280' }}
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
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: darkMode ? '#374151' : '#f9fafb',
                    '& fieldset': {
                      borderColor: darkMode ? '#4b5563' : '#d1d5db',
                    },
                    '&:hover fieldset': {
                      borderColor: darkMode ? '#6b7280' : '#9ca3af',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: darkMode ? '#60a5fa' : '#3b82f6',
                    },
                  },
                  '& .MuiInputBase-input': {
                    color: darkMode ? '#d1d5db' : '#374151',
                  }
                }}
              />
              
              <TextField
                fullWidth
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City"
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: darkMode ? '#374151' : '#f9fafb',
                    '& fieldset': {
                      borderColor: darkMode ? '#4b5563' : '#d1d5db',
                    },
                    '&:hover fieldset': {
                      borderColor: darkMode ? '#6b7280' : '#9ca3af',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: darkMode ? '#60a5fa' : '#3b82f6',
                    },
                  },
                  '& .MuiInputBase-input': {
                    color: darkMode ? '#d1d5db' : '#374151',
                  }
                }}
              />
              
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="State"
                  size="small"
                  sx={{
                    width: '50%',
                    '& .MuiOutlinedInput-root': {
                      bgcolor: darkMode ? '#374151' : '#f9fafb',
                      '& fieldset': {
                        borderColor: darkMode ? '#4b5563' : '#d1d5db',
                      },
                      '&:hover fieldset': {
                        borderColor: darkMode ? '#6b7280' : '#9ca3af',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: darkMode ? '#60a5fa' : '#3b82f6',
                      },
                    },
                    '& .MuiInputBase-input': {
                      color: darkMode ? '#d1d5db' : '#374151',
                    }
                  }}
                />
                
                <TextField
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  placeholder="Zip code"
                  size="small"
                  sx={{
                    width: '50%',
                    '& .MuiOutlinedInput-root': {
                      bgcolor: darkMode ? '#374151' : '#f9fafb',
                      '& fieldset': {
                        borderColor: darkMode ? '#4b5563' : '#d1d5db',
                      },
                      '&:hover fieldset': {
                        borderColor: darkMode ? '#6b7280' : '#9ca3af',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: darkMode ? '#60a5fa' : '#3b82f6',
                      },
                    },
                    '& .MuiInputBase-input': {
                      color: darkMode ? '#d1d5db' : '#374151',
                    }
                  }}
                />
              </Box>
            </Box>
          </Box>
        </Box>
        
        {/* Home Group Checkbox */}
        <Box sx={{ mt: 3, mb: 1, px: 3 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={isHomeGroup}
                onChange={(e) => setIsHomeGroup(e.target.checked)}
                color="primary"
              />
            }
            label={
              <span style={{ color: darkMode ? "#d1d5db" : "#374151" }}>
                This is my Home Group
              </span>
            }
          />
          <Typography variant="body2" sx={{ mt: 0.5, ml: 4 }} color="text.secondary">
            Your Home Group is your primary AA group where you regularly attend and participate.
          </Typography>
        </Box>
      </DialogContent>
      
      <Divider sx={{ borderColor: darkMode ? '#374151' : '#e5e7eb' }} />
      
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          variant="contained"
          onClick={onClose}
          sx={{ 
            bgcolor: darkMode ? '#7f1d1d' : '#dc2626',
            color: '#ffffff',
            '&:hover': {
              bgcolor: darkMode ? '#991b1b' : '#b91c1c',
            }
          }}
        >
          Cancel
        </Button>
        
        <Button
          variant="contained"
          type="submit"
          form="meeting-form"
          sx={{ 
            bgcolor: darkMode ? '#166534' : '#16a34a',
            color: '#ffffff',
            '&:hover': {
              bgcolor: darkMode ? '#15803d' : '#22c55e',
            }
          }}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}