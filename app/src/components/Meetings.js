import React, { useState, useEffect } from 'react';
import { meetingOperations } from '../utils/database';
import MeetingForm from './MeetingForm';

export default function Meetings({ setCurrentView, meetings = [], onSave }) {
  const [localMeetings, setLocalMeetings] = useState(meetings);
  const [showForm, setShowForm] = useState(false);
  const [currentMeeting, setCurrentMeeting] = useState(null);
  const [error, setError] = useState('');
  
  // Dark mode detection
  const darkMode = document.documentElement.classList.contains('dark');
  
  // Update localMeetings when meetings prop changes
  useEffect(() => {
    setLocalMeetings(meetings);
  }, [meetings]);
  
  // Edit an existing meeting
  const handleEdit = (meeting) => {
    setCurrentMeeting(meeting);
    setShowForm(true);
  };
  
  // Delete a meeting
  const handleDelete = (meetingId) => {
    if (window.confirm('Are you sure you want to delete this meeting?')) {
      try {
        if (window.db) {
          window.db.remove('meetings', meetingId);
          // Update the local meetings list
          setLocalMeetings(prevMeetings => 
            prevMeetings.filter(meeting => meeting.id !== meetingId)
          );
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
          <div>{meeting.streetAddress}</div>
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
      <div key={meeting.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-5 mb-5 transition-all hover:shadow-lg">
        <div className="flex flex-col">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
              {meeting.name}
            </h3>
            
            <div className="flex space-x-2">
              <button
                className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 p-2 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900"
                onClick={() => handleEdit(meeting)}
                aria-label="Edit meeting"
              >
                <i className="fa-solid fa-pen-to-square w-5 h-5"></i>
              </button>
              <button
                className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900"
                onClick={() => handleDelete(meeting.id)}
                aria-label="Delete meeting"
              >
                <i className="fa-solid fa-trash-can w-5 h-5"></i>
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-600 dark:text-gray-300 mt-1">
            <div className="flex items-center">
              <i className="fa-solid fa-calendar-days h-4 w-4 text-blue-500 mr-2 flex-shrink-0"></i>
              <div>
                <span className="font-semibold text-gray-700 dark:text-gray-100 block">Days</span>
                <span>{meeting.days.map(formatDay).join(', ')}</span>
              </div>
            </div>
            
            <div className="flex items-center">
              <i className="fa-regular fa-clock h-4 w-4 text-blue-500 mr-2 flex-shrink-0"></i>
              <div>
                <span className="font-semibold text-gray-700 dark:text-gray-100 block">Time</span>
                <span>{new Date(`2000-01-01T${meeting.time}`).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
              </div>
            </div>
            
            <div className="flex items-start col-span-1 md:col-span-3 mt-2">
              <i className="fa-solid fa-location-dot h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0"></i>
              <div>
                <span className="font-semibold text-gray-700 dark:text-gray-100 block">Address</span>
                <div className="text-gray-600 dark:text-gray-300">{formatAddress(meeting)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="p-4 content-scrollable">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center">
        <i className="fa-solid fa-building mr-2 text-blue-600"></i>
        &nbsp;My Meetings
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
            title={localMeetings.length > 0 ? 'Add New Meeting' : 'Add Your First Meeting'}
            style={{ 
              background: 'none', 
              border: 'none', 
              padding: 0,
              cursor: 'pointer',
              outline: 'none',
              boxShadow: 'none'
            }}
          >
            <i className="fa-solid fa-circle-plus text-blue-500 dark:text-blue-400" style={{ fontSize: '3.5rem' }}></i>
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
      <div className="mt-4 max-h-[60vh] overflow-y-auto">
        {localMeetings.length > 0 ? (
          localMeetings.map(meeting => renderMeetingItem(meeting))
        ) : (
          <div className="text-center p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
            
            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">No Meetings Found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-3">
              You haven't added any meetings to your schedule yet.
            </p>
            <p className="text-gray-500 dark:text-gray-500 text-sm">
              Click the <i className="fa-solid fa-plus text-blue-500"></i> button to add your first meeting.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}