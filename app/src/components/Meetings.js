import React, { useState, useEffect } from 'react';
import { meetingOperations } from '../utils/database';
import MeetingForm from './MeetingForm';

export default function Meetings({ setCurrentView, meetings = [], onSave, user }) {
  // Get user's home group
  const [userHomeGroup, setUserHomeGroup] = useState('');
  
  // Load user data to get home group
  useEffect(() => {
    if (user && user.homeGroup) {
      setUserHomeGroup(user.homeGroup);
    }
  }, [user, meetings]); // Refresh when user or meetings change
  const [showForm, setShowForm] = useState(false);
  const [currentMeeting, setCurrentMeeting] = useState(null);
  const [error, setError] = useState('');
  
  // Dark mode detection
  const darkMode = document.documentElement.classList.contains('dark');
  
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
          <div>                <i className="fa-solid fa-location-dot text-gray-500 dark:text-gray-400 mr-3 mt-1 flex-shrink-0" style={{ fontSize: '1rem' }}></i>
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
              {meeting.name}
              {meeting.name === userHomeGroup && (
                <i className="fa-solid fa-house text-blue-500 ml-2" title="Home Group" style={{ fontSize: '0.85rem' }}></i>
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
                    <span className="text-gray-500 dark:text-gray-500 mx-2"><i className="fa-solid fa-at"></i></span>&nbsp;
                    <span className="text-gray-600 dark:text-gray-300">{new Date(`2000-01-01T${item.time}`).toLocaleTimeString([], {hour: 'numeric', minute:'2-digit'})}</span>&nbsp;
                    <i className="fa-regular fa-clock text-gray-500 dark:text-gray-400 mr-2 flex-shrink-0" style={{ fontSize: '1rem' }}></i>

                  </div>
                ))
              ) : (
                // Legacy format fallback
                <div className="flex items-center gap-2">
                  <i className="fa-solid fa-calendar-days text-gray-500 dark:text-gray-400 mr-3 flex-shrink-0" style={{ fontSize: '1rem' }}></i>&nbsp;
                  <span className="text-gray-600 dark:text-gray-300">{meeting.days.map(formatDay).join(', ')}</span>&nbsp;
                  <span className="text-gray-500 dark:text-gray-500 mx-2"><i className="fa-solid fa-at"></i></span>&nbsp;
                  <span className="text-gray-600 dark:text-gray-300">{new Date(`2000-01-01T${meeting.time}`).toLocaleTimeString([], {hour: 'numeric', minute:'2-digit'})}</span>&nbsp;
                  <i className="fa-regular fa-clock text-gray-500 dark:text-gray-400 mr-2 flex-shrink-0" style={{ fontSize: '1rem' }}></i>

                </div>
              )}
            </div>
            
            {/* Address */}
            <div className="flex items-start">
              <div className="text-gray-600 dark:text-gray-300">
                {formatAddress(meeting)}
              </div>
            </div>
            
            {/* Action buttons at the bottom */}
            <div className="flex justify-end space-x-4 mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
              <button
                className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200"
                onClick={() => handleEdit(meeting)}
                aria-label="Edit meeting"
                title="Edit meeting"
                style={{ 
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1.1rem',
                  padding: '0.25rem'
                }}
              >
                <i className="fa-solid fa-pen-to-square text-blue-500 dark:text-blue-400"></i>
              </button>
              <button
                className="text-red-500 hover:text-red-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors duration-200"
                onClick={() => handleDelete(meeting.id)}
                aria-label="Delete meeting"
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
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3">
        <i className="fa-solid fa-calendar text-gray-300 dark:text-gray-600 mb-4" style={{ fontSize: '2.5rem' }}></i>&nbsp;Meetings
      </h1>
      
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
      
      {/* Add Meeting Button - Floating Action Button style */}
      {!showForm && (
        <div className="fixed bottom-20 right-6 z-10">
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
      )}
      
      {/* Meeting Form */}
      {showForm && (
        <MeetingForm 
          meeting={currentMeeting}
          onSave={handleSaveMeeting}
          onCancel={() => {
            setCurrentMeeting(null);
            setShowForm(false);
          }}
          darkMode={darkMode}
        />
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