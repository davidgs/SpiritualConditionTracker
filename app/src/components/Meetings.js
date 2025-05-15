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
      <div key={meeting.id} className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4 mb-4">
        <div className="flex justify-between items-start">
          <div className="flex-grow mr-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              {meeting.name}
            </h3>
            
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center mb-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="font-medium mr-1">Days:</span>
                {meeting.days.map(formatDay).join(', ')}
              </div>
              
              <div className="flex items-center mb-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium mr-1">Time:</span>
                {new Date(`2000-01-01T${meeting.time}`).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </div>
              
              <div className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div>
                  <span className="font-medium mr-1">Address:</span>
                  {formatAddress(meeting)}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button
              className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 p-2 rounded hover:bg-blue-100 dark:hover:bg-blue-900"
              onClick={() => handleEdit(meeting)}
              aria-label="Edit meeting"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32L19.513 8.2z" />
              </svg>
            </button>
            <button
              className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-2 rounded hover:bg-red-100 dark:hover:bg-red-900"
              onClick={() => handleDelete(meeting.id)}
              aria-label="Delete meeting"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.945a.75.75 0 10-1.5.058l.347 9a.75.75 0 101.499-.058l-.346-9zm5.48.058a.75.75 0 10-1.498-.058l-.347 9a.75.75 0 001.5.058l.345-9z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="p-4 pb-20 content-scrollable">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
        My Meetings
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
      
      {/* Add Meeting Button */}
      {!showForm && (
        <button
          className="mb-4 w-full p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex justify-center items-center"
          onClick={() => setShowForm(true)}
        >
          <i className="fas fa-plus mr-2"></i>
          {localMeetings.length > 0 ? 'Add New Meeting' : 'Add Your First Meeting'}
        </button>
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
          <div className="text-center p-6 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-gray-600 dark:text-gray-400">
              You haven't added any meetings yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}