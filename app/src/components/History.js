// History component for viewing activity history
import React from 'react';

export default function History({ setCurrentView, activities }) {
  // Sort activities by date, newest first
  const sortedActivities = [...(activities || [])].sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  );
  
  // Helper function for activity icon classes
  const getActivityIconClass = (type) => {
    const classes = {
      meeting: 'w-10 h-10 rounded-full flex items-center justify-center bg-blue-100 text-blue-600',
      meditation: 'w-10 h-10 rounded-full flex items-center justify-center bg-green-100 text-green-600',
      reading: 'w-10 h-10 rounded-full flex items-center justify-center bg-purple-100 text-purple-600',
      prayer: 'w-10 h-10 rounded-full flex items-center justify-center bg-indigo-100 text-indigo-600',
      sponsor: 'w-10 h-10 rounded-full flex items-center justify-center bg-yellow-100 text-yellow-600',
      service: 'w-10 h-10 rounded-full flex items-center justify-center bg-red-100 text-red-600'
    };
    return classes[type] || 'w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 text-gray-600';
  };
  
  // Helper function for activity icons
  const getActivityIcon = (type) => {
    const icons = {
      meeting: 'fa-solid fa-users',
      meditation: 'fa-solid fa-brain',
      reading: 'fa-solid fa-book',
      prayer: 'fa-solid fa-praying-hands',
      sponsor: 'fa-solid fa-handshake',
      service: 'fa-solid fa-hands-helping'
    };
    return icons[type] || 'fa-solid fa-star';
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-800">Activity History</h2>
        <button 
          onClick={() => setCurrentView('dashboard')}
          className="text-blue-500 hover:text-blue-700"
        >
          <i className="fa-solid fa-arrow-left mr-1"></i> Back
        </button>
      </div>
      
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">All Activities</h3>
        <button 
          onClick={() => setCurrentView('activity')}
          className="btn-primary"
        >
          <i className="fa-solid fa-plus mr-2"></i>
          New Activity
        </button>
      </div>
      
      {sortedActivities.length > 0 ? (
        <div className="space-y-4">
          {sortedActivities.map(activity => (
            <div key={activity.id} className="card hover:shadow-md transition">
              <div className="flex items-center">
                <div className={getActivityIconClass(activity.type)}>
                  <i className={getActivityIcon(activity.type)}></i>
                </div>
                <div className="ml-3 flex-1">
                  <div className="font-medium text-gray-800 flex justify-between">
                    <span>
                      {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                      {activity.name ? `: ${activity.name}` : ''}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(activity.date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Duration: {activity.duration} minutes
                  </div>
                  {activity.notes ? (
                    <p className="mt-2 text-sm text-gray-600">{activity.notes}</p>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-8">
          <i className="fa-solid fa-folder-open text-gray-300 text-5xl mb-3"></i>
          <h3 className="text-lg font-medium text-gray-700 mb-2">No Activities Yet</h3>
          <p className="text-gray-500 mb-4">Start tracking your recovery journey by logging your first activity.</p>
          <button 
            onClick={() => setCurrentView('activity')}
            className="btn-primary"
          >
            Log First Activity
          </button>
        </div>
      )}
    </div>
  );
};