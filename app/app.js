// Main App Component for Spiritual Condition Tracker
// Adapts components from app/components

document.addEventListener('DOMContentLoaded', function() {
  // Initialize the application
  initApp();
});

/**
 * Main init function for the app
 */
async function initApp() {
  // Setup the app state
  const appState = {
    currentView: 'dashboard',
    user: null,
    activities: [],
    spiritualFitness: { score: 0 },
    meetings: []
  };
  
  try {
    // Initialize database
    await initDatabase();
    
    // Load user data
    await loadUserData(appState);
    
    // Set up the navigation
    setupNavigation(appState);
    
    // Render the initial view
    renderView(appState);
    
    console.log('App initialized successfully');
  } catch (error) {
    console.error('Error initializing app:', error);
    showErrorScreen('Failed to initialize the application. Please try again later.');
  }
}

/**
 * Initialize the database
 */
async function initDatabase() {
  if (!window.Database) {
    throw new Error('Database module not loaded');
  }
  
  try {
    await window.Database.initDatabase();
    
    // Check if we have any users
    const users = window.Database.userOperations.getAll();
    
    if (!users || users.length === 0) {
      // Create a default user
      window.Database.userOperations.create({
        name: 'Test User',
        sobrietyDate: '2020-01-01',
        homeGroup: 'Thursday Night Group',
        phone: '555-123-4567',
        email: 'test@example.com',
        privacySettings: {
          shareLocation: false,
          shareActivities: true
        }
      });
    }
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

/**
 * Load user data
 */
async function loadUserData(appState) {
  try {
    // Get the first user
    const users = window.Database.userOperations.getAll();
    
    if (users && users.length > 0) {
      appState.user = users[0];
      console.log('User data loaded:', appState.user);
      
      // Load activities for this user
      appState.activities = window.Database.activityOperations.getAll({ 
        userId: appState.user.id 
      }) || [];
      
      // Load meetings
      appState.meetings = window.Database.meetingOperations.getAll() || [];
      
      // Calculate spiritual fitness
      appState.spiritualFitness = window.Database.spiritualFitnessOperations.calculateAndSave(
        appState.user.id, 
        appState.activities
      );
    } else {
      throw new Error('No user found in database');
    }
  } catch (error) {
    console.error('Error loading user data:', error);
    throw error;
  }
}

/**
 * Set up the navigation using app/components/NavBar.js as a template
 */
function setupNavigation(appState) {
  // Navigation item definitions
  const navItems = [
    { id: 'dashboard', name: 'Dashboard', icon: 'fa-solid fa-house' },
    { id: 'activity', name: 'Log Activity', icon: 'fa-solid fa-plus' },
    { id: 'fitness', name: 'Spiritual Fitness', icon: 'fa-solid fa-heart' },
    { id: 'history', name: 'History', icon: 'fa-solid fa-clock-rotate-left' },
    { id: 'nearby', name: 'Nearby', icon: 'fa-solid fa-users' },
    { id: 'profile', name: 'Profile', icon: 'fa-solid fa-user' }
  ];
  
  // Create mobile nav HTML
  const navHTML = `
    <!-- Mobile Navigation -->
    <nav class="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg z-10">
      <div class="flex justify-around">
        ${navItems.map(item => `
          <button 
            id="nav-${item.id}" 
            class="flex flex-col items-center py-3 flex-1 ${
              appState.currentView === item.id 
                ? 'text-blue-600' 
                : 'text-gray-500'
            }"
          >
            <i class="${item.icon} text-lg"></i>
            <span class="text-xs mt-1">${item.name}</span>
          </button>
        `).join('')}
      </div>
    </nav>
  `;
  
  // Remove any existing nav
  const existingNav = document.querySelector('nav');
  if (existingNav) {
    existingNav.remove();
  }
  
  // Add the nav to the DOM
  document.body.insertAdjacentHTML('beforeend', navHTML);
  
  // Add event listeners to nav items
  navItems.forEach(item => {
    document.getElementById(`nav-${item.id}`)?.addEventListener('click', () => {
      appState.currentView = item.id;
      renderView(appState);
    });
  });
}

/**
 * Render the current view based on appState.currentView
 */
function renderView(appState) {
  const rootElement = document.getElementById('root');
  if (!rootElement) return;
  
  // Update navigation highlighting
  const navItems = document.querySelectorAll('nav button');
  navItems.forEach(item => {
    if (item.id === `nav-${appState.currentView}`) {
      item.classList.remove('text-gray-500');
      item.classList.add('text-blue-600');
    } else {
      item.classList.remove('text-blue-600');
      item.classList.add('text-gray-500');
    }
  });
  
  // Render the appropriate view
  switch (appState.currentView) {
    case 'dashboard':
      renderDashboard(rootElement, appState);
      break;
    case 'activity':
      renderActivityLog(rootElement, appState);
      break;
    case 'fitness':
      renderSpiritualFitness(rootElement, appState);
      break;
    case 'history':
      renderHistory(rootElement, appState);
      break;
    case 'nearby':
      renderNearbyMembers(rootElement, appState);
      break;
    case 'profile':
      renderProfile(rootElement, appState);
      break;
    default:
      renderDashboard(rootElement, appState);
  }
}

/**
 * Render the Dashboard view adapted from app/components/Dashboard.js
 */
function renderDashboard(rootElement, appState) {
  // Calculate sobriety time
  const sobrietyDays = window.Database.calculateSobrietyDays(appState.user.sobrietyDate);
  const sobrietyYears = window.Database.calculateSobrietyYears(appState.user.sobrietyDate);
  
  // Get recent activities (last 30 days)
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(now.getDate() - 30);
  
  const recentActivities = appState.activities
    .filter(activity => new Date(activity.date) >= thirtyDaysAgo)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);
  
  // Calculate basic streaks
  const activityTypes = ['meeting', 'meditation', 'reading'];
  const streaks = {};
  
  activityTypes.forEach(type => {
    const typeActivities = appState.activities.filter(a => a.type === type);
    streaks[type] = calculateStreak(typeActivities);
  });
  
  function calculateStreak(activities, daysBack = 7) {
    if (!activities || activities.length === 0) return 0;
    
    activities.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    let streak = 0;
    let currentDate = new Date();
    
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
  }
  
  // Render the dashboard HTML - based on app/components/Dashboard.js
  rootElement.innerHTML = `
    <div class="space-y-6 max-w-md mx-auto px-4 pb-20 pt-4">
      <div class="flex items-center justify-between">
        <h2 class="text-2xl font-semibold text-gray-800">Your Recovery Journey</h2>
        <button id="log-activity-btn" class="btn-primary">
          <i class="fa-solid fa-plus mr-2"></i>
          Log Activity
        </button>
      </div>
      
      <!-- Spiritual Fitness Card -->
      <div class="card bg-gradient-to-r from-blue-500 to-blue-600 text-white">
        <div class="flex justify-between items-center">
          <div>
            <h3 class="text-lg font-medium mb-1">Spiritual Fitness</h3>
            <p class="text-white text-opacity-80 text-sm">Based on your recent activities</p>
          </div>
          <div class="text-right">
            <div class="text-3xl font-bold">${appState.spiritualFitness?.score.toFixed(2) || '0.00'}%</div>
            <button id="view-fitness-btn" class="text-sm text-white text-opacity-90 hover:text-opacity-100 mt-1">
              View Details <i class="fa-solid fa-arrow-right ml-1"></i>
            </button>
          </div>
        </div>
      </div>
      
      <!-- Streaks -->
      <div class="card">
        <h3 class="text-lg font-medium mb-3">Current Streaks</h3>
        <div class="grid grid-cols-3 gap-4">
          <div class="text-center p-3 bg-blue-50 rounded-lg">
            <i class="fa-solid fa-users text-2xl text-blue-500 mb-2"></i>
            <p class="font-semibold text-xl">${streaks.meeting || 0}</p>
            <p class="text-sm text-gray-600">Meetings</p>
          </div>
          <div class="text-center p-3 bg-green-50 rounded-lg">
            <i class="fa-solid fa-brain text-2xl text-green-500 mb-2"></i>
            <p class="font-semibold text-xl">${streaks.meditation || 0}</p>
            <p class="text-sm text-gray-600">Meditation</p>
          </div>
          <div class="text-center p-3 bg-purple-50 rounded-lg">
            <i class="fa-solid fa-book text-2xl text-purple-500 mb-2"></i>
            <p class="font-semibold text-xl">${streaks.reading || 0}</p>
            <p class="text-sm text-gray-600">Reading</p>
          </div>
        </div>
      </div>
      
      <!-- Recent Activities -->
      <div class="card">
        <div class="flex justify-between items-center mb-3">
          <h3 class="text-lg font-medium">Recent Activities</h3>
          <button id="view-history-btn" class="text-sm text-blue-600 hover:text-blue-800">
            View All
          </button>
        </div>
        
        ${recentActivities.length > 0 ? `
          <div class="space-y-3">
            ${recentActivities.map(activity => `
              <div class="flex items-center p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
                <div class="${getActivityIconClass(activity.type)}">
                  <i class="${getActivityIcon(activity.type)}"></i>
                </div>
                <div class="ml-3 flex-1">
                  <div class="font-medium text-gray-800">
                    ${activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                    ${activity.name ? `: ${activity.name}` : ''}
                  </div>
                  <div class="text-sm text-gray-500">
                    ${activity.duration} min · ${new Date(activity.date).toLocaleDateString()}
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        ` : `
          <div class="text-center py-6">
            <p class="text-gray-500">No activities logged yet.</p>
            <button id="first-activity-btn" class="mt-2 btn-primary">
              Log Your First Activity
            </button>
          </div>
        `}
      </div>
      
      <!-- Nearby AA Members Card -->
      <div class="card bg-gradient-to-r from-purple-50 to-blue-50">
        <div class="flex justify-between items-center">
          <div>
            <h3 class="text-lg font-medium mb-1">Nearby AA Members</h3>
            <p class="text-gray-600 text-sm">Connect with others in your area</p>
          </div>
          <button id="find-members-btn" class="btn-primary bg-blue-500">
            <i class="fa-solid fa-users mr-2"></i>
            Find Members
          </button>
        </div>
      </div>
      
      <!-- Inspiration Quote -->
      <div class="card bg-gradient-to-r from-blue-50 to-indigo-50">
        <div class="text-center p-3">
          <i class="fa-solid fa-quote-left text-blue-300 text-3xl mb-3"></i>
          <p class="text-gray-700 italic">
            "First things first. This twenty-four hours. Recovery. Unity. Service. The day is now."
          </p>
          <p class="text-sm text-gray-500 mt-2">AA Wisdom</p>
        </div>
      </div>
    </div>
  `;
  
  // Helper functions for activity icons
  function getActivityIconClass(type) {
    const classes = {
      meeting: 'w-10 h-10 rounded-full flex items-center justify-center bg-blue-100 text-blue-600',
      meditation: 'w-10 h-10 rounded-full flex items-center justify-center bg-green-100 text-green-600',
      reading: 'w-10 h-10 rounded-full flex items-center justify-center bg-purple-100 text-purple-600',
      sponsor: 'w-10 h-10 rounded-full flex items-center justify-center bg-yellow-100 text-yellow-600',
      service: 'w-10 h-10 rounded-full flex items-center justify-center bg-red-100 text-red-600'
    };
    return classes[type] || 'w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 text-gray-600';
  }
  
  function getActivityIcon(type) {
    const icons = {
      meeting: 'fa-solid fa-users',
      meditation: 'fa-solid fa-brain',
      reading: 'fa-solid fa-book',
      sponsor: 'fa-solid fa-handshake',
      service: 'fa-solid fa-hands-helping'
    };
    return icons[type] || 'fa-solid fa-star';
  }
  
  // Add event listeners
  document.getElementById('log-activity-btn')?.addEventListener('click', () => {
    appState.currentView = 'activity';
    renderView(appState);
  });
  
  document.getElementById('first-activity-btn')?.addEventListener('click', () => {
    appState.currentView = 'activity';
    renderView(appState);
  });
  
  document.getElementById('view-fitness-btn')?.addEventListener('click', () => {
    appState.currentView = 'fitness';
    renderView(appState);
  });
  
  document.getElementById('view-history-btn')?.addEventListener('click', () => {
    appState.currentView = 'history';
    renderView(appState);
  });
  
  document.getElementById('find-members-btn')?.addEventListener('click', () => {
    appState.currentView = 'nearby';
    renderView(appState);
  });
}

/**
 * Render the Activity Log screen adapted from app/components/ActivityLog.js
 */
function renderActivityLog(rootElement, appState) {
  rootElement.innerHTML = `
    <div class="space-y-6 max-w-md mx-auto px-4 pb-20 pt-4">
      <div class="flex items-center justify-between">
        <h2 class="text-2xl font-semibold text-gray-800">Log Activity</h2>
        <button id="back-to-dashboard" class="text-blue-500 hover:text-blue-700">
          <i class="fa-solid fa-arrow-left mr-1"></i> Back
        </button>
      </div>
      
      <div class="card">
        <h3 class="text-lg font-medium mb-4">New Activity</h3>
        
        <form id="activity-form" class="space-y-4">
          <div>
            <label class="block text-gray-700 text-sm font-medium mb-2">Activity Type</label>
            <select id="activity-type" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="meeting">Meeting</option>
              <option value="meditation">Meditation</option>
              <option value="reading">Reading</option>
              <option value="prayer">Prayer</option>
              <option value="sponsor">Sponsor Interaction</option>
              <option value="service">Service Work</option>
            </select>
          </div>
          
          <div>
            <label class="block text-gray-700 text-sm font-medium mb-2">Name (Optional)</label>
            <input type="text" id="activity-name" placeholder="Meeting name, book title, etc." class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
          </div>
          
          <div>
            <label class="block text-gray-700 text-sm font-medium mb-2">Duration (minutes)</label>
            <input type="number" id="activity-duration" min="1" value="60" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
          </div>
          
          <div>
            <label class="block text-gray-700 text-sm font-medium mb-2">Date</label>
            <input type="date" id="activity-date" value="${new Date().toISOString().split('T')[0]}" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
          </div>
          
          <div>
            <label class="block text-gray-700 text-sm font-medium mb-2">Notes (Optional)</label>
            <textarea id="activity-notes" rows="3" placeholder="Any additional notes..." class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
          </div>
          
          <button type="submit" class="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition">
            Save Activity
          </button>
        </form>
      </div>
    </div>
  `;
  
  // Add event listeners
  document.getElementById('back-to-dashboard')?.addEventListener('click', () => {
    appState.currentView = 'dashboard';
    renderView(appState);
  });
  
  // Handle form submission
  document.getElementById('activity-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const newActivity = {
      userId: appState.user.id,
      type: document.getElementById('activity-type').value,
      name: document.getElementById('activity-name').value,
      duration: parseInt(document.getElementById('activity-duration').value, 10),
      date: document.getElementById('activity-date').value,
      notes: document.getElementById('activity-notes').value,
    };
    
    try {
      // Add to database
      const savedActivity = window.Database.activityOperations.create(newActivity);
      
      // Update activities in app state
      appState.activities.push(savedActivity);
      
      // Recalculate spiritual fitness
      appState.spiritualFitness = window.Database.spiritualFitnessOperations.calculateAndSave(
        appState.user.id, 
        appState.activities
      );
      
      // Return to dashboard
      appState.currentView = 'dashboard';
      renderView(appState);
    } catch (error) {
      console.error('Error saving activity:', error);
      alert('There was an error saving your activity. Please try again.');
    }
  });
}

/**
 * Render the Spiritual Fitness screen adapted from app/components/SpiritualFitness.js
 */
function renderSpiritualFitness(rootElement, appState) {
  const components = appState.spiritualFitness.components || {};
  const activityCounts = appState.spiritualFitness.activityCounts || {};
  
  rootElement.innerHTML = `
    <div class="space-y-6 max-w-md mx-auto px-4 pb-20 pt-4">
      <div class="flex items-center justify-between">
        <h2 class="text-2xl font-semibold text-gray-800">Spiritual Fitness</h2>
        <button id="back-to-dashboard" class="text-blue-500 hover:text-blue-700">
          <i class="fa-solid fa-arrow-left mr-1"></i> Back
        </button>
      </div>
      
      <!-- Score Card -->
      <div class="card bg-blue-500 text-white">
        <div class="text-center">
          <h3 class="text-xl font-semibold mb-2">Your Score</h3>
          <div class="text-5xl font-bold mb-2">${appState.spiritualFitness.score.toFixed(2)}%</div>
          <p class="text-white text-opacity-80">Based on your activities in the last 30 days</p>
        </div>
      </div>
      
      <!-- Score Breakdown -->
      <div class="card">
        <h3 class="text-lg font-medium mb-4">Score Breakdown</h3>
        
        <!-- Meeting Attendance -->
        <div class="mb-6">
          <div class="flex justify-between mb-1">
            <span class="font-medium">Meeting Attendance</span>
            <span class="text-blue-600 font-medium">${(components.meetings || 0).toFixed(1)}/3.0</span>
          </div>
          <div class="h-2 bg-gray-200 rounded overflow-hidden">
            <div class="h-full bg-blue-500" style="width: ${Math.min(((components.meetings || 0) / 3) * 100, 100)}%"></div>
          </div>
          <p class="text-sm text-gray-500 mt-1">
            ${activityCounts.meeting || 0} meetings in the last 30 days
          </p>
        </div>
        
        <!-- Prayer & Meditation -->
        <div class="mb-6">
          <div class="flex justify-between mb-1">
            <span class="font-medium">Prayer & Meditation</span>
            <span class="text-green-600 font-medium">${(components.prayer || 0).toFixed(1)}/2.0</span>
          </div>
          <div class="h-2 bg-gray-200 rounded overflow-hidden">
            <div class="h-full bg-green-500" style="width: ${Math.min(((components.prayer || 0) / 2) * 100, 100)}%"></div>
          </div>
          <p class="text-sm text-gray-500 mt-1">
            ${(activityCounts.prayer || 0) + (activityCounts.meditation || 0)} sessions in the last 30 days
          </p>
        </div>
        
        <!-- Reading AA Literature -->
        <div class="mb-6">
          <div class="flex justify-between mb-1">
            <span class="font-medium">Reading AA Literature</span>
            <span class="text-purple-600 font-medium">${(components.reading || 0).toFixed(1)}/2.0</span>
          </div>
          <div class="h-2 bg-gray-200 rounded overflow-hidden">
            <div class="h-full bg-purple-500" style="width: ${Math.min(((components.reading || 0) / 2) * 100, 100)}%"></div>
          </div>
          <p class="text-sm text-gray-500 mt-1">
            ${activityCounts.reading || 0} reading sessions in the last 30 days
          </p>
        </div>
        
        <!-- Service Work -->
        <div class="mb-6">
          <div class="flex justify-between mb-1">
            <span class="font-medium">Service Work</span>
            <span class="text-yellow-600 font-medium">${(components.service || 0).toFixed(1)}/1.5</span>
          </div>
          <div class="h-2 bg-gray-200 rounded overflow-hidden">
            <div class="h-full bg-yellow-500" style="width: ${Math.min(((components.service || 0) / 1.5) * 100, 100)}%"></div>
          </div>
          <p class="text-sm text-gray-500 mt-1">
            ${activityCounts.service || 0} service activities in the last 30 days
          </p>
        </div>
        
        <!-- Sponsor Interaction -->
        <div class="mb-6">
          <div class="flex justify-between mb-1">
            <span class="font-medium">Sponsor Interaction</span>
            <span class="text-red-600 font-medium">${(components.sponsor || 0).toFixed(1)}/1.5</span>
          </div>
          <div class="h-2 bg-gray-200 rounded overflow-hidden">
            <div class="h-full bg-red-500" style="width: ${Math.min(((components.sponsor || 0) / 1.5) * 100, 100)}%"></div>
          </div>
          <p class="text-sm text-gray-500 mt-1">
            ${activityCounts.sponsor || 0} sponsor interactions in the last 30 days
          </p>
        </div>
      </div>
      
      <!-- Recommendations -->
      <div class="card">
        <h3 class="text-lg font-medium mb-3">Recommendations</h3>
        <ul class="space-y-2">
          ${(components.meetings || 0) < 2 ? `
            <li class="flex items-start">
              <i class="fa-solid fa-info-circle text-blue-500 mt-1 mr-2"></i>
              <span>Try to attend more meetings to strengthen your connection with the community.</span>
            </li>
          ` : ''}
          
          ${(components.prayer || 0) < 1 ? `
            <li class="flex items-start">
              <i class="fa-solid fa-info-circle text-blue-500 mt-1 mr-2"></i>
              <span>Consider adding more prayer and meditation to your routine.</span>
            </li>
          ` : ''}
          
          ${(components.reading || 0) < 1 ? `
            <li class="flex items-start">
              <i class="fa-solid fa-info-circle text-blue-500 mt-1 mr-2"></i>
              <span>Reading AA literature helps reinforce recovery principles.</span>
            </li>
          ` : ''}
          
          ${Object.values(components).every(v => v >= 1) ? `
            <li class="flex items-start">
              <i class="fa-solid fa-check-circle text-green-500 mt-1 mr-2"></i>
              <span>You're maintaining a well-balanced recovery program. Keep up the great work!</span>
            </li>
          ` : ''}
        </ul>
      </div>
    </div>
  `;
  
  // Add event listeners
  document.getElementById('back-to-dashboard')?.addEventListener('click', () => {
    appState.currentView = 'dashboard';
    renderView(appState);
  });
}

/**
 * Render History screen adapted from app/components/History.js
 */
function renderHistory(rootElement, appState) {
  // Sort activities by date, newest first
  const sortedActivities = [...appState.activities].sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  );
  
  rootElement.innerHTML = `
    <div class="space-y-6 max-w-md mx-auto px-4 pb-20 pt-4">
      <div class="flex items-center justify-between">
        <h2 class="text-2xl font-semibold text-gray-800">Activity History</h2>
        <button id="back-to-dashboard" class="text-blue-500 hover:text-blue-700">
          <i class="fa-solid fa-arrow-left mr-1"></i> Back
        </button>
      </div>
      
      <div class="flex justify-between items-center">
        <h3 class="text-lg font-medium">All Activities</h3>
        <button id="log-new-activity" class="btn-primary">
          <i class="fa-solid fa-plus mr-2"></i>
          New Activity
        </button>
      </div>
      
      ${sortedActivities.length > 0 ? `
        <div class="space-y-4">
          ${sortedActivities.map(activity => `
            <div class="card hover:shadow-md transition">
              <div class="flex items-center">
                <div class="${getActivityIconClass(activity.type)}">
                  <i class="${getActivityIcon(activity.type)}"></i>
                </div>
                <div class="ml-3 flex-1">
                  <div class="font-medium text-gray-800 flex justify-between">
                    <span>${activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}${activity.name ? `: ${activity.name}` : ''}</span>
                    <span class="text-sm text-gray-500">${new Date(activity.date).toLocaleDateString()}</span>
                  </div>
                  <div class="text-sm text-gray-600">
                    Duration: ${activity.duration} minutes
                  </div>
                  ${activity.notes ? `<p class="mt-2 text-sm text-gray-600">${activity.notes}</p>` : ''}
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      ` : `
        <div class="card text-center py-8">
          <i class="fa-solid fa-folder-open text-gray-300 text-5xl mb-3"></i>
          <h3 class="text-lg font-medium text-gray-700 mb-2">No Activities Yet</h3>
          <p class="text-gray-500 mb-4">Start tracking your recovery journey by logging your first activity.</p>
          <button id="start-activity-btn" class="btn-primary">Log First Activity</button>
        </div>
      `}
    </div>
  `;
  
  // Helper functions for activity icons
  function getActivityIconClass(type) {
    const classes = {
      meeting: 'w-10 h-10 rounded-full flex items-center justify-center bg-blue-100 text-blue-600',
      meditation: 'w-10 h-10 rounded-full flex items-center justify-center bg-green-100 text-green-600',
      reading: 'w-10 h-10 rounded-full flex items-center justify-center bg-purple-100 text-purple-600',
      prayer: 'w-10 h-10 rounded-full flex items-center justify-center bg-indigo-100 text-indigo-600',
      sponsor: 'w-10 h-10 rounded-full flex items-center justify-center bg-yellow-100 text-yellow-600',
      service: 'w-10 h-10 rounded-full flex items-center justify-center bg-red-100 text-red-600'
    };
    return classes[type] || 'w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 text-gray-600';
  }
  
  function getActivityIcon(type) {
    const icons = {
      meeting: 'fa-solid fa-users',
      meditation: 'fa-solid fa-brain',
      reading: 'fa-solid fa-book',
      prayer: 'fa-solid fa-praying-hands',
      sponsor: 'fa-solid fa-handshake',
      service: 'fa-solid fa-hands-helping'
    };
    return icons[type] || 'fa-solid fa-star';
  }
  
  // Add event listeners
  document.getElementById('back-to-dashboard')?.addEventListener('click', () => {
    appState.currentView = 'dashboard';
    renderView(appState);
  });
  
  document.getElementById('log-new-activity')?.addEventListener('click', () => {
    appState.currentView = 'activity';
    renderView(appState);
  });
  
  document.getElementById('start-activity-btn')?.addEventListener('click', () => {
    appState.currentView = 'activity';
    renderView(appState);
  });
}

/**
 * Render Nearby Members screen adapted from app/components/NearbyMembers.js
 */
function renderNearbyMembers(rootElement, appState) {
  rootElement.innerHTML = `
    <div class="space-y-6 max-w-md mx-auto px-4 pb-20 pt-4">
      <div class="flex items-center justify-between">
        <h2 class="text-2xl font-semibold text-gray-800">Nearby AA Members</h2>
        <button id="back-to-dashboard" class="text-blue-500 hover:text-blue-700">
          <i class="fa-solid fa-arrow-left mr-1"></i> Back
        </button>
      </div>
      
      <div class="card">
        <div class="text-center p-6">
          <i class="fa-solid fa-location-dot text-blue-500 text-5xl mb-4"></i>
          <h3 class="text-xl font-medium mb-2">Find Members Nearby</h3>
          <p class="text-gray-600 mb-6">Connect with other AA members in your area for support and fellowship.</p>
          
          <button id="start-discovery" class="btn-primary w-full">
            <i class="fa-solid fa-broadcast-tower mr-2"></i>
            Start Discovery
          </button>
          
          <p class="text-xs text-gray-500 mt-4">
            Your privacy is protected. Your location and personal information are only shared when you choose to connect.
          </p>
        </div>
      </div>
      
      <!-- Privacy Settings Card -->
      <div class="card">
        <h3 class="text-lg font-medium mb-4">Discovery Settings</h3>
        
        <div class="flex items-center justify-between mb-4">
          <div>
            <p class="font-medium text-gray-800">Share My Location</p>
            <p class="text-sm text-gray-500">Allow nearby members to see you</p>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" id="share-location" class="sr-only peer" ${appState.user.privacySettings?.shareLocation ? 'checked' : ''}>
            <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
          </label>
        </div>
        
        <div class="flex items-center justify-between">
          <div>
            <p class="font-medium text-gray-800">Share Activities</p>
            <p class="text-sm text-gray-500">Share recent activities with connections</p>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" id="share-activities" class="sr-only peer" ${appState.user.privacySettings?.shareActivities ? 'checked' : ''}>
            <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
          </label>
        </div>
      </div>
    </div>
  `;
  
  // Add event listeners
  document.getElementById('back-to-dashboard')?.addEventListener('click', () => {
    appState.currentView = 'dashboard';
    renderView(appState);
  });
  
  document.getElementById('start-discovery')?.addEventListener('click', () => {
    alert('Discovery feature is coming soon!');
  });
  
  // Handle privacy setting changes
  document.getElementById('share-location')?.addEventListener('change', (e) => {
    updatePrivacySettings({ shareLocation: e.target.checked });
  });
  
  document.getElementById('share-activities')?.addEventListener('change', (e) => {
    updatePrivacySettings({ shareActivities: e.target.checked });
  });
  
  function updatePrivacySettings(changes) {
    try {
      // Update in app state
      appState.user.privacySettings = {
        ...appState.user.privacySettings,
        ...changes
      };
      
      // Update in database
      window.Database.userOperations.update(appState.user.id, {
        privacySettings: appState.user.privacySettings
      });
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      alert('There was an error updating your privacy settings.');
    }
  }
}

/**
 * Render Profile screen adapted from app/components/Profile.js
 */
function renderProfile(rootElement, appState) {
  // Calculate sobriety stats
  const sobrietyDays = window.Database.calculateSobrietyDays(appState.user.sobrietyDate);
  const sobrietyYears = window.Database.calculateSobrietyYears(appState.user.sobrietyDate);
  
  rootElement.innerHTML = `
    <div class="space-y-6 max-w-md mx-auto px-4 pb-20 pt-4">
      <div class="flex items-center justify-between">
        <h2 class="text-2xl font-semibold text-gray-800">Profile</h2>
        <button id="back-to-dashboard" class="text-blue-500 hover:text-blue-700">
          <i class="fa-solid fa-arrow-left mr-1"></i> Back
        </button>
      </div>
      
      <!-- Profile Card -->
      <div class="card text-center">
        <div class="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i class="fa-solid fa-user text-blue-500 text-4xl"></i>
        </div>
        <h3 class="text-xl font-semibold mb-1">${appState.user.name}</h3>
        <p class="text-gray-500 mb-4">Member since ${new Date(appState.user.createdAt).toLocaleDateString()}</p>
        
        <div class="flex justify-center space-x-8 mb-2">
          <div class="text-center">
            <div class="text-2xl font-bold text-green-500">${sobrietyDays}</div>
            <div class="text-sm text-gray-500">Days</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-green-500">${sobrietyYears.toFixed(2)}</div>
            <div class="text-sm text-gray-500">Years</div>
          </div>
        </div>
        
        <p class="text-sm text-gray-500">Sober since ${new Date(appState.user.sobrietyDate).toLocaleDateString()}</p>
      </div>
      
      <!-- Profile Form -->
      <div class="card">
        <h3 class="text-lg font-medium mb-4">Personal Information</h3>
        
        <form id="profile-form" class="space-y-4">
          <div>
            <label class="block text-gray-700 text-sm font-medium mb-2">Name</label>
            <input type="text" id="profile-name" value="${appState.user.name}" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
          </div>
          
          <div>
            <label class="block text-gray-700 text-sm font-medium mb-2">Sobriety Date</label>
            <input type="date" id="profile-sobriety-date" value="${appState.user.sobrietyDate}" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
          </div>
          
          <div>
            <label class="block text-gray-700 text-sm font-medium mb-2">Home Group</label>
            <input type="text" id="profile-home-group" value="${appState.user.homeGroup || ''}" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
          </div>
          
          <div>
            <label class="block text-gray-700 text-sm font-medium mb-2">Phone</label>
            <input type="tel" id="profile-phone" value="${appState.user.phone || ''}" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
          </div>
          
          <div>
            <label class="block text-gray-700 text-sm font-medium mb-2">Email</label>
            <input type="email" id="profile-email" value="${appState.user.email || ''}" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
          </div>
          
          <button type="submit" class="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition">
            Save Profile
          </button>
        </form>
      </div>
    </div>
  `;
  
  // Add event listeners
  document.getElementById('back-to-dashboard')?.addEventListener('click', () => {
    appState.currentView = 'dashboard';
    renderView(appState);
  });
  
  // Handle form submission
  document.getElementById('profile-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const updates = {
      name: document.getElementById('profile-name').value,
      sobrietyDate: document.getElementById('profile-sobriety-date').value,
      homeGroup: document.getElementById('profile-home-group').value,
      phone: document.getElementById('profile-phone').value,
      email: document.getElementById('profile-email').value,
    };
    
    try {
      // Update in database
      window.Database.userOperations.update(appState.user.id, updates);
      
      // Update in app state
      Object.assign(appState.user, updates);
      
      // Return to dashboard
      appState.currentView = 'dashboard';
      renderView(appState);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('There was an error updating your profile. Please try again.');
    }
  });
}

/**
 * Show an error screen when something goes wrong
 */
function showErrorScreen(message) {
  const rootElement = document.getElementById('root');
  if (!rootElement) return;
  
  rootElement.innerHTML = `
    <div class="h-screen flex flex-col items-center justify-center p-4">
      <div class="text-center">
        <i class="fa-solid fa-exclamation-circle text-red-500 text-5xl mb-4"></i>
        <h1 class="text-2xl font-bold text-gray-800 mb-2">Something went wrong</h1>
        <p class="text-gray-600 mb-6">${message}</p>
        <button id="reload-app" class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition">
          Reload Application
        </button>
      </div>
    </div>
  `;
  
  document.getElementById('reload-app')?.addEventListener('click', () => {
    window.location.reload();
  });
}

// Export the main init function globally
window.initApp = initApp;