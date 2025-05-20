import React, { useState } from 'react';

function DirectActivityForm({ onSuccess }) {
  const [formData, setFormData] = useState({
    type: 'meeting',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    duration: 60,
    notes: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  const activityTypes = [
    { value: 'meeting', label: 'Meeting' },
    { value: 'prayer', label: 'Prayer' },
    { value: 'meditation', label: 'Meditation' },
    { value: 'stepwork', label: 'Step Work' },
    { value: 'service', label: 'Service' },
    { value: 'call', label: 'Phone Call' },
    { value: 'reading', label: 'Literature Reading' },
    { value: 'sponsorship', label: 'Sponsor/Sponsee Work' },
    { value: 'other', label: 'Other' }
  ];
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Create an activity object with guaranteed type field
      const activityData = {
        ...formData,
        type: formData.type || 'meeting', // Always ensure type has a value
        date: new Date(`${formData.date}T${formData.time}`).toISOString(),
        duration: parseInt(formData.duration, 10) || 0,
        id: `activity_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      };
      
      console.log('Adding activity with type:', activityData.type);
      
      // If we have direct access to SQLite, add directly to avoid the issue
      if (window.dbInitialized && window.db) {
        try {
          // Add activity with guaranteed type field
          const result = await window.db.add('activities', activityData);
          console.log('Activity saved directly to database:', result);
          
          // Reset form and notify success
          setFormData({
            type: 'meeting',
            date: new Date().toISOString().split('T')[0],
            time: new Date().toTimeString().slice(0, 5),
            duration: 60,
            notes: '',
          });
          
          setIsSubmitting(false);
          if (typeof onSuccess === 'function') {
            onSuccess(result);
          }
          
          return;
        } catch (sqlError) {
          console.error('SQLite direct save error:', sqlError);
          // Fall through to localStorage approach
        }
      }
      
      // Fallback - save to localStorage directly
      const existingActivities = JSON.parse(localStorage.getItem('activities') || '[]');
      existingActivities.push(activityData);
      localStorage.setItem('activities', JSON.stringify(existingActivities));
      
      console.log('Activity saved to localStorage:', activityData);
      
      // Reset form and notify success
      setFormData({
        type: 'meeting',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().slice(0, 5),
        duration: 60,
        notes: '',
      });
      
      setIsSubmitting(false);
      if (typeof onSuccess === 'function') {
        onSuccess(activityData);
      }
    } catch (error) {
      console.error('Error saving activity:', error);
      setError('There was an error saving your activity. Please try again.');
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Add Activity</h2>
      
      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-300 mb-2">
            Activity Type
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
            required
          >
            {activityTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-2">
              Date
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-2">
              Time
            </label>
            <input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
              required
            />
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-300 mb-2">
            Duration (minutes)
          </label>
          <input
            type="number"
            name="duration"
            value={formData.duration}
            onChange={handleChange}
            min="1"
            max="720"
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-300 mb-2">
            Notes
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
            rows="3"
          ></textarea>
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Save Activity'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default DirectActivityForm;