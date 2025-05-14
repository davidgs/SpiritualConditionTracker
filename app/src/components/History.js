import React, { useState } from 'react';
import { formatDateForDisplay } from '../utils/dateUtils';
import ActivityList from './ActivityList';

export default function History({ setCurrentView, activities }) {
  const [filter, setFilter] = useState('all');
  
  // Dark mode detection
  const darkMode = document.documentElement.classList.contains('dark');
  
  return (
    <div className="p-4 pb-20 h-full overflow-y-auto">
      <div className="flex items-center mb-6">
        <button 
          className="mr-2 text-blue-500 dark:text-blue-400"
          onClick={() => setCurrentView('dashboard')}
        >
          <i className="fas fa-arrow-left"></i>
        </button>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Activity History</h1>
      </div>
      
      {/* Activity Type Filter */}
      <div className="mb-4">
        <label className="block text-gray-700 dark:text-gray-300 mb-2">Filter by Type</label>
        <select
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
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
      
      {/* Activities List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4">
        <ActivityList 
          activities={activities}
          darkMode={darkMode}
          filter={filter}
          showDate={true}
        />
        
        {/* Show Log New Activity button if no activities or filtered to none */}
        {(activities.length === 0 || (filter !== 'all' && activities.filter(a => a.type === filter).length === 0)) && (
          <div className="text-center mt-4">
            <button 
              className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              onClick={() => setCurrentView('activity')}
            >
              Log New Activity
            </button>
          </div>
        )}
      </div>
    </div>
  );
}