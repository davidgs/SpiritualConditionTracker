import React, { useState, useEffect } from 'react';

export default function ActivityLog({ setCurrentView, onSave }) {
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
  const [duration, setDuration] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    const newErrors = {};
    if (!activityType) newErrors.activityType = 'Activity type is required';
    if (!duration) newErrors.duration = 'Duration is required';
    if (!date) newErrors.date = 'Date is required';
    
    // If there are errors, show them and don't submit
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Create new activity object
    const newActivity = {
      type: activityType,
      duration: parseInt(duration, 10),
      date: new Date(date).toISOString(),
      notes: notes.trim(),
    };
    
    // Save the activity
    onSave(newActivity);
    
    // Show success message
    setShowSuccess(true);
    
    // Reset form
    setDuration('');
    setNotes('');
    
    // Hide success message after 2 seconds
    setTimeout(() => {
      setShowSuccess(false);
    }, 2000);
  };

  // Get activity icon
  const getActivityIcon = (type) => {
    switch (type) {
      case 'prayer': return 'fa-pray';
      case 'meditation': return 'fa-om';
      case 'literature': return 'fa-book-open';
      case 'service': return 'fa-hands-helping';
      case 'sponsee': return 'fa-user-friends';
      case 'meeting': return 'fa-users';
      default: return 'fa-check-circle';
    }
  };

  return (
    <div className="p-3 pb-16 max-w-md mx-auto">
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
          <label style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: '500',
            marginBottom: '0.25rem',
            color: darkMode ? '#e5e7eb' : '#4b5563'
          }}>
            Activity Type
          </label>
          <select
            style={{
              width: '100%',
              padding: '0.5rem 0.75rem',
              borderRadius: '0.375rem',
              backgroundColor: darkMode ? '#1f2937' : '#ffffff',
              color: darkMode ? '#e5e7eb' : '#1f2937',
              border: darkMode ? '1px solid #4b5563' : '1px solid #d1d5db',
              fontSize: '0.875rem'
            }}
            value={activityType}
            onChange={(e) => setActivityType(e.target.value)}
          >
            <option value="prayer">Prayer</option>
            <option value="meditation">Meditation</option>
            <option value="literature">Reading Literature</option>
            <option value="service">Service Work</option>
            <option value="sponsee">Sponsee Call/Meeting</option>
            <option value="meeting">AA Meeting</option>
          </select>
          {errors.activityType && (
            <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>
              {errors.activityType}
            </p>
          )}
        </div>
        
        {/* Duration */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: '500',
            marginBottom: '0.25rem',
            color: darkMode ? '#e5e7eb' : '#4b5563'
          }}>
            Duration (minutes)
          </label>
          <input
            type="number"
            style={{
              width: '100%',
              padding: '0.5rem 0.75rem',
              borderRadius: '0.375rem',
              backgroundColor: darkMode ? '#1f2937' : '#ffffff',
              color: darkMode ? '#e5e7eb' : '#1f2937',
              border: darkMode ? '1px solid #4b5563' : '1px solid #d1d5db',
              fontSize: '0.875rem'
            }}
            placeholder="Enter duration in minutes"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            min="1"
          />
          {errors.duration && (
            <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>
              {errors.duration}
            </p>
          )}
        </div>
        
        {/* Date */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: '500',
            marginBottom: '0.25rem',
            color: darkMode ? '#e5e7eb' : '#4b5563'
          }}>
            Date
          </label>
          <input
            type="date"
            style={{
              width: '100%',
              padding: '0.5rem 0.75rem',
              borderRadius: '0.375rem',
              backgroundColor: darkMode ? '#1f2937' : '#ffffff',
              color: darkMode ? '#e5e7eb' : '#1f2937',
              border: darkMode ? '1px solid #4b5563' : '1px solid #d1d5db',
              fontSize: '0.875rem'
            }}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
          />
          {errors.date && (
            <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>
              {errors.date}
            </p>
          )}
        </div>
        
        {/* Notes */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: '500',
            marginBottom: '0.25rem',
            color: darkMode ? '#e5e7eb' : '#4b5563'
          }}>
            Notes (optional)
          </label>
          <textarea
            style={{
              width: '100%',
              padding: '0.5rem 0.75rem',
              borderRadius: '0.375rem',
              backgroundColor: darkMode ? '#1f2937' : '#ffffff',
              color: darkMode ? '#e5e7eb' : '#1f2937',
              border: darkMode ? '1px solid #4b5563' : '1px solid #d1d5db',
              fontSize: '0.875rem'
            }}
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
            cursor: 'pointer'
          }}
        >
          Save Activity
        </button>
      </form>
    </div>
  );
}