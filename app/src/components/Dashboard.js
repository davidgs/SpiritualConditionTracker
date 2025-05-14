import React from 'react';
import logoImg from '../assets/logo-small.png';

export default function Dashboard({ setCurrentView, user, activities, spiritualFitness }) {
  // Get recent activities (last 5)
  const recentActivities = activities
    ? [...activities].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5)
    : [];

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

  // Calculate sobriety information if user has a sobriety date
  const sobrietyDays = user?.sobrietyDate 
    ? window.db?.calculateSobrietyDays(user.sobrietyDate) || 0
    : 0;
  
  const sobrietyYears = user?.sobrietyDate 
    ? window.db?.calculateSobrietyYears(user.sobrietyDate, 2) || 0
    : 0;

  return (
    <div className="p-4 pb-20 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Your Dashboard</h1>
          <p className="text-sm text-gray-500">Track your spiritual journey</p>
        </div>
        <div className="bg-blue-50 p-1 rounded-full">
          <img 
            src={logoImg} 
            alt="App Logo" 
            className="h-10 w-10 object-cover rounded-full border-2 border-blue-100"
            style={{ maxWidth: '40px', maxHeight: '40px' }}
          />
        </div>
      </div>
      
      {/* Sobriety & Spiritual Fitness Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-md p-4 text-center border border-gray-100">
          <div className="flex flex-col h-full justify-between">
            <h3 className="text-lg font-semibold text-gray-700 mb-1">Sobriety</h3>
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-1">{sobrietyDays}</div>
              <div className="text-sm text-gray-500">days</div>
              <div className="text-md text-gray-700 mt-1">{sobrietyYears} years</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 text-center border border-gray-100">
          <div className="flex flex-col h-full justify-between">
            <h3 className="text-lg font-semibold text-gray-700 mb-1">Spiritual Fitness</h3>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-1">{spiritualFitness}</div>
              <div className="text-sm text-gray-500">weekly score</div>
              <button 
                className="text-blue-500 text-xs mt-1 hover:underline focus:outline-none"
                onClick={() => alert('Spiritual fitness is calculated based on your logged prayer, meditation, literature reading, meetings, and service work over the past 7 days. Higher scores reflect greater spiritual engagement.')}
              >
                How is this calculated?
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Recent Activities Section */}
      <div className="bg-white rounded-xl shadow-md p-5 mb-6 border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Recent Activities</h2>
          <button 
            className="text-blue-500 text-sm hover:underline focus:outline-none flex items-center"
            onClick={() => setCurrentView('history')}
          >
            View All <i className="fas fa-chevron-right text-xs ml-1"></i>
          </button>
        </div>
        
        {recentActivities.length > 0 ? (
          <div className="space-y-4">
            {recentActivities.map(activity => (
              <div key={activity.id} className="flex items-center border-b border-gray-100 pb-3">
                <div className="bg-blue-100 h-10 w-10 rounded-full flex items-center justify-center mr-3 shadow-sm">
                  <i className={`fas ${getActivityIcon(activity.type)} text-blue-500`}></i>
                </div>
                <div className="flex-grow">
                  <div className="font-medium text-gray-800">{activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}</div>
                  <div className="text-sm text-gray-500">
                    {activity.duration ? `${activity.duration} minutes` : 'Completed'} 
                    {activity.notes ? ` - ${activity.notes}` : ''}
                  </div>
                </div>
                <div className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">{formatDate(activity.date)}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <i className="fas fa-clipboard-list text-4xl text-gray-300 mb-3"></i>
            <p className="text-gray-600 mb-3">No activities recorded yet</p>
            <button 
              className="mt-2 bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300"
              onClick={() => setCurrentView('activity')}
            >
              <i className="fas fa-plus-circle mr-2"></i>Log Activity
            </button>
          </div>
        )}
      </div>
      
      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <button 
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-xl shadow-md flex flex-col items-center hover:shadow-lg transition-shadow"
          onClick={() => setCurrentView('activity')}
        >
          <i className="fas fa-plus-circle text-2xl mb-2"></i>
          <span className="font-medium">Log Activity</span>
        </button>
        <button 
          className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-xl shadow-md flex flex-col items-center hover:shadow-lg transition-shadow"
          onClick={() => setCurrentView('nearby')}
        >
          <i className="fas fa-users text-2xl mb-2"></i>
          <span className="font-medium">Find Nearby</span>
        </button>
      </div>
    </div>
  );
}