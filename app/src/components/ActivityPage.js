import React, { useState } from 'react';
import ActivityList from './ActivityList';
import LogActivityModal from './LogActivityModal';

/**
 * ActivityPage component - displays activity list with filtering and a modal for logging new activities
 */
export default function ActivityPage({ setCurrentView, onSave, onSaveMeeting, activities = [], meetings = [] }) {
  // State for toggling modal visibility
  const [showModal, setShowModal] = useState(false);
  
  // State for activity filter
  const [filter, setFilter] = useState('all');
  
  // Handle activity filtering
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  };
  
  // Handle opening the activity modal
  const handleOpenModal = () => {
    setShowModal(true);
  };
  
  // Handle closing the activity modal
  const handleCloseModal = () => {
    setShowModal(false);
  };
  
  return (
    <div className="p-4 max-w-3xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4 md:mb-0">
          Activities
        </h1>
        
        {/* Button to open activity modal */}
        <button
          className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-200"
          onClick={handleOpenModal}
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
      </div>
      
      {/* Activity Log Modal Dialog */}
      <LogActivityModal 
        open={showModal}
        onClose={handleCloseModal}
        onSave={onSave}
        onSaveMeeting={onSaveMeeting}
        meetings={meetings}
      />
      
      {/* Activity Filter and List */}
      <div>
        <div className="flex space-x-2 mb-4 overflow-x-auto pb-2">
          <button
            className={`px-3 py-1 rounded-full text-sm ${filter === 'all' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}
            onClick={() => handleFilterChange('all')}
          >
            All
          </button>
          <button
            className={`px-3 py-1 rounded-full text-sm ${filter === 'prayer' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}
            onClick={() => handleFilterChange('prayer')}
          >
            Prayer
          </button>
          <button
            className={`px-3 py-1 rounded-full text-sm ${filter === 'meditation' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}
            onClick={() => handleFilterChange('meditation')}
          >
            Meditation
          </button>
          <button
            className={`px-3 py-1 rounded-full text-sm ${filter === 'literature' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}
            onClick={() => handleFilterChange('literature')}
          >
            Reading
          </button>
          <button
            className={`px-3 py-1 rounded-full text-sm ${filter === 'meeting' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}
            onClick={() => handleFilterChange('meeting')}
          >
            Meetings
          </button>
          <button
            className={`px-3 py-1 rounded-full text-sm ${filter === 'call' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}
            onClick={() => handleFilterChange('call')}
          >
            Calls
          </button>
          <button
            className={`px-3 py-1 rounded-full text-sm ${filter === 'service' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}
            onClick={() => handleFilterChange('service')}
          >
            Service
          </button>
        </div>
        
        <ActivityList activities={activities} filter={filter} />
        
        {/* Show empty state with button to add activity */}
        {(activities.length === 0 || (filter !== 'all' && activities.filter(a => a.type === filter).length === 0)) && (
          <div className="text-center mt-8 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {activities.length === 0 
                ? "You haven't logged any activities yet." 
                : `No ${filter} activities found.`}
            </p>
            <button 
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
              onClick={handleOpenModal}
            >
              <i className="fas fa-plus mr-2"></i>
              Log Your First Activity
            </button>
          </div>
        )}
      </div>
    </div>
  );
}