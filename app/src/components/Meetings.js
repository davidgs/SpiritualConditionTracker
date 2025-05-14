import React, { useState, useEffect } from 'react';
import { meetingOperations } from '../utils/database';
import MeetingForm from './MeetingForm';

export default function Meetings({ setCurrentView }) {
  const [meetings, setMeetings] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [currentMeeting, setCurrentMeeting] = useState(null);
  const [error, setError] = useState('');
  
  // Dark mode detection
  const darkMode = document.documentElement.classList.contains('dark');
  
  // Load meetings on component mount
  useEffect(() => {
    loadMeetings();
  }, []);
  
  // Load user's meetings
  const loadMeetings = async () => {
    try {
      const userMeetings = meetingOperations.getAll();
      setMeetings(userMeetings);
    } catch (error) {
      console.error('Error loading meetings:', error);
      setError('Failed to load meetings. Please try again.');
    }
  };
  
  // Edit an existing meeting
  const handleEdit = (meeting) => {
    setCurrentMeeting(meeting);
    setShowForm(true);
  };
  
  // Delete a meeting
  const handleDelete = (meetingId) => {
    if (window.confirm('Are you sure you want to delete this meeting?')) {
      try {
        meetingOperations.delete(meetingId);
        loadMeetings();
      } catch (error) {
        console.error('Error deleting meeting:', error);
        setError('Failed to delete meeting. Please try again.');
      }
    }
  };
  
  // Handle form save
  const handleSaveMeeting = (meetingData) => {
    // Reset form and reload meetings
    setCurrentMeeting(null);
    setShowForm(false);
    loadMeetings();
  };
  
  // Format day name
  const formatDay = (day) => {
    return day.charAt(0).toUpperCase() + day.slice(1);
  };
  
  // Render a single meeting item
  const renderMeetingItem = (meeting) => {
    return (
      <div key={meeting.id} className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4 mb-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              {meeting.name}
            </h3>
            
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              <p>
                <span className="font-medium">Days:</span>{' '}
                {meeting.days.map(formatDay).join(', ')}
              </p>
              <p>
                <span className="font-medium">Time:</span>{' '}
                {new Date(`2000-01-01T${meeting.time}`).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </p>
              <p>
                <span className="font-medium">Address:</span>{' '}
                {meeting.address}
              </p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button
              className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              onClick={() => handleEdit(meeting)}
            >
              <i className="fas fa-edit"></i>
            </button>
            <button
              className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              onClick={() => handleDelete(meeting.id)}
            >
              <i className="fas fa-trash"></i>
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
      
      {/* Add Meeting Button */}
      {!showForm && (
        <button
          className="mb-4 w-full p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex justify-center items-center"
          onClick={() => setShowForm(true)}
        >
          <i className="fas fa-plus mr-2"></i>
          Add New Meeting
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
        />
      )}
      
      {/* Meetings List */}
      <div className="mt-4 max-h-[60vh] overflow-y-auto">
        {meetings.length > 0 ? (
          meetings.map(meeting => renderMeetingItem(meeting))
        ) : (
          <div className="text-center p-6 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              You haven't added any meetings yet.
            </p>
            {!showForm && (
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={() => setShowForm(true)}
              >
                Add Your First Meeting
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
      <div key={meeting.id} className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4 mb-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              {meeting.name}
            </h3>
            
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              <p>
                <span className="font-medium">Days:</span>{' '}
                {meeting.days.map(formatDay).join(', ')}
              </p>
              <p>
                <span className="font-medium">Time:</span>{' '}
                {new Date(`2000-01-01T${meeting.time}`).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </p>
              <p>
                <span className="font-medium">Address:</span>{' '}
                {meeting.address}
              </p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button
              className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              onClick={() => handleEdit(meeting)}
            >
              <i className="fas fa-edit"></i>
            </button>
            <button
              className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              onClick={() => handleDelete(meeting.id)}
            >
              <i className="fas fa-trash"></i>
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
      
      {/* Add Meeting Button */}
      {!showForm && (
        <button
          className="mb-4 w-full p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex justify-center items-center"
          onClick={() => setShowForm(true)}
        >
          <i className="fas fa-plus mr-2"></i>
          Add New Meeting
        </button>
      )}
      
      {/* Meeting Form */}
      {showForm && renderMeetingForm()}
      
      {/* Meetings List */}
      <div className="mt-4 max-h-[60vh] overflow-y-auto">
        {meetings.length > 0 ? (
          meetings.map(meeting => renderMeetingItem(meeting))
        ) : (
          <div className="text-center p-6 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              You haven't added any meetings yet.
            </p>
            {!showForm && (
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={() => setShowForm(true)}
              >
                Add Your First Meeting
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}