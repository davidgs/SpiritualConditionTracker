import React, { useState } from 'react';
import { Button, Box } from '@mui/material';
import { saveActivity } from '../utils/storage';
import { Activity } from '../types/database';

interface ActivityFormProps {
  onSuccess: (activity: Activity) => void;
  onCancel?: () => void;
}

function ActivityForm({ onSuccess, onCancel }: ActivityFormProps) {
  const [formData, setFormData] = useState({
    type: 'meeting', // REQUIRED: Default type that will be applied to all activities
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    duration: 60,
    notes: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      // CRITICAL: Make sure type is never empty, as required by SQLite constraint
      const activityType = formData.type || 'meeting';
      
      // Create an activity object with guaranteed type field
      const activityData = {
        ...formData,
        type: activityType, // Explicitly set the type field to prevent SQLite errors
        date: new Date(`${formData.date}T${formData.time}`).toISOString(),
        duration: parseInt(formData.duration, 10) || 0,
        id: 0, //`activity_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      };
      
      console.log('Submitting activity with type:', activityData.type);
      
      // Try saving directly via the database API first - avoids middleware issues
      if (window.dbInitialized && window.db) {
        try {
          const result = await window.db.add('activities', activityData);
          console.log('Activity saved directly to database:', result);
          
          // Reset form and notify success
          setFormData({
            type: 'meeting',
            date: new Date().toISOString().split('T')[0],
            time: new Date().toTimeString().slice(0, 5),
            duration: 60,
            notes: ''
          });
          
          setIsSubmitting(false);
          if (typeof onSuccess === 'function') {
            onSuccess(result);
          }
          
          return; // Exit early after successful save
        } catch (dbError) {
          console.error('Error saving directly to database:', dbError);
          // Continue to saveActivity fallback
        }
      }
      
      // Standard approach if direct database access fails
      await saveActivity(activityData);
      
      // Reset form and notify success
      setFormData({
        type: 'meeting',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().slice(0, 5),
        duration: 60,
        name: '',
        notes: '',
      });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('[ ActivityForm.js ] Error saving activity:', err);
      setError('Failed to save activity. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Enhanced activity types with icons for UI display
  const activityTypes = [
    { id: 'meeting', value: 'meeting', label: 'AA Meeting', icon: 'fa-users' },
    { id: 'prayer', value: 'prayer', label: 'Prayer', icon: 'fa-pray' },
    { id: 'meditation', value: 'meditation', label: 'Meditation', icon: 'fa-brain' },
    { id: 'reading', value: 'reading', label: 'Literature Reading', icon: 'fa-book' },
    { id: 'stepwork', value: 'stepwork', label: 'Step Work', icon: 'fa-tasks' },
    { id: 'sponsor', value: 'sponsorship', label: 'Time with Sponsor/Sponsee', icon: 'fa-handshake' },
    { id: 'service', value: 'service', label: 'Service Work', icon: 'fa-hands-helping' },
    { id: 'call', value: 'call', label: 'Phone Call', icon: 'fa-phone' },
    { id: 'other', value: 'other', label: 'Other Activity', icon: 'fa-star' },
  ];
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-200 p-3 rounded-lg">
          <i className="fa-solid fa-triangle-exclamation mr-2"></i> {error}
        </div>
      )}
      
      {/* Activity Type Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Activity Type
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {activityTypes.map(type => (
            <label 
              key={type.id}
              className={`
                flex items-center p-3 border rounded-lg cursor-pointer transition-colors
                ${formData.type === type.id 
                  ? 'bg-blue-50 dark:bg-blue-900 border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-200' 
                  : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                }
              `}
            >
              <input 
                type="radio" 
                name="type" 
                value={type.value}
                checked={formData.type === type.value}
                onChange={handleChange}
                className="sr-only"
              />
              <i className={`fa-solid ${type.icon} text-lg mr-3`}></i>
              <span className="dark:text-gray-200">{type.label}</span>
            </label>
          ))}
        </div>
      </div>
      
      {/* Date and Time */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Date
          </label>
          <input
            type="date"
            name="date"
            id="date"
            value={formData.date}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
            required
          />
        </div>
        <div>
          <label htmlFor="time" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Time
          </label>
          <input
            type="time"
            name="time"
            id="time"
            value={formData.time}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
            required
          />
        </div>
      </div>
      
      {/* Duration */}
      <div>
        <label htmlFor="duration" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Duration (minutes)
        </label>
        <input
          type="number"
          name="duration"
          id="duration"
          min="1"
          max="1440"
          value={formData.duration}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
          required
        />
      </div>
      
      {/* Activity Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Activity Name (optional)
        </label>
        <input
          type="text"
          name="name"
          id="name"
          value={formData.name}
          onChange={handleChange}
          placeholder={
            formData.type === 'meeting' ? 'e.g., Home Group Meeting' :
            formData.type === 'meditation' ? 'e.g., Morning Meditation' :
            formData.type === 'reading' ? 'e.g., Big Book Chapter 5' :
            formData.type === 'sponsor' ? 'e.g., Weekly Check-in' :
            formData.type === 'service' ? 'e.g., Coffee Service' :
            'e.g., Recovery Workshop'
          }
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
        />
      </div>
      
      {/* Notes */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Notes (optional)
        </label>
        <textarea
          name="notes"
          id="notes"
          rows="3"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Any thoughts or reflections about this activity..."
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
        ></textarea>
      </div>
      
      {/* Form Actions */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'flex-end',
        gap: 2,
        mt: 3,
        px: 3, 
        py: 2
      }}>
        {onCancel && (
          <Button
            variant="contained"
            onClick={onCancel}
            color="error"
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 500,
              px: 3,
              py: 1.5
            }}
          >
            Cancel
          </Button>
        )}
        
        <Button
          variant="contained"
          type="submit"
          color="success"
          disabled={isSubmitting}
          sx={{
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 500,
            px: 3,
            py: 1.5
          }}
        >
          {isSubmitting ? 'Saving...' : 'Save'}
        </Button>
      </Box>
    </form>
  );
}

export default ActivityForm;
