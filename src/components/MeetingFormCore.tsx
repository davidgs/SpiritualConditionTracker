import React, { useState, useEffect } from 'react';
import SimpleMeetingSchedule from './SimpleMeetingSchedule';
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
import LocationOnIcon from '@mui/icons-material/LocationOn';

interface MeetingFormCoreProps {
  meeting?: any;
  onSave: (meetingData: any) => void;
  onCancel: () => void;
  onClose?: () => void;
  isEdit?: boolean;
  darkMode?: boolean;
  use24HourFormat?: boolean;
  renderButtons?: (props: {
    onCancel: () => void;
    onSave: () => void;
    isValid: boolean;
    isSubmitting: boolean;
  }) => React.ReactNode;
  className?: string;
}

export default function MeetingFormCore({
  meeting = null,
  onSave,
  onCancel,
  onClose,
  isEdit = false,
  darkMode = false,
  use24HourFormat = false,
  renderButtons,
  className = ''
}: MeetingFormCoreProps) {
  // Form state
  const [meetingName, setMeetingName] = useState('');
  const [meetingSchedule, setMeetingSchedule] = useState([
    { day: 'monday', time: '18:00' }
  ]);
  
  // Address fields
  const [locationName, setLocationName] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [meetingAddress, setMeetingAddress] = useState('');
  
  const [location, setLocation] = useState(null);
  const [error, setError] = useState('');
  const [searchingLocation, setSearchingLocation] = useState(false);
  const [isHomeGroup, setIsHomeGroup] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with meeting data if provided
  useEffect(() => {
    if (!meeting) {
      setMeetingName('');
      setMeetingSchedule([{ day: 'monday', time: '18:00' }]);
      setMeetingAddress('');
      setLocationName('');
      setStreetAddress('');
      setCity('');
      setState('');
      setZipCode('');
      setLocation(null);
      setIsHomeGroup(false);
      setError('');
      return;
    }

    setMeetingName(meeting.name || '');
    
    // Handle schedule format
    if (meeting.schedule && Array.isArray(meeting.schedule) && meeting.schedule.length > 0) {
      setMeetingSchedule(meeting.schedule);
    } else if (meeting.days && meeting.time) {
      const newSchedule = meeting.days.map((day: string) => ({
        day,
        time: meeting.time
      }));
      setMeetingSchedule(newSchedule);
    }
    
    // Set address fields
    setMeetingAddress(meeting.address || '');
    setLocationName(meeting.locationName || '');
    setStreetAddress(meeting.streetAddress || '');
    setCity(meeting.city || '');
    setState(meeting.state || '');
    setZipCode(meeting.zipCode || '');
    setLocation(meeting.coordinates || null);
    setIsHomeGroup(meeting.isHomeGroup || false);
  }, [meeting]);

  // Helper function to update address fields
  const updateAddressFields = (addressData: any) => {
    const fullAddress = [
      addressData.streetAddress || addressData.street || addressData.road || '',
      addressData.city || addressData.town || addressData.village || '',
      addressData.state || addressData.county || '',
      addressData.zipCode || addressData.postcode || ''
    ].filter(Boolean).join(', ');
    
    setMeetingAddress(fullAddress);
    setStreetAddress(addressData.streetAddress || addressData.street || addressData.road || '');
    setCity(addressData.city || addressData.town || addressData.village || '');
    setState(addressData.state || addressData.county || '');
    setZipCode(addressData.zipCode || addressData.postcode || '');
  };

  // Auto-detect location
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
          
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          
          if (response.ok) {
            const data = await response.json();
            
            if (data.address) {
              const streetAddress = (data.address.house_number ? data.address.house_number + ' ' : '') + 
                                 (data.address.road || data.address.street || '');
              const city = data.address.city || data.address.town || data.address.village || '';
              
              const addressData = {
                streetAddress: streetAddress,
                city: city,
                state: data.address.state || data.address.county || '',
                zipCode: data.address.postcode || ''
              };
              
              updateAddressFields(addressData);
            } else if (data.display_name) {
              setMeetingAddress(data.display_name);
              const parts = data.display_name.split(',').map((part: string) => part.trim());
              if (parts.length >= 1) {
                setStreetAddress(parts[0]);
              }
            }
          }
        } catch (error) {
          console.error('Error getting address:', error);
        } finally {
          setSearchingLocation(false);
        }
      },
      (error) => {
        console.error('Error getting location:', error);
        setError('Unable to retrieve your location. Please enter address manually.');
        setSearchingLocation(false);
      }
    );
  };

  // Form validation
  const isValid = meetingName.trim() && meetingSchedule.length > 0 && streetAddress.trim();

  // Handle form submission
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    if (!isValid) {
      setError('Please fill in all required fields');
      setIsSubmitting(false);
      return;
    }
    
    try {
      // Combine address fields
      const formattedAddress = [
        streetAddress.trim(),
        city.trim(),
        state.trim(),
        zipCode.trim()
      ].filter(Boolean).join(', ');
      
      // Create arrays of unique days for backwards compatibility
      const uniqueDays = [...new Set(meetingSchedule.map(item => item.day))];
      const firstTime = meetingSchedule.length > 0 ? meetingSchedule[0].time : '';
      
      const meetingData = {
        ...(meeting ? { id: meeting.id } : {}),
        name: meetingName.trim(),
        days: uniqueDays,
        time: firstTime,
        schedule: meetingSchedule,
        address: formattedAddress,
        locationName: locationName.trim(),
        streetAddress: streetAddress.trim(),
        city: city.trim(),
        state: state.trim(),
        zipCode: zipCode.trim(),
        coordinates: location,
        isHomeGroup: isHomeGroup,
        createdAt: meeting ? meeting.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await onSave(meetingData);
      
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Error saving meeting:', error);
      setError('An error occurred while saving the meeting. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (onClose) {
      onClose();
    } else {
      onCancel();
    }
  };

  return (
    <Box className={className} sx={{ width: '100%', maxWidth: '100%' }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Box component="form" onSubmit={handleSubmit} sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 2,
        width: '100%'
      }}>
        {/* Meeting Name */}
        <Box>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
            Meeting Name*
          </Typography>
          <TextField
            fullWidth
            value={meetingName}
            onChange={(e) => setMeetingName(e.target.value)}
            placeholder="Enter meeting name"
            size="medium"
            required
          />
        </Box>
        
        {/* Meeting Schedule */}
        <Box>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
            Meeting Schedule
          </Typography>
          <SimpleMeetingSchedule 
            schedule={meetingSchedule} 
            onChange={setMeetingSchedule}
            darkMode={darkMode}
            use24HourFormat={use24HourFormat}
          />
        </Box>
        
        {/* Location */}
        <Box>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
            Location
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              placeholder="Location name (e.g. Apex United Methodist Church)"
              size="medium"
            />
            
            <TextField
              fullWidth
              value={streetAddress}
              onChange={(e) => setStreetAddress(e.target.value)}
              placeholder="Street address*"
              size="medium"
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={detectLocation}
                      disabled={searchingLocation}
                      size="small"
                    >
                      {searchingLocation ? (
                        <CircularProgress size={20} />
                      ) : (
                        <LocationOnIcon />
                      )}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            
            <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 1 }}>
              <TextField
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City"
                size="medium"
              />
              <TextField
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="State"
                size="medium"
              />
              <TextField
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                placeholder="Zip"
                size="medium"
              />
            </Box>
          </Box>
        </Box>
        
        {/* Home Group Checkbox */}
        <FormControlLabel
          control={
            <Checkbox
              checked={isHomeGroup}
              onChange={(e) => setIsHomeGroup(e.target.checked)}
              color="primary"
            />
          }
          label={
            <Box>
              <Typography variant="body2">
                This is my Home Group
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Your Home Group is your primary AA group where you regularly attend and participate.
              </Typography>
            </Box>
          }
        />
        
        {/* Buttons */}
        {renderButtons ? (
          renderButtons({
            onCancel: handleCancel,
            onSave: handleSubmit,
            isValid: Boolean(isValid),
            isSubmitting
          })
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
            <Button
              variant="contained"
              color="error"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="success"
              onClick={handleSubmit}
              disabled={!isValid || isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
}