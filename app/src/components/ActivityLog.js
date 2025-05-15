import React, { useState, useEffect } from 'react';
import { formatDateForDisplay } from '../utils/dateUtils';
import ActivityList from './ActivityList';
import MeetingForm from './MeetingForm';
import { meetingOperations } from '../utils/database';

export default function ActivityLog({ setCurrentView, onSave, activities, meetings = [] }) {
  // Check for dark mode
  const darkMode = document.documentElement.classList.contains('dark');
  // Re-render when dark mode changes
  const [isDarkMode, setIsDarkMode] = useState(darkMode);
  
  useEffect(() => {
    // Watch for dark mode changes
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

  const [activityType, setActivityType] = useState('prayer');
  const [duration, setDuration] = useState('15');
  // Initialize with current date in YYYY-MM-DD format
  const today = new Date();
  const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const [date, setDate] = useState(formattedDate);
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
    
    console.log("Form submission - date value:", date);
    
    // Validate form
    const newErrors = {};
    if (!activityType) newErrors.activityType = 'Activity type is required';
    if (!duration) newErrors.duration = 'Duration is required';
    if (!date) newErrors.date = 'Date is required';
    
    // Validate activity-specific fields
    if (activityType === 'literature' && !literatureTitle.trim()) {
      newErrors.literatureTitle = 'Literature title is required';
    }
    
    if (activityType === 'meeting' && !meetingName.trim()) {
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
    
    // Create new activity object with core fields - store the date string directly
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
    
    console.log("Saving activity:", newActivity);
    
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
    setShowMeetingForm(false);
    
    // If the meeting is saved to the database, it will show up in the meetings list
    // on the next render, so we can just select it
    if (meeting && meeting.id) {
      setSelectedMeetingId(meeting.id);
      setMeetingName(meeting.name);
    }
  }

  // Get activity icon
  const getActivityIcon = (type) => {
    switch (type) {
      case 'prayer': return 'fa-pray';
      case 'meditation': return 'fa-om';
      case 'literature': return 'fa-book-open';
      case 'service': return 'fa-hands-helping';
      case 'sponsor': return 'fa-phone';
      case 'sponsee': return 'fa-user-friends';
      case 'aa_call': return 'fa-phone-alt';
      case 'call': return 'fa-phone';
      case 'meeting': return 'fa-users';
      case 'multiple': return 'fa-phone';
      default: return 'fa-check-circle';
    }
  };
  
  // Use the shared date formatting function from utils
  const formatDate = formatDateForDisplay;

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

  return (
    <div className="p-3 pb-16 max-w-md mx-auto content-scrollable">
      {/* Page header */}
      <div style={{ 
        textAlign: 'center',
        marginBottom: '1rem'
      }}>
        <h1 style={{ 
          fontSize: '1.3rem', 
          fontWeight: 'bold',
          color: darkMode ? '#f3f4f6' : '#1f2937',
          marginBottom: '0.5rem'
        }}>Log New Activity</h1>
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
        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>
            Activity Type
          </label>
          <select
            style={inputStyle}
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
        
        {/* Duration - now a dropdown with increments based on activity type */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>
            Duration
          </label>
          <select
            style={inputStyle}
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          >
            {getDurationOptions()}
          </select>
          {errors.duration && (
            <p style={errorStyle}>{errors.duration}</p>
          )}
        </div>
        
        {/* Call Type Options - only for Call activity type */}
        {activityType === 'call' && (
          <div style={{ marginBottom: '1rem' }}>
            <label style={{...labelStyle, marginBottom: '0.5rem'}}>
              Call Type
            </label>
            <div style={checkboxStyle}>
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
            <div style={checkboxStyle}>
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
            <div style={checkboxStyle}>
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
          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>
              Literature Title
            </label>
            <input
              type="text"
              style={inputStyle}
              placeholder="Enter title of what you were reading"
              value={literatureTitle}
              onChange={(e) => setLiteratureTitle(e.target.value)}
            />
            {errors.literatureTitle && (
              <p style={errorStyle}>{errors.literatureTitle}</p>
            )}
          </div>
        )}
        
        {/* Meeting Name - only for AA Meeting */}
        {activityType === 'meeting' && (
          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>
              Meeting Name
            </label>
            <input
              type="text"
              style={inputStyle}
              placeholder="Enter name of the meeting"
              value={meetingName}
              onChange={(e) => setMeetingName(e.target.value)}
            />
            {errors.meetingName && (
              <p style={errorStyle}>{errors.meetingName}</p>
            )}
          </div>
        )}
        
        {/* Meeting Options - only for AA Meeting */}
        {activityType === 'meeting' && (
          <div style={{ marginBottom: '1rem' }}>
            <label style={{...labelStyle, marginBottom: '0.5rem'}}>
              Meeting Role
            </label>
            <div style={checkboxStyle}>
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
                I chaired this meeting
              </label>
            </div>
            <div style={checkboxStyle}>
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
                I shared during this meeting
              </label>
            </div>
            <div style={checkboxStyle}>
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
                I was the speaker at this meeting
              </label>
            </div>
          </div>
        )}
        
        {/* Date */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>
            Date
          </label>
          <input
            type="date"
            style={inputStyle}
            value={date}
            onChange={(e) => {
              console.log("Date changed:", e.target.value);
              setDate(e.target.value);
            }}
            max={formattedDate}
          />
          {errors.date && (
            <p style={errorStyle}>{errors.date}</p>
          )}
        </div>
        
        {/* Notes - kept as is */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={labelStyle}>
            Notes (optional)
          </label>
          <textarea
            style={inputStyle}
            placeholder="Add any notes about this activity..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows="3"
          ></textarea>
        </div>
        
        {/* Submit Button */}
        <button
          type="submit"
          style={{
            width: '100%',
            padding: '0.625rem 1rem',
            backgroundColor: darkMode ? '#2563eb' : '#3b82f6',
            color: '#ffffff',
            borderRadius: '0.375rem',
            fontWeight: '500',
            fontSize: '0.875rem',
            border: 'none',
            cursor: 'pointer',
            marginBottom: '2rem'
          }}
        >
          Save Activity
        </button>
      </form>
      
      {/* All Activities Section */}
      <div className={`rounded-lg p-3 mb-8 max-h-[60vh] overflow-y-auto ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
        <ActivityList 
          activities={activities}
          darkMode={darkMode}
          limit={10}
          showDate={true}
          title="Activity History"
        />
      </div>
    </div>
  );
}