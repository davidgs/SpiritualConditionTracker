import React from 'react';
import logoImg from '../assets/logo-small.png';

export default function Dashboard({ setCurrentView, user, activities, spiritualFitness }) {
  // Simplify dark mode detection for now
  const darkMode = document.documentElement.classList.contains('dark');
  // Get recent activities (last 5)
  const recentActivities = activities
    ? [...activities].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5)
    : [];

  // Format date for display
  const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Format number with thousands separator
  const formatNumber = (number) => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
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

  // Determine whether to show years or days more prominently
  const showYearsProminent = sobrietyYears >= 1;

  return (
    <div className="p-4 pb-20 max-w-md mx-auto">
      {/* Centered logo at the top with forceful inline styles */}
      <div style={{ 
        textAlign: 'center',
        marginBottom: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '12px'
        }}>
          <img 
            src={logoImg + '?v=' + Date.now()} // Add cache-busting parameter
            alt="App Logo" 
            style={{ 
              width: '80px',
              height: '80px',
              objectFit: 'cover',
              borderRadius: '12px',
              marginLeft: 'auto',
              marginRight: 'auto'
            }}
          />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Recovery Tracker</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Track your spiritual journey</p>
      </div>
      
      {/* Sobriety & Spiritual Fitness Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div style={{
          backgroundColor: darkMode ? '#1f2937' : '#ffffff',
          borderRadius: '0.5rem',
          padding: '1rem',
          textAlign: 'left',
          border: darkMode ? '1px solid #374151' : '1px solid #e5e7eb'
        }}>
          <h3 style={{
            fontSize: '1rem',
            fontWeight: 500,
            color: darkMode ? '#d1d5db' : '#374151',
            marginBottom: '0.75rem',
            textAlign: 'left'
          }}>Sobriety</h3>
          
          {showYearsProminent ? (
            <div style={{ textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: '8px' }}>
                <span style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: 'bold', 
                  color: darkMode ? '#60a5fa' : '#3b82f6',
                  marginRight: '4px'
                }}>
                  {sobrietyYears.toFixed(2)}
                </span>
                <span style={{ 
                  fontSize: '0.875rem', 
                  color: darkMode ? '#9ca3af' : '#6b7280'
                }}>
                  years
                </span>
              </div>
              <div style={{ 
                fontSize: '0.875rem', 
                color: darkMode ? '#60a5fa' : '#3b82f6'
              }}>
                {formatNumber(sobrietyDays)} days
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: '8px' }}>
                <span style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: 'bold', 
                  color: darkMode ? '#60a5fa' : '#3b82f6',
                  marginRight: '4px'
                }}>
                  {formatNumber(sobrietyDays)}
                </span>
                <span style={{ 
                  fontSize: '0.875rem', 
                  color: darkMode ? '#9ca3af' : '#6b7280'
                }}>
                  days
                </span>
              </div>
              <div style={{ 
                fontSize: '0.875rem', 
                color: darkMode ? '#60a5fa' : '#3b82f6'
              }}>
                {sobrietyYears.toFixed(2)} years
              </div>
            </div>
          )}
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 text-center">
          <h3 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-1">Spiritual Fitness</h3>
          <div className="text-3xl font-bold text-green-500 dark:text-green-400 mb-1">{spiritualFitness}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">weekly score</div>
          <button 
            className="text-blue-500 dark:text-blue-400 text-xs mt-1"
            onClick={() => alert('Spiritual fitness is calculated based on your logged prayer, meditation, literature reading, meetings, and service work over the past 7 days. Higher scores reflect greater spiritual engagement.')}
          >
            How is this calculated?
          </button>
        </div>
      </div>
      
      {/* Recent Activities Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-800 dark:text-gray-200">Recent Activities</h2>
          <button 
            className="text-blue-500 dark:text-blue-400 text-sm"
            onClick={() => setCurrentView('history')}
          >
            View All
          </button>
        </div>
        
        {recentActivities.length > 0 ? (
          <div className="space-y-3">
            {recentActivities.map(activity => (
              <div key={activity.id} className="flex items-center border-b border-gray-100 dark:border-gray-700 pb-3">
                <div className="icon-circle bg-blue-50 dark:bg-blue-900">
                  <i className={`fas ${getActivityIcon(activity.type)} icon text-blue-500 dark:text-blue-400`}></i>
                </div>
                <div className="flex-grow">
                  <div className="font-medium text-gray-800 dark:text-gray-200">{activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {activity.duration ? `${activity.duration} minutes` : 'Completed'} 
                    {activity.notes ? ` - ${activity.notes}` : ''}
                  </div>
                </div>
                <div className="text-xs text-gray-400 dark:text-gray-500">{formatDate(activity.date)}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <i className="fas fa-clipboard-list text-3xl text-gray-300 dark:text-gray-500 mb-2"></i>
            <p className="text-gray-600 dark:text-gray-400 mb-2">No activities recorded yet</p>
            <button 
              className="mt-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              onClick={() => setCurrentView('activity')}
            >
              Log Activity
            </button>
          </div>
        )}
      </div>
      
      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <button 
          className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-lg flex flex-col items-center transition-colors"
          onClick={() => setCurrentView('activity')}
        >
          <i className="fas fa-plus-circle text-xl mb-1"></i>
          <span>Log Activity</span>
        </button>
        <button 
          className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-lg flex flex-col items-center transition-colors"
          onClick={() => setCurrentView('nearby')}
        >
          <i className="fas fa-users text-xl mb-1"></i>
          <span>Find Nearby</span>
        </button>
      </div>
    </div>
  );
}