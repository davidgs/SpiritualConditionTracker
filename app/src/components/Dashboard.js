// Dashboard component - Main dashboard view for Spiritual Condition Tracker
import React from 'react';

export default function Dashboard({ setCurrentView, user, activities, spiritualFitness }) {
  // Get the recent 5 activities for display
  const recentActivities = activities 
    ? activities.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5)
    : [];

  // Calculate streaks for different activity types
  const calculateStreaks = () => {
    if (!activities || activities.length === 0) {
      return { meetings: 0, meditation: 0, reading: 0 };
    }

    // Group activities by type
    const grouped = activities.reduce((acc, activity) => {
      if (!acc[activity.type]) acc[activity.type] = [];
      acc[activity.type].push(activity);
      return acc;
    }, {});

    // Calculate streak for each type
    const today = new Date();
    const calculateStreak = (activities, daysBack = 7) => {
      if (!activities || activities.length === 0) return 0;
      
      activities.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      let streak = 0;
      let currentDate = new Date(today);
      
      for (let i = 0; i < daysBack; i++) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const found = activities.some(a => a.date.split('T')[0] === dateStr);
        
        if (found) {
          streak++;
        } else if (streak > 0) {
          break;
        }
        
        currentDate.setDate(currentDate.getDate() - 1);
      }
      
      return streak;
    };

    return {
      meetings: calculateStreak(grouped['meeting']),
      meditation: calculateStreak(grouped['meditation']),
      reading: calculateStreak(grouped['reading'])
    };
  };

  const streaks = calculateStreaks();
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-800">Your Recovery Journey</h2>
        <button 
          onClick={() => setCurrentView('activity')}
          className="btn-primary"
        >
          <i className="fa-solid fa-plus mr-2"></i>
          Log Activity
        </button>
      </div>
      
      {/* Spiritual Fitness Card */}
      <div className="card bg-gradient-to-r from-blue-500 to-blue-600 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium mb-1">Spiritual Fitness</h3>
            <p className="text-white text-opacity-80 text-sm">Based on your recent activities</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{spiritualFitness?.score ? spiritualFitness.score.toFixed(2) : "0.00"}%</div>
            <button 
              onClick={() => setCurrentView('fitness')}
              className="text-sm text-white text-opacity-90 hover:text-opacity-100 mt-1"
            >
              View Details <i className="fa-solid fa-arrow-right ml-1"></i>
            </button>
          </div>
        </div>
      </div>
      
      {/* Streaks */}
      <div className="card">
        <h3 className="text-lg font-medium mb-3">Current Streaks</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <i className="fa-solid fa-users text-2xl text-blue-500 mb-2"></i>
            <p className="font-semibold text-xl">{streaks.meetings}</p>
            <p className="text-sm text-gray-600">Meetings</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <i className="fa-solid fa-brain text-2xl text-green-500 mb-2"></i>
            <p className="font-semibold text-xl">{streaks.meditation}</p>
            <p className="text-sm text-gray-600">Meditation</p>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <i className="fa-solid fa-book text-2xl text-purple-500 mb-2"></i>
            <p className="font-semibold text-xl">{streaks.reading}</p>
            <p className="text-sm text-gray-600">Reading</p>
          </div>
        </div>
      </div>
      
      {/* Recent Activities */}
      <div className="card">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-medium">Recent Activities</h3>
          <button 
            onClick={() => setCurrentView('history')}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            View All
          </button>
        </div>
        
        {recentActivities.length > 0 ? (
          <div className="space-y-3">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  activity.type === 'meeting' ? 'bg-blue-100 text-blue-600' :
                  activity.type === 'meditation' ? 'bg-green-100 text-green-600' : 
                  activity.type === 'reading' ? 'bg-purple-100 text-purple-600' :
                  activity.type === 'sponsor' ? 'bg-yellow-100 text-yellow-600' :
                  activity.type === 'service' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  <i className={`
                    ${activity.type === 'meeting' ? 'fa-solid fa-users' :
                      activity.type === 'meditation' ? 'fa-solid fa-brain' : 
                      activity.type === 'reading' ? 'fa-solid fa-book' :
                      activity.type === 'sponsor' ? 'fa-solid fa-handshake' :
                      activity.type === 'service' ? 'fa-solid fa-hands-helping' : 'fa-solid fa-star'}
                  `}></i>
                </div>
                <div className="ml-3 flex-1">
                  <div className="font-medium text-gray-800">
                    {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                    {activity.name && `: ${activity.name}`}
                  </div>
                  <div className="text-sm text-gray-500">
                    {activity.duration} min · {new Date(activity.date).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-500">No activities logged yet.</p>
            <button 
              onClick={() => setCurrentView('activity')}
              className="mt-2 btn-primary"
            >
              Log Your First Activity
            </button>
          </div>
        )}
      </div>
      
      {/* Nearby AA Members Card */}
      <div className="card bg-gradient-to-r from-purple-50 to-blue-50">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium mb-1">Nearby AA Members</h3>
            <p className="text-gray-600 text-sm">Connect with others in your area</p>
          </div>
          <button 
            onClick={() => setCurrentView('nearby')}
            className="btn-primary bg-blue-500"
          >
            <i className="fa-solid fa-users mr-2"></i>
            Find Members
          </button>
        </div>
      </div>
      
      {/* Inspiration Quote */}
      <div className="card bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="text-center p-3">
          <i className="fa-solid fa-quote-left text-blue-300 text-3xl mb-3"></i>
          <p className="text-gray-700 italic">
            "First things first. This twenty-four hours. Recovery. Unity. Service. The day is now."
          </p>
          <p className="text-sm text-gray-500 mt-2">AA Wisdom</p>
        </div>
      </div>
      
      {/* Imagery */}
      <div className="card overflow-hidden">
        <div className="relative h-40 bg-blue-100 flex items-center justify-center">
          <img 
            src="https://images.unsplash.com/photo-1593811167562-9cef47bfc4d7" 
            alt="Meditation and mindfulness" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-60"></div>
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
            <p className="font-medium">Take time for yourself today</p>
            <p className="text-sm">Meditation helps maintain spiritual balance</p>
          </div>
        </div>
      </div>
    </div>
  );
};
