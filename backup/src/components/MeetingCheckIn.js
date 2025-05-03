import React, { useState } from 'react';
import { saveActivity } from '../utils/storage';

function MeetingCheckIn({ onSuccess }) {
  const [formData, setFormData] = useState({
    type: 'meeting',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    duration: 60,
    name: '',
    location: '',
    meetingType: 'in-person',
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
      // Create an activity object for the meeting
      const activityData = {
        ...formData,
        type: 'meeting',
        date: new Date(`${formData.date}T${formData.time}`).toISOString(),
        duration: parseInt(formData.duration, 10) || 0,
        id: `meeting_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };
      
      // Save the meeting check-in
      await saveActivity(activityData);
      
      // Reset form and notify success
      setFormData({
        type: 'meeting',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().slice(0, 5),
        duration: 60,
        name: '',
        location: '',
        meetingType: 'in-person',
        notes: '',
      });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('Error saving meeting check-in:', err);
      setError('Failed to save meeting check-in. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg">
          <i className="fa-solid fa-triangle-exclamation mr-2"></i> {error}
        </div>
      )}
      
      {/* Meeting Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Meeting Format
        </label>
        <div className="flex space-x-4">
          <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
            formData.meetingType === 'in-person' 
              ? 'bg-blue-50 border-blue-300 text-blue-600' 
              : 'border-gray-200 hover:bg-gray-50'
          }`}>
            <input 
              type="radio" 
              name="meetingType" 
              value="in-person"
              checked={formData.meetingType === 'in-person'}
              onChange={handleChange}
              className="sr-only"
            />
            <i className="fa-solid fa-users text-lg mr-3"></i>
            <span>In-Person</span>
          </label>
          
          <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
            formData.meetingType === 'virtual' 
              ? 'bg-blue-50 border-blue-300 text-blue-600' 
              : 'border-gray-200 hover:bg-gray-50'
          }`}>
            <input 
              type="radio" 
              name="meetingType" 
              value="virtual"
              checked={formData.meetingType === 'virtual'}
              onChange={handleChange}
              className="sr-only"
            />
            <i className="fa-solid fa-video text-lg mr-3"></i>
            <span>Virtual</span>
          </label>
        </div>
      </div>
      
      {/* Meeting Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
          Meeting Name
        </label>
        <input
          type="text"
          name="name"
          id="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g., Home Group, First Step Meeting, etc."
          className="input-field"
          required
        />
      </div>
      
      {/* Meeting Location */}
      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
          Location {formData.meetingType === 'virtual' && '(or platform)'}
        </label>
        <input
          type="text"
          name="location"
          id="location"
          value={formData.location}
          onChange={handleChange}
          placeholder={formData.meetingType === 'virtual' 
            ? "e.g., Zoom, Google Meet, etc." 
            : "e.g., Community Center, Church, etc."
          }
          className="input-field"
        />
      </div>
      
      {/* Date and Time */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
            Date
          </label>
          <input
            type="date"
            name="date"
            id="date"
            value={formData.date}
            onChange={handleChange}
            className="input-field"
            required
          />
        </div>
        <div>
          <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2">
            Time
          </label>
          <input
            type="time"
            name="time"
            id="time"
            value={formData.time}
            onChange={handleChange}
            className="input-field"
            required
          />
        </div>
      </div>
      
      {/* Duration */}
      <div>
        <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
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
          className="input-field"
          required
        />
      </div>
      
      {/* Notes */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
          Meeting Notes (optional)
        </label>
        <textarea
          name="notes"
          id="notes"
          rows="3"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Any thoughts, reflections, or key takeaways from the meeting..."
          className="input-field"
        ></textarea>
      </div>
      
      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className={`btn-primary ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {isSubmitting ? (
            <>
              <i className="fa-solid fa-spinner fa-spin mr-2"></i>
              Checking In...
            </>
          ) : (
            <>
              <i className="fa-solid fa-check-circle mr-2"></i>
              Check In to Meeting
            </>
          )}
        </button>
      </div>
    </form>
  );
}

export default MeetingCheckIn;
