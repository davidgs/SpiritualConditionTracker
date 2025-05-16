import React, { useState, useEffect } from 'react';
import { formatDateForDisplay } from '../utils/dateUtils';
import ActivityList from './ActivityList';
import MeetingForm from './MeetingForm';

/**
 * Combined Activity Page that includes both activity logging form and history
 * with a toggle to show/hide the form.
 */
export default function ActivityPage({ setCurrentView, onSave, onSaveMeeting, activities, meetings = [] }) {
  // Dark mode detection
  const darkMode = document.documentElement.classList.contains('dark');
  const [isDarkMode, setIsDarkMode] = useState(darkMode);
  
  // State for toggling form visibility
  const [showForm, setShowForm] = useState(true);
  
  // State for activity filter
  const [filter, setFilter] = useState('all');
  
  // Activity form states
  const [activityType, setActivityType] = useState('prayer');
  const [duration, setDuration] = useState('15');
  const [date, setDate] = useState(getCurrentDateString());
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Additional fields for specific activity types
  const [literatureTitle, setLiteratureTitle] = useState('');
  const [meetingName, setMeetingName] = useState('');
  const [wasChair, setWasChair] = useState(false);
  const [wasShare, setWasShare] = useState(false);
  const [wasSpeaker, setWasSpeaker] = useState(false);
  // Call type checkboxes
  const [isSponsorCall, setIsSponsorCall] = useState(false);
  const [isSponseeCall, setIsSponseeCall] = useState(false);
  const [isAAMemberCall, setIsAAMemberCall] = useState(false);
  
  // Meeting selection fields
  const [selectedMeetingId, setSelectedMeetingId] = useState('');
  const [showMeetingForm, setShowMeetingForm] = useState(false);
  
  // Watch for dark mode changes
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setIsDarkMode(document.documentElement.classList.contains('dark'));
        }
      });
    });
    
    observer.observe(document.documentElement, { attributes: true });
    
    return () => observer.disconnect();
  }, []);
  
  // Generate current date in YYYY-MM-DD format
  function getCurrentDateString() {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  }
  
  // Reset additional fields when activity type changes
  useEffect(() => {
    // Set default duration based on activity type
    if (activityType === 'meeting') {
      setDuration('60'); // Default duration for meetings is 60 minutes
    } else {
      setDuration('15'); // Default duration for other activities
    }
    
    setLiteratureTitle('');
    setMeetingName('');
    setWasChair(false);
    setWasShare(false);
    setWasSpeaker(false);
    setIsSponsorCall(false);
    setIsSponseeCall(false);
    setIsAAMemberCall(false);
    setSelectedMeetingId('');
    setShowMeetingForm(false);
  }, [activityType]);
  
  // Get duration options based on activity type
  const getDurationOptions = () => {
    const options = [];
    let maxMinutes = 60; // Default max is 1 hour
    let increment = 15; // Default increment is 15 minutes
    
    if (activityType === 'meeting') {
      maxMinutes = 150; // 2.5 hours
      increment = 30; // 30 minute increments
    } else if (activityType === 'sponsee' || activityType === 'service') {
      maxMinutes = 120; // 2 hours
    }
    
    for (let i = increment; i <= maxMinutes; i += increment) {
      options.push(
        <option key={i} value={i.toString()}>{i} minutes</option>
      );
    }
    
    return options;
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    const newErrors = {};
    if (!activityType) newErrors.activityType = 'Activity type is required';
    if (!duration) newErrors.duration = 'Duration is required';
    if (!date) newErrors.date = 'Date is required';
    
    // Validate activity-specific fields
    if (activityType === 'literature' && !literatureTitle.trim()) {
      newErrors.literatureTitle = 'Literature title is required';
    }
    
    if (activityType === 'meeting' && !showMeetingForm && !meetingName.trim()) {
      newErrors.meetingName = 'Meeting name is required';
    }
    
    if (activityType === 'call' && !isSponsorCall && !isSponseeCall && !isAAMemberCall) {
      newErrors.callType = 'At least one call type must be selected';
    }
    
    // If there are errors, show them and don't submit
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Create a unique ID for the activity
    const activityId = Date.now().toString();
    
    // Create new activity object with core fields
    const newActivity = {
      id: activityId,
      type: activityType,
      duration: parseInt(duration, 10),
      date: date, // Store as-is in YYYY-MM-DD format
      notes: notes.trim(),
    };
    
    // Add activity-specific fields
    if (activityType === 'literature') {
      newActivity.literatureTitle = literatureTitle.trim();
    }
    
    if (activityType === 'meeting') {
      newActivity.meetingName = meetingName.trim();
      newActivity.wasChair = wasChair;
      newActivity.wasShare = wasShare;
      newActivity.wasSpeaker = wasSpeaker;
      
      // Include meeting ID if one was selected
      if (selectedMeetingId) {
        newActivity.meetingId = selectedMeetingId;
      }
    }
    
    if (activityType === 'call') {
      newActivity.isSponsorCall = isSponsorCall;
      newActivity.isSponseeCall = isSponseeCall;
      newActivity.isAAMemberCall = isAAMemberCall;
      
      // Determine the actual type for filtering/display purposes
      if (isSponsorCall && !isSponseeCall && !isAAMemberCall) {
        newActivity.callType = 'sponsor';
      } else if (!isSponsorCall && isSponseeCall && !isAAMemberCall) {
        newActivity.callType = 'sponsee';
      } else if (!isSponsorCall && !isSponseeCall && isAAMemberCall) {
        newActivity.callType = 'aa_call';
      } else {
        newActivity.callType = 'multiple'; // Multiple types selected
      }
    }
    
    // Save the activity
    onSave(newActivity);
    
    // Show success message
    setShowSuccess(true);
    
    // Reset form fields that should clear after submission
    if (activityType === 'call') {
      setDuration('15');
      setIsSponsorCall(false);
      setIsSponseeCall(false);
      setIsAAMemberCall(false);
      setNotes('');
    } else if (activityType === 'literature') {
      setDuration('15');
      setLiteratureTitle('');
      setNotes('');
    } else if (activityType === 'meeting') {
      setDuration('30');
      setMeetingName('');
      setWasChair(false);
      setWasShare(false);
      setWasSpeaker(false);
      setNotes('');
    } else {
      setDuration('15');
      setNotes('');
    }
    
    // Hide success message after 2 seconds
    setTimeout(() => {
      setShowSuccess(false);
    }, 2000);
  };
  
  // Handle meeting selection
  function handleMeetingSelect(e) {
    const meetingId = e.target.value;
    setSelectedMeetingId(meetingId);
    
    if (meetingId) {
      const meeting = meetings.find(m => m.id === meetingId);
      if (meeting) {
        setMeetingName(meeting.name);
      }
    } else {
      setMeetingName('');
    }
  }
  
  // Handle saving a meeting from the meeting form
  function handleSaveMeeting(meeting) {
    // Call the parent's onSaveMeeting function to persist the meeting
    if (onSaveMeeting) {
      const savedMeeting = onSaveMeeting(meeting);
      if (savedMeeting) {
        setSelectedMeetingId(savedMeeting.id);
        setMeetingName(savedMeeting.name);
      }
    }
    
    // Close the form
    setShowMeetingForm(false);
  }
  
  // Common styles for form elements
  const labelStyle = {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: '500',
    marginBottom: '0.25rem',
    color: darkMode ? '#e5e7eb' : '#4b5563'
  };
  
  const inputStyle = {
    width: '100%',
    padding: '0.5rem 0.75rem',
    borderRadius: '0.375rem',
    backgroundColor: darkMode ? '#1f2937' : '#ffffff',
    color: darkMode ? '#e5e7eb' : '#1f2937',
    border: darkMode ? '1px solid #4b5563' : '1px solid #d1d5db',
    fontSize: '0.875rem'
  };
  
  const errorStyle = { 
    color: '#ef4444', 
    fontSize: '0.75rem', 
    marginTop: '0.25rem' 
  };
  
  const checkboxStyle = {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '0.5rem'
  };
  
  const buttonStyle = {
    backgroundColor: darkMode ? '#2563eb' : '#3b82f6',
    color: 'white',
    padding: '0.5rem 0.75rem',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem'
  };
  
  return (
    <div className="p-4 max-w-3xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4 md:mb-0">
          Activities
        </h1>
        
        {/* Show the form toggle button only when form is hidden */}
        {!showForm && (
          <button
            className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-200"
            onClick={() => setShowForm(true)}
            title="Log new activity"
            aria-label="Log new activity"
            style={{ 
              fontSize: '1.5rem', 
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '0.5rem'
            }}
          >
            <i className="fa-solid fa-scroll"></i>
          </button>
        )}
      </div>
      
      {/* Log New Activity Form */}
      {showForm && (
        <div className={`bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4 mb-6 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
          <div className="flex justify-between items-center mb-4">
            {/* Close button inside card */}
            <button
              className="text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors duration-200"
              onClick={() => setShowForm(false)}
              title="Hide activity form"
              aria-label="Hide activity form"
              style={{ 
                fontSize: '1.25rem', 
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '0.25rem'
              }}
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
            <h2 className="text-xl font-semibold">Log New Activity</h2>
            
            
          </div>
          
          {/* Success message */}
          {showSuccess && (
            <div style={{
              backgroundColor: darkMode ? '#064e3b' : '#d1fae5',
              color: darkMode ? '#6ee7b7' : '#065f46',
              padding: '0.75rem',
              borderRadius: '0.375rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
              fontWeight: '500',
              fontSize: '0.875rem'
            }}>
              <i className="fas fa-check-circle mr-2"></i>
              Activity saved successfully!
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            {/* Activity Type */}
            <div style={{ marginBottom: '1rem', maxWidth: '100%' }}>
              <label style={labelStyle}>
                Activity Type
              </label>
              <select
                style={{...inputStyle, maxWidth: '100%', boxSizing: 'border-box'}}
                value={activityType}
                onChange={(e) => setActivityType(e.target.value)}
              >
                <option value="prayer">Prayer</option>
                <option value="meditation">Meditation</option>
                <option value="literature">Reading Literature</option>
                <option value="service">Service Work</option>
                <option value="call">Call</option>
                <option value="meeting">AA Meeting</option>
              </select>
              {errors.activityType && (
                <p style={errorStyle}>{errors.activityType}</p>
              )}
            </div>
            
            {/* Duration dropdown */}
            <div style={{ marginBottom: '1rem', maxWidth: '100%' }}>
              <label style={labelStyle}>
                Duration
              </label>
              <select
                style={{...inputStyle, maxWidth: '100%', boxSizing: 'border-box'}}
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              >
                {getDurationOptions()}
              </select>
              {errors.duration && (
                <p style={errorStyle}>{errors.duration}</p>
              )}
            </div>
            
            {/* Date picker */}
            <div style={{ marginBottom: '1rem', maxWidth: '100%' }}>
              <label style={labelStyle}>
                Date
              </label>
              <input
                type="date"
                style={{...inputStyle, maxWidth: '100%', boxSizing: 'border-box'}}
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
              {errors.date && (
                <p style={errorStyle}>{errors.date}</p>
              )}
            </div>
            
            {/* Call Type Options - only for Call activity type */}
            {activityType === 'call' && (
              <div style={{ marginBottom: '1rem', maxWidth: '100%' }}>
                <label style={{...labelStyle, marginBottom: '0.5rem'}}>
                  Call Type
                </label>
                <div style={{...checkboxStyle, maxWidth: '100%'}}>
                  <input
                    type="checkbox"
                    id="isSponsorCall"
                    checked={isSponsorCall}
                    onChange={() => setIsSponsorCall(!isSponsorCall)}
                    style={{ marginRight: '0.5rem' }}
                  />
                  <label 
                    htmlFor="isSponsorCall"
                    style={{
                      fontSize: '0.875rem',
                      color: darkMode ? '#e5e7eb' : '#4b5563'
                    }}
                  >
                    Sponsor
                  </label>
                </div>
                <div style={{...checkboxStyle, maxWidth: '100%'}}>
                  <input
                    type="checkbox"
                    id="isSponseeCall"
                    checked={isSponseeCall}
                    onChange={() => setIsSponseeCall(!isSponseeCall)}
                    style={{ marginRight: '0.5rem' }}
                  />
                  <label 
                    htmlFor="isSponseeCall"
                    style={{
                      fontSize: '0.875rem',
                      color: darkMode ? '#e5e7eb' : '#4b5563'
                    }}
                  >
                    Sponsee
                  </label>
                </div>
                <div style={{...checkboxStyle, maxWidth: '100%'}}>
                  <input
                    type="checkbox"
                    id="isAAMemberCall"
                    checked={isAAMemberCall}
                    onChange={() => setIsAAMemberCall(!isAAMemberCall)}
                    style={{ marginRight: '0.5rem' }}
                  />
                  <label 
                    htmlFor="isAAMemberCall"
                    style={{
                      fontSize: '0.875rem',
                      color: darkMode ? '#e5e7eb' : '#4b5563'
                    }}
                  >
                    AA Member
                  </label>
                </div>
                {errors.callType && (
                  <p style={errorStyle}>{errors.callType}</p>
                )}
              </div>
            )}
            
            {/* Literature Title - only for Reading Literature */}
            {activityType === 'literature' && (
              <div style={{ marginBottom: '1rem', maxWidth: '100%' }}>
                <label style={labelStyle}>
                  Literature Title
                </label>
                <input
                  type="text"
                  style={{...inputStyle, maxWidth: '100%', boxSizing: 'border-box'}}
                  placeholder="Enter title of what you were reading"
                  value={literatureTitle}
                  onChange={(e) => setLiteratureTitle(e.target.value)}
                />
                {errors.literatureTitle && (
                  <p style={errorStyle}>{errors.literatureTitle}</p>
                )}
              </div>
            )}
            
            {/* Meeting Selection - only for AA Meeting */}
            {activityType === 'meeting' && !showMeetingForm && (
              <div style={{ marginBottom: '1rem', maxWidth: '100%' }}>
                <label style={labelStyle}>
                  Select Meeting
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', maxWidth: '100%' }}>
                  <select
                    style={{ ...inputStyle, flex: '1', maxWidth: 'calc(100% - 60px)', boxSizing: 'border-box' }}
                    value={selectedMeetingId}
                    onChange={handleMeetingSelect}
                  >
                    <option value="">-- Select a meeting --</option>
                    {meetings.map(meeting => (
                      <option key={meeting.id} value={meeting.id}>
                        {meeting.name} {meeting.location ? `(${meeting.location})` : ''}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowMeetingForm(true)}
                    style={{
                      padding: '0.5rem 0.75rem',
                      backgroundColor: darkMode ? '#4b5563' : '#e5e7eb',
                      color: darkMode ? '#e5e7eb' : '#4b5563',
                      border: 'none',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                      width: '50px',
                      flexShrink: 0
                    }}
                  >
                    New
                  </button>
                </div>
              </div>
            )}
            
            {/* Meeting Form */}
            {activityType === 'meeting' && showMeetingForm && (
              <div style={{ marginBottom: '1rem', padding: '0.75rem', borderRadius: '0.375rem', backgroundColor: darkMode ? '#1f2937' : '#f3f4f6' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: '500', color: darkMode ? '#e5e7eb' : '#374151' }}>Add New Meeting</h3>
                  <button
                    type="button"
                    onClick={() => setShowMeetingForm(false)}
                    style={{
                      backgroundColor: 'transparent',
                      color: darkMode ? '#9ca3af' : '#6b7280',
                      border: 'none',
                      padding: '0.25rem',
                      borderRadius: '0.25rem',
                      fontSize: '1rem',
                      cursor: 'pointer'
                    }}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
                <MeetingForm
                  darkMode={darkMode}
                  onSave={handleSaveMeeting}
                  onCancel={() => setShowMeetingForm(false)}
                />
              </div>
            )}
            
            {/* Meeting Details - only for AA Meeting when not adding a new meeting */}
            {activityType === 'meeting' && !showMeetingForm && (
              <div style={{ marginBottom: '1rem', maxWidth: '100%' }}>
                <label style={labelStyle}>
                  Your Role
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '100%' }}>
                  <div style={{...checkboxStyle, maxWidth: '100%'}}>
                    <input
                      type="checkbox"
                      id="wasChair"
                      checked={wasChair}
                      onChange={() => setWasChair(!wasChair)}
                      style={{ marginRight: '0.5rem' }}
                    />
                    <label 
                      htmlFor="wasChair"
                      style={{
                        fontSize: '0.875rem',
                        color: darkMode ? '#e5e7eb' : '#4b5563'
                      }}
                    >
                      I chaired the meeting
                    </label>
                  </div>
                  <div style={{...checkboxStyle, maxWidth: '100%'}}>
                    <input
                      type="checkbox"
                      id="wasShare"
                      checked={wasShare}
                      onChange={() => setWasShare(!wasShare)}
                      style={{ marginRight: '0.5rem' }}
                    />
                    <label 
                      htmlFor="wasShare"
                      style={{
                        fontSize: '0.875rem',
                        color: darkMode ? '#e5e7eb' : '#4b5563'
                      }}
                    >
                      I shared during the meeting
                    </label>
                  </div>
                  <div style={{...checkboxStyle, maxWidth: '100%'}}>
                    <input
                      type="checkbox"
                      id="wasSpeaker"
                      checked={wasSpeaker}
                      onChange={() => setWasSpeaker(!wasSpeaker)}
                      style={{ marginRight: '0.5rem' }}
                    />
                    <label 
                      htmlFor="wasSpeaker"
                      style={{
                        fontSize: '0.875rem',
                        color: darkMode ? '#e5e7eb' : '#4b5563'
                      }}
                    >
                      I was the speaker
                    </label>
                  </div>
                </div>
              </div>
            )}
            
            {/* Notes field */}
            <div style={{ marginBottom: '1.5rem', maxWidth: '100%' }}>
              <label style={labelStyle}>
                Notes (optional)
              </label>
              <textarea
                style={{ 
                  ...inputStyle, 
                  minHeight: '5rem', 
                  resize: 'vertical', 
                  maxWidth: '100%', 
                  boxSizing: 'border-box',
                  overflowX: 'hidden'
                }}
                placeholder="Enter any additional details..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              ></textarea>
            </div>
            
            {/* Submit button */}
            <button 
              type="submit" 
              style={buttonStyle}
            >
              <i className="fas fa-save mr-1"></i>
              Save Activity
            </button>
          </form>
        </div>
      )}
      
      {/* Activity List Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
            Activity History
          </h2>
          
          {/* Activity Type Filter */}
          <div className="w-1/2 md:w-1/3">
            <select
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Activities</option>
              <option value="prayer">Prayer</option>
              <option value="meditation">Meditation</option>
              <option value="literature">Reading Literature</option>
              <option value="service">Service Work</option>
              <option value="call">Call</option>
              <option value="meeting">AA Meeting</option>
            </select>
          </div>
        </div>
        
        {/* Activities List */}
        <ActivityList 
          activities={activities}
          darkMode={darkMode}
          filter={filter}
          showDate={true}
        />
        
        {/* Show form toggle if empty */}
        {(activities.length === 0 || (filter !== 'all' && activities.filter(a => a.type === filter).length === 0)) && !showForm && (
          <div className="text-center mt-4">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              No activities to display.
            </p>
            <button 
              className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200"
              onClick={() => setShowForm(true)}
              title="Log new activity"
              aria-label="Log new activity"  
              style={{ 
                fontSize: '1.5rem', 
                background: 'transparent',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <i className="fa-solid fa-scroll"></i>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}