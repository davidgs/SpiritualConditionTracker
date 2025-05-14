// Dashboard component - adapted from the original React Native DashboardScreen.js

/**
 * Renders the dashboard screen with sobriety counter, spiritual fitness score,
 * and recent activities.
 * 
 * @param {Object} user - The user data
 * @param {Object} spiritualFitness - The spiritual fitness data
 * @param {Array} activities - The user's activities
 * @param {Function} onNavigate - Navigation function
 */
function renderDashboard(user, spiritualFitness, activities, onNavigate) {
  const rootElement = document.getElementById('root');
  if (!rootElement) return;
  
  // Calculate sobriety time
  const sobrietyDays = window.Database.calculateSobrietyDays(user.sobrietyDate);
  const sobrietyYears = window.Database.calculateSobrietyYears(user.sobrietyDate);
  
  // Get recent activities (last 30 days)
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(now.getDate() - 30);
  
  const recentActivities = activities.filter(activity => {
    const activityDate = new Date(activity.date);
    return activityDate >= thirtyDaysAgo;
  });
  
  // Format sobriety days with commas
  const formattedSobrietyDays = sobrietyDays.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  
  // Format fitness score
  const fitnessScore = spiritualFitness?.score || 0;
  const formattedScore = fitnessScore.toFixed(2);
  
  // Create HTML structure based on the src/components/Dashboard.js
  rootElement.innerHTML = `
    <div class="space-y-6 max-w-md mx-auto px-4">
      <div class="flex items-center justify-between mt-4">
        <h2 class="text-2xl font-semibold text-gray-800">Hello, ${user?.name || 'Friend'}</h2>
        <button id="log-activity-btn" class="bg-blue-500 text-white px-3 py-2 rounded-md flex items-center space-x-1 hover:bg-blue-600 transition">
          <i class="fas fa-plus mr-2"></i>
          Log Activity
        </button>
      </div>
      
      <!-- Spiritual Fitness Card -->
      <div class="bg-blue-500 text-white p-4 rounded-xl shadow-md">
        <div class="flex justify-between items-center">
          <div>
            <h3 class="text-lg font-medium mb-1">Spiritual Fitness</h3>
            <p class="text-white text-opacity-80 text-sm">Based on your recent activities</p>
          </div>
          <div class="text-right">
            <div class="text-3xl font-bold">${formattedScore}</div>
            <button id="view-fitness-btn" class="text-sm text-white text-opacity-90 hover:text-opacity-100 mt-1 flex items-center justify-end w-full">
              View Details <i class="fas fa-arrow-right ml-1"></i>
            </button>
          </div>
        </div>
      </div>
      
      <!-- Sobriety Counter -->
      <div class="bg-white p-4 rounded-xl shadow-md">
        <div class="flex justify-between items-center mb-3">
          <h3 class="text-lg font-medium text-gray-800">Sobriety</h3>
          <button id="update-sobriety-btn" class="text-sm text-blue-600 hover:text-blue-800">
            Update
          </button>
        </div>
        <div class="flex justify-around items-center my-3">
          <div class="flex flex-col items-center text-center">
            <div class="text-3xl font-bold text-green-500">${formattedSobrietyDays}</div>
            <div class="text-sm text-gray-500 mt-1">Days</div>
          </div>
          <div class="h-10 w-px bg-gray-200"></div>
          <div class="flex flex-col items-center text-center">
            <div class="text-3xl font-bold text-green-500">${sobrietyYears}</div>
            <div class="text-sm text-gray-500 mt-1">Years</div>
          </div>
        </div>
      </div>
      
      <!-- Recent Activities -->
      <div class="bg-white p-4 rounded-xl shadow-md">
        <div class="flex justify-between items-center mb-3">
          <h3 class="text-lg font-medium text-gray-800">Recent Activities</h3>
          <button class="text-sm text-blue-600 hover:text-blue-800">
            View All
          </button>
        </div>
        
        ${recentActivities.length > 0 ? `
          <div class="space-y-3">
            <div class="text-center p-3">
              <p class="text-gray-700">
                You've logged <span class="font-semibold text-blue-500">${recentActivities.length}</span> recovery 
                activities in the last 30 days.
              </p>
            </div>
          </div>
        ` : `
          <div class="text-center py-6">
            <p class="text-gray-500">No activities logged yet.</p>
            <button id="first-activity-btn" class="mt-2 bg-blue-500 text-white px-3 py-2 rounded-md hover:bg-blue-600 transition">
              Log Your First Activity
            </button>
          </div>
        `}
      </div>
      
      <!-- Quick Actions -->
      <div class="mt-6 mb-8">
        <h2 class="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <div class="grid grid-cols-3 gap-4">
          <button id="find-meetings-btn" class="text-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition">
            <i class="fas fa-users text-2xl text-blue-500 mb-2 block"></i>
            <p class="text-sm text-gray-600">Find Meetings</p>
          </button>
          
          <button id="nearby-members-btn" class="text-center p-3 bg-green-50 rounded-lg hover:bg-green-100 transition">
            <i class="fas fa-map-marker-alt text-2xl text-green-500 mb-2 block"></i>
            <p class="text-sm text-gray-600">Nearby Members</p>
          </button>
          
          <button id="track-progress-btn" class="text-center p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition">
            <i class="fas fa-chart-line text-2xl text-purple-500 mb-2 block"></i>
            <p class="text-sm text-gray-600">Track Progress</p>
          </button>
        </div>
      </div>
      
      <!-- Inspiration Quote -->
      <div class="bg-blue-50 p-4 rounded-xl shadow-md">
        <div class="text-center p-3">
          <i class="fas fa-quote-left text-blue-300 text-3xl mb-3 block"></i>
          <p class="text-gray-700 italic">
            "First things first. This twenty-four hours. Recovery. Unity. Service. The day is now."
          </p>
          <p class="text-sm text-gray-500 mt-2">AA Wisdom</p>
        </div>
      </div>
    </div>
  `;
  
  // Add event listeners (similar to the onPress handlers in React Native)
  document.getElementById('update-sobriety-btn').addEventListener('click', () => {
    onNavigate('settings');
  });
  
  document.getElementById('view-fitness-btn').addEventListener('click', () => {
    onNavigate('spiritual');
  });
  
  document.getElementById('log-activity-btn').addEventListener('click', () => {
    onNavigate('activities');
  });
  
  document.getElementById('find-meetings-btn').addEventListener('click', () => {
    onNavigate('meetings');
  });
  
  document.getElementById('nearby-members-btn').addEventListener('click', () => {
    onNavigate('nearby');
  });
  
  document.getElementById('track-progress-btn').addEventListener('click', () => {
    onNavigate('spiritual');
  });
}

// Export the function
window.renderDashboard = renderDashboard;