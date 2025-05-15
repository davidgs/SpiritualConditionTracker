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
      setMeetingAddress(meeting.address);
      setLocation(meeting.coordinates);
    }
  }, [meeting]);
  
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
            if (data.display_name) {
              setMeetingAddress(data.display_name);
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
    
    if (!meetingAddress.trim()) {
      setError('Meeting address is required');
      return;
    }
    
    const meetingData = {
      id: meeting ? meeting.id : Date.now().toString(),
      name: meetingName.trim(),
      days: Object.entries(meetingDays)
        .filter(([_, selected]) => selected)
        .map(([day]) => day),
      time: meetingTime,
      address: meetingAddress.trim(),
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
    ? "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    : "bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-4";
    
  const formClass = isOverlay
    ? "bg-white dark:bg-gray-800 rounded-lg shadow p-4 max-w-md w-full max-h-[90vh] overflow-y-auto"
    : "";
  
  return (
    <div className={containerClass}>
      <div className={formClass}>
        <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100">
          {meeting ? 'Edit Meeting' : 'Add New Meeting'}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Add details for your regular AA meeting. Most meetings occur in the evenings, typically between 6-9 PM.
        </p>
        
        {error && (
          <div className="mb-4 p-2 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          {/* Meeting Name */}
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 mb-2">
              Meeting Name
            </label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              value={meetingName}
              onChange={(e) => setMeetingName(e.target.value)}
              placeholder="Enter meeting name"
            />
          </div>
          
          {/* Days of the Week */}
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 mb-2">
              Days of the Week
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {Object.keys(meetingDays).map(day => (
                <label 
                  key={day} 
                  className={`flex items-center p-2 rounded cursor-pointer ${
                    meetingDays[day] 
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={meetingDays[day]}
                    onChange={() => toggleDay(day)}
                  />
                  {formatDay(day)}
                </label>
              ))}
            </div>
          </div>
          
          {/* Meeting Time */}
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 mb-2">
              Meeting Time (24-hour format, e.g. 18:00 for 6 PM)
            </label>
            <select
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              value={meetingTime}
              onChange={(e) => setMeetingTime(e.target.value)}
            >
              <option value="">Select a time</option>
              {/* Morning times */}
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
              {/* Afternoon/Evening times */}
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
              <option value="18:00">6:00 PM</option>
              <option value="18:30">6:30 PM</option>
              <option value="19:00">7:00 PM</option>
              <option value="19:30">7:30 PM</option>
              <option value="20:00">8:00 PM</option>
              <option value="20:30">8:30 PM</option>
              <option value="21:00">9:00 PM</option>
              <option value="21:30">9:30 PM</option>
              <option value="22:00">10:00 PM</option>
            </select>
          </div>
          
          {/* Meeting Address */}
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 mb-2">
              Meeting Address
            </label>
            <div className="flex">
              <input
                type="text"
                className="flex-grow p-2 border border-gray-300 dark:border-gray-600 rounded-l bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                value={meetingAddress}
                onChange={(e) => setMeetingAddress(e.target.value)}
                placeholder="Enter meeting address"
              />
              <button
                type="button"
                className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded-r"
                onClick={detectLocation}
                disabled={searchingLocation}
              >
                {searchingLocation ? 'Detecting...' : 'Detect'}
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Include full address details or use the detect button to find your current location
            </p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex justify-between mt-6">
            <button
              type="button"
              className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-600"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              {meeting ? 'Update' : 'Save'} Meeting
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}