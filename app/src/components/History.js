function History({ setCurrentView, activities }) {
  const { useState } = React;
  const [filter, setFilter] = useState('all');
  
  // Format date for display
  const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Get icon for activity type
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
  
  // Filter activities based on selected filter
  const filteredActivities = activities
    ? activities
        .filter(activity => filter === 'all' || activity.type === filter)
        .sort((a, b) => new Date(b.date) - new Date(a.date))
    : [];
  
  return (
    <div className="p-4 pb-20">
      <div className="flex items-center mb-6">
        <button 
          className="mr-2 text-blue-500"
          onClick={() => setCurrentView('dashboard')}
        >
          <i className="fas fa-arrow-left"></i>
        </button>
        <h1 className="text-2xl font-bold">Activity History</h1>
      </div>
      
      {/* Activity Type Filter */}
      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Filter by Type</label>
        <select
          className="w-full p-2 border border-gray-300 rounded"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All Activities</option>
          <option value="prayer">Prayer</option>
          <option value="meditation">Meditation</option>
          <option value="literature">Reading Literature</option>
          <option value="service">Service Work</option>
          <option value="sponsee">Sponsee Call/Meeting</option>
          <option value="meeting">AA Meeting</option>
        </select>
      </div>
      
      {/* Activities List */}
      <div className="bg-white rounded-lg shadow">
        {filteredActivities.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {filteredActivities.map(activity => (
              <div key={activity.id} className="p-4">
                <div className="flex items-center">
                  <div className="bg-blue-100 h-10 w-10 rounded-full flex items-center justify-center mr-3">
                    <i className={`fas ${getActivityIcon(activity.type)} text-blue-500`}></i>
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between">
                      <div className="font-medium">
                        {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDate(activity.date)}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {activity.duration ? `${activity.duration} minutes` : 'Completed'}
                    </div>
                    {activity.notes && (
                      <div className="text-sm text-gray-600 mt-2 bg-gray-50 p-2 rounded">
                        {activity.notes}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <i className="fas fa-clipboard-list text-3xl mb-2"></i>
            <p>No activities found</p>
            {filter !== 'all' && (
              <p className="text-sm mt-1">Try changing the filter</p>
            )}
            <button 
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
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