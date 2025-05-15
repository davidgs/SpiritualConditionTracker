import React, { useState, useEffect } from 'react';

export default function MeetingForm({ 
  meeting = null, 
  onSave, 
  onCancel,
  isOverlay = false
}) {
  // Form state
  const [meetingName, setMeetingName] = useState('');
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
    if (meeting) {
      setMeetingName(meeting.name);
      
      // Set days
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
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          
          if (response.ok) {
            const data = await response.json();
            
            if (data.address) {
              // Log the full response to see what we're getting
              console.log('Nominatim response:', data);
              
              // Extract address components from Nominatim response
              const addressData = {
                streetAddress: (data.address.house_number ? data.address.house_number + ' ' : '') + 
                              (data.address.road || data.address.street || ''),
                city: data.address.city || data.address.town || data.address.village || 
                     data.address.hamlet || data.address.neighbourhood || data.address.suburb || '',
                state: data.address.state || data.address.county || '',
                zipCode: data.address.postcode || ''
              };
              
              console.log('Extracted address data:', addressData);
              
              // Update the form fields
              updateAddressFields(addressData);
            } else if (data.display_name) {
              // Fallback to display_name and try to parse it
              console.log('Using display_name fallback:', data.display_name);
              setMeetingAddress(data.display_name);
              
              // Log the full response to see what we're getting
              console.log('Nominatim fallback response:', data);
              
              // More sophisticated parsing of display_name
              const parts = data.display_name.split(',').map(part => part.trim());
              console.log('Display name parts:', parts);
              
              // Try to extract meaningful address components
              // First part usually contains house number and street
              if (parts.length >= 1) {
                setStreetAddress(parts[0]);
              }
              
              // Second part is often city or neighborhood
              if (parts.length >= 2) {
                setCity(parts[1]);
              }
              
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
    
    if (!Object.values(meetingDays).some(day => day)) {
      setError('Please select at least one day of the week');
      return;
    }
    
    if (!meetingTime) {
      setError('Please select a meeting time');
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
    
    const meetingData = {
      id: meeting ? meeting.id : Date.now().toString(),
      name: meetingName.trim(),
      days: Object.entries(meetingDays)
        .filter(([_, selected]) => selected)
        .map(([day]) => day),
      time: meetingTime,
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
  
  // Toggle day selection
  const toggleDay = (day) => {
    setMeetingDays(prev => ({
      ...prev,
      [day]: !prev[day]
    }));
  };
  
  // Format day name
  const formatDay = (day) => {
    return day.charAt(0).toUpperCase() + day.slice(1);
  };
  
  const containerClass = isOverlay 
    ? "fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm"
    : "bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6 border border-gray-200 dark:border-gray-700";
    
  const formClass = isOverlay
    ? "bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700"
    : "";
  
  return (
    <div className={containerClass}>
      <div className={formClass}>
        <div className="flex items-center mb-4">
          <i className="fa-regular fa-calendar-plus mx-auto text-gray-400 dark:text-gray-500 mb-3" style={{ fontSize: '4rem', display: 'block' }}></i>

          {/* <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg> */}
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
            {meeting ? 'Edit Meeting' : 'Add New Meeting'}
          </h2>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-6 ml-1">
          Add details for your regular AA meeting. Most meetings occur in the evenings, typically between 6-9 PM.
        </p>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded-lg border border-red-200 dark:border-red-800/50 flex items-start">
            <i className="fa-solid fa-circle-exclamation h-5 w-5 text-red-600 dark:text-red-400 mr-2 mt-0.5 flex-shrink-0"></i>
            <span>{error}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          {/* Meeting Name */}
          <div className="mb-6">
            <label className="block text-gray-700 dark:text-gray-300 mb-2 text-xl font-medium">
              Meeting Name
            </label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              value={meetingName}
              onChange={(e) => setMeetingName(e.target.value)}
              placeholder="Enter meeting name"
              required
            />
          </div>
          
          {/* Days of the Week */}
          <div className="mb-6">
            <label className="block text-gray-700 dark:text-gray-300 mb-2 text-xl font-medium">
              Days of the Week
            </label>
            <div className="flex flex-wrap gap-2">
              {Object.keys(meetingDays).map(day => (
                <label 
                  key={day} 
                  className={`flex items-center px-3 py-2 rounded-md cursor-pointer ${
                    meetingDays[day] 
                      ? 'bg-blue-600 text-white font-medium' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
                  }`}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={meetingDays[day]}
                    onChange={() => toggleDay(day)}
                  />
                  {formatDay(day)}
                </label>
              ))}
            </div>
          </div>
          
          {/* Meeting Time */}
          <div className="mb-6">
            <label className="block text-gray-700 dark:text-gray-300 mb-2 text-xl font-medium">
              Meeting Time
            </label>
            <div className="relative">
              <select
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 appearance-none pr-10"
                value={meetingTime}
                onChange={(e) => setMeetingTime(e.target.value)}
              >
                <option value="">Select a time</option>
                {/* Common evening times for AA meetings first */}
                <optgroup label="Evening (Most Common)">
                  <option value="18:00">6:00 PM</option>
                  <option value="18:30">6:30 PM</option>
                  <option value="19:00">7:00 PM</option>
                  <option value="19:30">7:30 PM</option>
                  <option value="20:00">8:00 PM</option>
                  <option value="20:30">8:30 PM</option>
                </optgroup>
                {/* Morning times */}
                <optgroup label="Morning">
                  <option value="06:00">6:00 AM</option>
                  <option value="06:30">6:30 AM</option>
                  <option value="07:00">7:00 AM</option>
                  <option value="07:30">7:30 AM</option>
                  <option value="08:00">8:00 AM</option>
                  <option value="08:30">8:30 AM</option>
                  <option value="09:00">9:00 AM</option>
                  <option value="09:30">9:30 AM</option>
                  <option value="10:00">10:00 AM</option>
                  <option value="10:30">10:30 AM</option>
                  <option value="11:00">11:00 AM</option>
                  <option value="11:30">11:30 AM</option>
                  <option value="12:00">12:00 PM (Noon)</option>
                </optgroup>
                {/* Afternoon times */}
                <optgroup label="Afternoon">
                  <option value="12:30">12:30 PM</option>
                  <option value="13:00">1:00 PM</option>
                  <option value="13:30">1:30 PM</option>
                  <option value="14:00">2:00 PM</option>
                  <option value="14:30">2:30 PM</option>
                  <option value="15:00">3:00 PM</option>
                  <option value="15:30">3:30 PM</option>
                  <option value="16:00">4:00 PM</option>
                  <option value="16:30">4:30 PM</option>
                  <option value="17:00">5:00 PM</option>
                  <option value="17:30">5:30 PM</option>
                </optgroup>
                {/* Late evening times */}
                <optgroup label="Late Evening">
                  <option value="21:00">9:00 PM</option>
                  <option value="21:30">9:30 PM</option>
                  <option value="22:00">10:00 PM</option>
                </optgroup>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                <i className="fa-solid fa-chevron-down h-5 w-5"></i>
              </div>
            </div>
          </div>
          
          {/* Meeting Address - Split into multiple fields */}
          <div className="mb-6">
            <label className="block text-gray-700 dark:text-gray-300 mb-2 text-xl font-medium">
              Meeting Location
            </label>
            
            {/* Street Address with Detect button */}
            <div className="mb-3">
              <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">Street Address</label>
              <div className="flex">
                <input
                  type="text"
                  className="flex-grow p-3 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 shadow-sm"
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  placeholder="Street address"
                  required
                />
                <button
                  type="button"
                  onClick={detectLocation}
                  disabled={searchingLocation}
                  title="Detect your location"
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    padding: 0,
                    margin: '0 0 0 10px',
                    cursor: 'pointer',
                    outline: 'none',
                    boxShadow: 'none'
                  }}
                >
                  {searchingLocation ? (
                    <i className="fa-solid fa-spinner fa-spin text-blue-500 dark:text-blue-400" style={{ fontSize: '1.5rem' }}></i>
                  ) : (
                    <i className="fa-solid fa-location-dot text-blue-500 dark:text-blue-400" style={{ fontSize: '1.5rem' }}></i>
                  )}
                </button>
              </div>
            </div>
            
            {/* City and State */}
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">City</label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 shadow-sm"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">State/Province</label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 shadow-sm"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="State/Province"
                />
              </div>
            </div>
            
            {/* Zip/Postal Code */}
            <div className="mb-3">
              <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">Zip/Postal Code</label>
              <input
                type="text"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 shadow-sm"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                placeholder="Zip/Postal Code"
              />
            </div>
            
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Fill in the address details or use the detect button to find your current location
            </p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex justify-between mt-8">
            <button
              type="button"
              onClick={onCancel}
              title="Cancel"
              style={{ 
                background: 'none', 
                border: 'none', 
                padding: 0,
                cursor: 'pointer',
                outline: 'none',
                boxShadow: 'none',
                transition: 'transform 0.2s',
                transform: 'scale(1)',
                ':hover': {
                  transform: 'scale(1.1)'
                }
              }}
            >
              <i className="fa-regular fa-circle-xmark text-red-500 dark:text-red-400" style={{ fontSize: '2rem' }}></i>
            </button>
            <button
              type="submit"
              title={meeting ? "Save changes" : "Add meeting"}
              disabled={!name || !time || !days.length || !streetAddress}
              style={{ 
                background: 'none', 
                border: 'none', 
                padding: 0,
                cursor: !name || !time || !days.length || !streetAddress ? 'not-allowed' : 'pointer',
                outline: 'none',
                boxShadow: 'none',
                transition: 'transform 0.2s',
                transform: 'scale(1)'
              }}
              onMouseOver={(e) => {
                if (name && time && days.length && streetAddress) {
                  e.currentTarget.style.transform = 'scale(1.1)';
                }
              }}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <i className={`fa-regular fa-circle-check ${
                !name || !time || !days.length || !streetAddress 
                  ? 'text-gray-400 dark:text-gray-600' 
                  : 'text-green-500 dark:text-green-400'
              }`} style={{ fontSize: '2rem' }}></i>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}