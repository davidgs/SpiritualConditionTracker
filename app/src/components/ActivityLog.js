// ActivityLog component for Spiritual Condition Tracker
import React from 'react';

export default function ActivityLog({ setCurrentView, onSave }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-800">Log Activity</h2>
        <button 
          onClick={() => setCurrentView('dashboard')}
          className="text-blue-500 hover:text-blue-700"
        >
          <i className="fa-solid fa-arrow-left mr-1"></i> Back
        </button>
      </div>
      
      <div className="card">
        <h3 className="text-lg font-medium mb-4">New Activity</h3>
        
        <form 
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            
            const formData = new FormData(e.target);
            const newActivity = {
              type: formData.get('activity-type'),
              name: formData.get('activity-name'),
              duration: parseInt(formData.get('activity-duration'), 10),
              date: formData.get('activity-date'),
              notes: formData.get('activity-notes'),
              id: Date.now().toString() // Simple placeholder ID
            };
            
            onSave(newActivity);
          }}
        >
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Activity Type</label>
            <select 
              name="activity-type"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="meeting">Meeting</option>
              <option value="meditation">Meditation</option>
              <option value="reading">Reading</option>
              <option value="prayer">Prayer</option>
              <option value="sponsor">Sponsor Interaction</option>
              <option value="service">Service Work</option>
            </select>
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Name (Optional)</label>
            <input 
              type="text" 
              name="activity-name"
              placeholder="Meeting name, book title, etc." 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Duration (minutes)</label>
            <input 
              type="number" 
              name="activity-duration"
              min="1" 
              defaultValue="60" 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Date</label>
            <input 
              type="date" 
              name="activity-date"
              defaultValue={new Date().toISOString().split('T')[0]} 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Notes (Optional)</label>
            <textarea 
              name="activity-notes"
              rows="3" 
              placeholder="Any additional notes..." 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>
          
          <button 
            type="submit" 
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition"
          >
            Save Activity
          </button>
        </form>
      </div>
    </div>
  );
};