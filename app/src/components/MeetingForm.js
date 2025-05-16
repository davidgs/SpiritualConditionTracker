import React, { useState, useEffect, useRef } from 'react';
import SimpleMeetingSchedule from './SimpleMeetingSchedule';
import { TextField, InputAdornment, IconButton } from '@mui/material';

export default function MeetingForm({ 
  meeting = null, 
  onSave, 
  onCancel,
  isOverlay = true
}) {
  // Tooltip state
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipRef = useRef(null);
  
  // Close tooltip when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target)) {
        setShowTooltip(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
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
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  
  // Store full address for backward compatibility
  const [meetingAddress, setMeetingAddress] = useState('');
  
  const [location, setLocation] = useState(null);
  const [error, setError] = useState('');
  const [searchingLocation, setSearchingLocation] = useState(false);
  
  // Dark mode detection
  const darkMode = document.documentElement.classList.contains('dark');
  
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
      if (meeting.streetAddress) {
        setStreetAddress(meeting.streetAddress);
        setCity(meeting.city || '');
        setState(meeting.state || '');
        setZipCode(meeting.zipCode || '');
      } else {
        // Attempt to parse address components from full address
        try {
          const addressParts = meeting.address.split(',').map(part => part.trim());
          
          if (addressParts.length >= 4) {
            // Assume the format is like: "Street, City, State, Zip"
            setStreetAddress(addressParts[0]);
            setCity(addressParts[1]);
            setState(addressParts[2]);
            setZipCode(addressParts[3]);
          }
        } catch (error) {
          console.error('Error parsing address:', error);
          // Keep full address in first field as fallback
          setStreetAddress(meeting.address);
        }
      }
      
      setLocation(meeting.coordinates);
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
    
    console.log('Setting street address to:', addressData.streetAddress);
    console.log('Setting city to:', addressData.city);
    
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
          // First try GeoJSON format, which provides more structured data
          console.log('Making request to Nominatim with GeoJSON format');
          let response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=geojson`
          );
          
          // If GeoJSON fails for some reason, fall back to regular JSON format
          if (!response.ok) {
            console.log('GeoJSON request failed, falling back to JSON format');
            response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
            );
          }
          
          if (response.ok) {
            const data = await response.json();
            console.log('Response data:', data);
            
            // Determine if we're dealing with GeoJSON or regular JSON format
            const isGeoJson = data.type === 'FeatureCollection' && data.features;
            
            if (isGeoJson && data.features.length > 0) {
              // Process as GeoJSON
              console.log('Processing as GeoJSON');
              const properties = data.features[0].properties;
              console.log('GeoJSON properties:', properties);
              
              if (properties.address) {
                // Extract address components from GeoJSON properties
                // Process street address (always include house number and street when available)
                const streetAddress = (properties.address.house_number ? properties.address.house_number + ' ' : '') + 
                                     (properties.address.road || properties.address.street || '');
                
                // For city, ONLY use actual city/town/village - don't use alternatives like neighborhood
                // This will leave city blank when a proper city name isn't available
                const city = properties.address.city || properties.address.town || properties.address.village || '';
                
                // Log whether we found a city or not
                if (!city) {
                  console.log('No city/town/village found in the address data');
                  console.log('Available address fields:', Object.keys(properties.address));
                }
                
                const addressData = {
                  streetAddress: streetAddress,
                  city: city,  // This will be blank if no city/town/village is available
                  state: properties.address.state || properties.address.county || '',
                  zipCode: properties.address.postcode || ''
                };
                
                console.log('Extracted address data from GeoJSON:', addressData);
                
                // Update the form fields
                updateAddressFields(addressData);
              } else if (properties.display_name) {
                // Fallback to display_name
                console.log('Using GeoJSON display_name fallback:', properties.display_name);
                setMeetingAddress(properties.display_name);
                
                // More sophisticated parsing of display_name
                const parts = properties.display_name.split(',').map(part => part.trim());
                console.log('GeoJSON display name parts:', parts);
                
                // Try to extract meaningful address components
                // First part usually contains house number and street
                if (parts.length >= 1) {
                  setStreetAddress(parts[0]);
                }
                
                // We'll leave city blank in the fallback mode, as we can't reliably determine
                // if the second part is actually a city or some other location entity
                // This will prompt the user to manually fill in the city if needed
                console.log('Leaving city field blank in fallback mode - cannot reliably determine city from display_name');
                
                // Third part might be county or state 
                if (parts.length >= 3) {
                  setState(parts[2]);
                }
                
                // Fourth part could be postal code or country
                if (parts.length >= 4) {
                  // Check if it looks like a postal code (mostly numbers)
                  const isPostalCode = /\d/.test(parts[3]);
                  if (isPostalCode) {
                    setZipCode(parts[3]);
                  } else if (parts.length >= 5) {
                    // Try the fifth part if fourth doesn't look like a postal code
                    setZipCode(parts[4]);
                  }
                }
              }
            } else if (data.address) {
              // Process as regular JSON
              console.log('Processing as regular JSON');
              console.log('JSON address:', data.address);
              
              // Process street address (always include house number and street when available)
              const streetAddress = (data.address.house_number ? data.address.house_number + ' ' : '') + 
                                 (data.address.road || data.address.street || '');
              
              // For city, ONLY use actual city/town/village - don't use alternatives
              const city = data.address.city || data.address.town || data.address.village || '';
              
              // Log whether we found a city or not
              if (!city) {
                console.log('No city/town/village found in the address data');
                console.log('Available address fields:', Object.keys(data.address));
              }
              
              const addressData = {
                streetAddress: streetAddress,
                city: city,  // This will be blank if no city/town/village is available
                state: data.address.state || data.address.county || '',
                zipCode: data.address.postcode || ''
              };
              
              console.log('Extracted address data from JSON:', addressData);
              
              // Update the form fields
              updateAddressFields(addressData);
            } else if (data.display_name) {
              // Fallback to display_name for either format
              console.log('Using display_name fallback:', data.display_name);
              setMeetingAddress(data.display_name);
              
              // Extract just the street address from display_name if possible
              const parts = data.display_name.split(',').map(part => part.trim());
              console.log('Display name parts:', parts);
              
              if (parts.length >= 1) {
                setStreetAddress(parts[0]);
              }
              
              // Leave city blank as we can't reliably determine it
              console.log('Leaving city field blank in fallback mode');
              
              // Try to get state from parts
              if (parts.length >= 3) {
                setState(parts[2]);
              }
              
              // Try to extract zip code
              const zipMatch = data.display_name.match(/\b\d{5}(?:-\d{4})?\b/);
              if (zipMatch) {
                setZipCode(zipMatch[0]);
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
      id: meeting ? meeting.id : Date.now().toString(),
      name: meetingName.trim(),
      // For backward compatibility
      days: uniqueDays,
      time: firstTime,
      // New format
      schedule: meetingSchedule,
      address: formattedAddress,
      // Store individual address components for better editing
      streetAddress: streetAddress.trim(),
      city: city.trim(),
      state: state.trim(),
      zipCode: zipCode.trim(),
      coordinates: location,
      createdAt: meeting ? meeting.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    try {
      // Call the onSave callback with the meeting data
      // Let the parent component handle the actual database operation
      if (onSave) {
        onSave(meetingData);
      } else {
        console.error('No onSave callback provided');
        setError('Cannot save meeting. Please try again later.');
      }
    } catch (error) {
      console.error('Error saving meeting:', error);
      setError('Failed to save meeting. Please try again.');
    }
  };
  
  // Toggle day selection (legacy method kept for compatibility)
  const toggleDay = (day) => {
    setMeetingDays(prev => ({
      ...prev,
      [day]: !prev[day]
    }));
  };
  
  // Functions for the new day-time schedule management
  const addScheduleItem = (day, time) => {
    // Create a schedule item with specified day and time
    setMeetingSchedule(prev => [
      ...prev,
      { day, time }
    ]);
  };
  
  const removeScheduleItem = (index) => {
    setMeetingSchedule(prev => prev.filter((_, i) => i !== index));
  };
  
  const updateScheduleItem = (index, field, value) => {
    setMeetingSchedule(prev => 
      prev.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    );
  };
  
  // Format day name
  const formatDay = (day) => {
    return day.charAt(0).toUpperCase() + day.slice(1);
  };
  
  const containerClass = isOverlay 
    ? "fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm"
    : "bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6 border border-gray-200 dark:border-gray-700";
    
  const formClass = isOverlay
    ? "bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 max-w-md w-full border border-gray-200 dark:border-gray-700"
    : "";
  
  // Modal overlay styles - with no-cache support for dev mode
  const overlayClass = isOverlay 
    ? "fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 z-50 flex items-center justify-center p-4 overflow-y-auto"
    : "";
    
  return (
    <div className={`${overlayClass} transition-all duration-300 ease-in-out`}>
      <div className={`max-w-lg w-full bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden transition-all duration-300 transform ${isOverlay ? 'scale-100' : 'scale-95'}`}>
        <div className="p-6">
          <div className="flex items-center mb-4">
            <i className="fa-regular fa-calendar-plus mr-3 text-gray-400 dark:text-gray-500" style={{ fontSize: '2.5rem' }}></i>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
              {meeting ? 'Edit Meeting' : 'Add New Meeting'}
            </h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Add details for your regular AA meeting. Most meetings occur in the evenings, typically between 6-9 PM.
          </p>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded-lg border border-red-200 dark:border-red-800/50 flex items-start">
              <i className="fa-solid fa-circle-exclamation h-5 w-5 text-red-600 dark:text-red-400 mr-2 mt-0.5 flex-shrink-0"></i>
              <span>{error}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            {/* Meeting Name - Material UI TextField */}
            <div className="mb-6">
              <TextField
                fullWidth
                required
                variant="outlined"
                value={meetingName}
                onChange={(e) => setMeetingName(e.target.value)}
                placeholder="Enter meeting name"
              />
            </div>
            
            {/* Meeting Schedule with tooltip */}
            <div className="mb-6">
              <div className="flex items-center mb-2 relative">
                <div className="text-xl font-medium text-gray-700 dark:text-gray-300">Meeting Schedule
                <div className="relative ml-1" ref={tooltipRef}>
                  <i 
                    className="fa-solid fa-circle-info text-blue-500 dark:text-blue-400 cursor-pointer"
                    onClick={() => setShowTooltip(!showTooltip)}
                  ></i>
                  
                  {showTooltip && (
                    <div className="absolute z-10 top-full left-0 mt-2 w-64 p-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        Select times for each day this meeting occurs. Most meetings happen at the same time on different days.
                      </p>
                    </div>
                  )}
                </div></div>
              </div>
              
              <SimpleMeetingSchedule 
                schedule={meetingSchedule} 
                onChange={setMeetingSchedule} 
              />
            </div>
            
            {/* Meeting Address - Split into multiple fields */}
            <div className="mb-6">
              <div className="flex items-center mb-2">
                <span className="text-xl font-medium text-gray-700 dark:text-gray-300">Meeting Location</span>
              </div>
              
              {/* Street Address with Material UI TextField and adornment */}
              <div className="mb-3">
                <TextField
                  fullWidth
                  required
                  variant="outlined"
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  placeholder="Street address"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={detectLocation}
                          disabled={searchingLocation}
                          title="Detect your location"
                          edge="end"
                          size="medium"
                          color="primary"
                        >
                          {searchingLocation ? (
                            <i className="fa-solid fa-spinner fa-spin"></i>
                          ) : (
                            <i className="fa-solid fa-location-dot"></i>
                          )}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </div>
              
              {/* City, State, and Zip with Material UI TextFields */}
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div className="col-span-1">
                  <TextField
                    fullWidth
                    variant="outlined"
                    size="small"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City"
                  />
                </div>
                <div className="col-span-1">
                  <TextField
                    fullWidth
                    variant="outlined"
                    size="small"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="State"
                  />
                </div>
                <div className="col-span-1">
                  <TextField
                    fullWidth
                    variant="outlined"
                    size="small"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    placeholder="Zip Code"
                  />
                </div>
              </div>
            </div>
            
            {/* Action Buttons - Icon only, no background, with much more space between */}
            <div className="flex justify-between items-center mt-8" style={{ width: '90%', margin: '0 auto' }}>
              <button
                type="button"
                onClick={onCancel}
                style={{ 
                  background: 'transparent',
                  border: 'none',
                  padding: '5px',
                  cursor: 'pointer',
                  outline: 'none',
                  boxShadow: 'none'
                }}
                title="Cancel"
              >
                <i className="fa-regular fa-circle-xmark text-red-600 dark:text-red-400" style={{ fontSize: '2.5rem' }}></i>
              </button>
              
              <button
                type="submit"
                style={{ 
                  background: 'transparent',
                  border: 'none',
                  padding: '5px',
                  cursor: !meetingName || meetingSchedule.length === 0 || !streetAddress ? 'not-allowed' : 'pointer',
                  outline: 'none',
                  boxShadow: 'none',
                  opacity: !meetingName || meetingSchedule.length === 0 || !streetAddress ? 0.5 : 1,
                  color: !meetingName || meetingSchedule.length === 0 || !streetAddress ? '#6CDF7C' : '#00FF2D'
                }}
                title={meeting ? "Save changes" : "Add meeting"}
                disabled={!meetingName || meetingSchedule.length === 0 || !streetAddress}
              >
                <i className="fa-regular fa-circle-check text-green-600 dark:text-green-400" style={{ fontSize: '2.5rem' }}></i>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}