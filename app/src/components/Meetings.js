import React, { useState, useEffect, useContext } from 'react';
import { meetingOperations } from '../utils/database';
import MeetingFormDialog from './MeetingFormDialog';
import { ThemeContext } from '../contexts/ThemeContext';
import { formatTimeByPreference } from '../utils/dateUtils';

export default function Meetings({ setCurrentView, meetings = [], onSave, user }) {
  // Get dark mode from theme context
  const { theme } = useContext(ThemeContext);
  const darkMode = theme === 'dark';
  
  // Get user preferences
  const [use24HourFormat, setUse24HourFormat] = useState(false);
  
  // Keep user preferences in sync
  useEffect(() => {
    if (user && user.preferences) {
      const timeFormat = user.preferences.use24HourFormat || false;
      console.log('Meetings: Setting time format preference to:', timeFormat);
      setUse24HourFormat(timeFormat);
    }
  }, [user, user?.preferences?.use24HourFormat]);
  
  // Get user's home groups
  const [userHomeGroups, setUserHomeGroups] = useState([]);
  
  // Load user data to get home groups
  useEffect(() => {
    if (user) {
      // Handle both the new array format and legacy string format
      const homeGroups = user.homeGroups 
        ? user.homeGroups 
        : (user.homeGroup ? [user.homeGroup] : []);
      setUserHomeGroups(homeGroups);
    }
  }, [user, meetings]); // Refresh when user or meetings change
  
  const [showForm, setShowForm] = useState(false);
  const [currentMeeting, setCurrentMeeting] = useState(null);
  const [error, setError] = useState('');
  
  // Edit an existing meeting
  const handleEdit = (meeting) => {
    setCurrentMeeting(meeting);
    setShowForm(true);
  };
  
  // Delete a meeting (now relies on database operations being handled at App.js level)
  const handleDelete = (meetingId) => {
    if (window.confirm('Are you sure you want to delete this meeting?')) {
      try {
        if (window.db) {
          window.db.remove('meetings', meetingId);
          // State will be updated when parent re-renders with updated meetings list
        } else {
          throw new Error('Database not initialized');
        }
      } catch (error) {
        console.error('Error deleting meeting:', error);
        setError('Failed to delete meeting. Please try again.');
      }
    }
  };
  
  // Handle form save - simplified to use only App.js onSave prop
  const handleSaveMeeting = (meetingData) => {
    try {
      if (!onSave) {
        throw new Error('No onSave callback provided');
      }
      
      // Call the onSave from the parent component (App.js)
      // This will handle the database operation and return the saved meeting
      const savedMeeting = onSave(meetingData);
      
      // Reset form state
      setCurrentMeeting(null);
      setShowForm(false);
      
      // State will be updated correctly when the meetings prop updates
      // No need to manually update state here
    } catch (error) {
      console.error('Error saving meeting:', error);
      setError('Failed to save meeting. Please try again.');
    }
  };
  
  // Format day name
  const formatDay = (day) => {
    return day.charAt(0).toUpperCase() + day.slice(1);
  };
  
  // Format address for display
  const formatAddress = (meeting) => {
    // If we have the individual components, use them
    if (meeting.streetAddress) {
      return (
        <>
          {meeting.locationName && (
            <div className="font-semibold mb-1">{meeting.locationName}</div>
          )}
          <div><i className="fa-solid fa-location-dot text-gray-500 dark:text-gray-400 mr-3 mt-1 flex-shrink-0" style={{ fontSize: '1rem' }}></i>
          &nbsp;{meeting.streetAddress}</div>
          {meeting.city && meeting.state && (
            <div>{meeting.city}, {meeting.state} {meeting.zipCode}</div>
          )}
        </>
      );
    }
    
    // Otherwise, split the address at commas for better display
    const parts = meeting.address.split(',');
    if (parts.length > 2) {
      // Show first line, and then city, state, zip together
      return (
        <>
          <div>{parts[0]}</div>
          <div>{parts.slice(1).join(',')}</div>
        </>
      );
    }
    
    // If simple address, just show as is
    return meeting.address;
  };

  // Render a single meeting item
  const renderMeetingItem = (meeting) => {
    return (
      <div key={meeting.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-4 mb-4 transition-all hover:shadow-lg">
        <div className="flex flex-col">
          <div className="mb-3">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
              {meeting.name} &nbsp;
              {userHomeGroups.includes(meeting.name) && (
                <i className="fa-solid fa-house text-gray-500 dark:text-gray-200 ml-2" title="Home Group" style={{ fontSize: '0.85rem' }}></i>
              )}
            </h3>
          </div>
          
          <div className="flex flex-col gap-3 text-sm">
            {/* Use schedule if available, otherwise use days/time */}
            <div className="space-y-2">
              {meeting.schedule && Array.isArray(meeting.schedule) && meeting.schedule.length > 0 ? (
                // Display each schedule item
                meeting.schedule.map((item, idx) => (
                  <div key={`${meeting.id}-schedule-${idx}`} className="flex items-center gap-2">
                    <i className="fa-solid fa-calendar-days text-gray-500 dark:text-gray-400 mr-3 flex-shrink-0" style={{ fontSize: '1rem' }}></i>&nbsp;
                    <span className="text-gray-600 dark:text-gray-300">{formatDay(item.day)}</span>&nbsp;
                    <i className="fa-regular fa-clock text-gray-500 dark:text-gray-400 mx-1 flex-shrink-0" style={{ fontSize: '0.85rem' }}></i>&nbsp;
                    <span className="text-gray-600 dark:text-gray-300">{item.time}</span>
                  </div>
                ))
              ) : (
                // Legacy format
                <div className="flex flex-col gap-2">
                  <div className="flex items-center">
                    <i className="fa-solid fa-calendar-days text-gray-500 dark:text-gray-400 mr-3" style={{ fontSize: '1rem' }}></i>&nbsp;
                    <span className="text-gray-600 dark:text-gray-300">
                      {meeting.days && meeting.days.map((day, idx) => (
                        <span key={`${meeting.id}-day-${idx}`}>
                          {idx > 0 && ', '}
                          {formatDay(day)}
                        </span>
                      ))}
                    </span>
                  </div>
                  {meeting.time && (
                    <div className="flex items-center">
                      <i className="fa-regular fa-clock text-gray-500 dark:text-gray-400 mr-3" style={{ fontSize: '1rem' }}></i>&nbsp;
                      <span className="text-gray-600 dark:text-gray-300">
                        {(() => {
                          console.log('Meeting time to format:', meeting.time, 'Use 24h format:', use24HourFormat);
                          
                          // If we're using 24-hour format, no conversion needed
                          if (use24HourFormat) {
                            return meeting.time;
                          }
                          
                          // Convert to 12-hour format with AM/PM
                          try {
                            const parts = meeting.time.split(':');
                            const hours = parseInt(parts[0], 10);
                            const minutes = parts[1];
                            const period = hours >= 12 ? 'PM' : 'AM';
                            const hours12 = hours % 12 || 12;
                            const result = `${hours12}:${minutes} ${period}`;
                            console.log('Converted time:', result);
                            return result;
                          } catch (e) {
                            console.error('Error formatting time:', e);
                            return meeting.time;
                          }
                        })()}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Address */}
            <div className="text-gray-600 dark:text-gray-300 flex items-start">
              <div className="w-full">
                {formatAddress(meeting)}
              </div>
            </div>
          </div>
          
          <div className="mt-4 pt-3 flex justify-end border-t border-gray-200 dark:border-gray-700">
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(meeting)}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                title="Edit meeting"
                style={{ 
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1.1rem',
                  padding: '0.25rem'
                }}
              >
                <i className="fa-solid fa-pen-to-square"></i>
              </button>
              <button
                onClick={() => handleDelete(meeting.id)}
                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                title="Delete meeting"
                style={{ 
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1.1rem',
                  padding: '0.25rem'
                }}
              >
                <i className="fa-solid fa-trash-can text-red-500 dark:text-gray-400"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="p-3">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
          <i className="fa-solid fa-calendar text-gray-300 dark:text-gray-600 mr-3" style={{ fontSize: '2.5rem' }}></i>
          Meetings
        </h1>
        
        <button
          onClick={() => setShowForm(true)}
          aria-label="Add new meeting"
          title={meetings.length > 0 ? 'Add New Meeting' : 'Add Your First Meeting'}
          className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200"
          style={{ 
            background: 'transparent', 
            border: 'none', 
            cursor: 'pointer',
            outline: 'none',
            boxShadow: 'none',
            fontSize: '2rem',  
            padding: '0.5rem'
          }}
        >
          <i className="fa-solid fa-calendar-plus"></i>
        </button>
      </div>

      {/* Meeting Form Dialog */}
      <MeetingFormDialog 
        open={showForm}
        meeting={currentMeeting}
        onSave={handleSaveMeeting}
        onClose={() => {
          setCurrentMeeting(null);
          setShowForm(false);
        }}
        isEdit={!!currentMeeting}
        use24HourFormat={use24HourFormat}
      />
      
      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          <p>{error}</p>
          <button 
            className="text-sm text-red-700 underline mt-1"
            onClick={() => setError('')}
          >
            Dismiss
          </button>
        </div>
      )}
      
      {/* Meetings List */}
      <div className="mt-4">
        {meetings.length > 0 ? (
          meetings.map(meeting => renderMeetingItem(meeting))
        ) : (
          <div className="text-center p-8 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">No Meetings Found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-3">
              You haven't added any meetings to your schedule yet.
            </p>
            <p className="text-gray-500 dark:text-gray-500 text-sm">
              Click the <i className="fa-solid fa-calendar-plus text-blue-500"></i> button to add your first meeting.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}