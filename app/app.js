// Main App Component for Spiritual Condition Tracker
// Integrates components from /app/components

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Initialize the app
  initializeApp();
});

/**
 * Initializes the application and sets up the main components
 */
async function initializeApp() {
  try {
    // References to components and state
    const rootElement = document.getElementById('root');
    let currentView = 'dashboard';
    let user = null;
    let activities = [];
    let spiritualFitness = { score: 0 };
    
    // Initialize database
    await initializeDatabase();
    
    // Load user data
    const userData = await loadUserData();
    user = userData.user;
    activities = userData.activities;
    
    // Calculate spiritual fitness
    spiritualFitness = calculateSpiritualFitness(user.id, activities);
    
    // Render the navbar with currentView = 'dashboard'
    renderNavBar(currentView, (newView) => {
      currentView = newView;
      renderCurrentView(currentView, user, activities, spiritualFitness);
    });
    
    // Render the initial view (dashboard)
    renderCurrentView(currentView, user, activities, spiritualFitness);
    
    console.log('App initialized successfully');
  } catch (error) {
    console.error('Error initializing app:', error);
    renderErrorScreen('Failed to initialize the application. Please try again.');
  }
}

/**
 * Initialize the database
 */
async function initializeDatabase() {
  // Check if Database is already initialized
  if (!window.Database) {
    console.error('Database module not loaded');
    throw new Error('Database module not loaded');
  }
  
  try {
    // Initialize the database
    await window.Database.initDatabase();
    
    // Get all users
    const users = window.Database.userOperations.getAll();
    
    // If no users, create a default one
    if (!users || users.length === 0) {
      // Create default user
      const defaultUser = {
        name: 'John D.',
        sobrietyDate: '2020-01-01',
        homeGroup: 'Downtown Group',
        phone: '',
        email: '',
        privacySettings: {
          shareLocation: false,
          shareActivities: false
        }
      };
      
      window.Database.userOperations.create(defaultUser);
    }
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

/**
 * Load user data from the database
 */
async function loadUserData() {
  try {
    // Get all users (for simplicity, we'll use the first one)
    const users = window.Database.userOperations.getAll();
    
    if (users && users.length > 0) {
      const user = users[0];
      console.log('User data loaded:', user);
      
      // Load activities for this user
      const activities = window.Database.activityOperations.getAll({ 
        userId: user.id 
      });
      
      return { user, activities };
    } else {
      throw new Error('No user found in database');
    }
  } catch (error) {
    console.error('Error loading user data:', error);
    throw error;
  }
}

/**
 * Calculate spiritual fitness score
 */
function calculateSpiritualFitness(userId, activities) {
  try {
    if (!userId || !activities) {
      return { score: 0 };
    }
    
    // Calculate spiritual fitness
    const spiritualFitness = window.Database.spiritualFitnessOperations.calculateAndSave(
      userId, 
      activities
    );
    
    console.log('Spiritual fitness calculated:', spiritualFitness.score);
    
    return spiritualFitness;
  } catch (error) {
    console.error('Error calculating spiritual fitness:', error);
    return { score: 0 };
  }
}

/**
 * Render the navigation bar
 */
function renderNavBar(currentView, onNavigate) {
  // Create navigation items
  const navItems = [
    { id: 'dashboard', name: 'Home', icon: 'fas fa-home' },
    { id: 'activity', name: 'Activities', icon: 'fas fa-clipboard-list' },
    { id: 'meetings', name: 'Meetings', icon: 'fas fa-users' },
    { id: 'nearby', name: 'Nearby', icon: 'fas fa-map-marker-alt' },
    { id: 'profile', name: 'Profile', icon: 'fas fa-user' }
  ];
  
  // Create the mobile navigation HTML
  const navHTML = `
    <nav class="fixed bottom-0 left-0 right-0 bg-white flex justify-around py-3 shadow-md z-10">
      ${navItems.map(item => `
        <a id="nav-${item.id}" class="flex flex-col items-center ${currentView === item.id ? 'text-blue-500' : 'text-gray-500'} cursor-pointer">
          <i class="${item.icon} text-lg mb-1"></i>
          <span class="text-xs">${item.name}</span>
        </a>
      `).join('')}
    </nav>
  `;
  
  // If a nav container exists, remove it first
  const existingNav = document.querySelector('nav');
  if (existingNav) {
    existingNav.remove();
  }
  
  // Add navigation to the DOM
  document.body.insertAdjacentHTML('beforeend', navHTML);
  
  // Add event listeners to navigation items
  navItems.forEach(item => {
    document.getElementById(`nav-${item.id}`).addEventListener('click', () => {
      onNavigate(item.id);
    });
  });
}

/**
 * Render the current view based on the selected navigation item
 */
function renderCurrentView(currentView, user, activities, spiritualFitness) {
  const rootElement = document.getElementById('root');
  if (!rootElement) return;
  
  // Clear the root element
  rootElement.innerHTML = '';
  
  // Update navigation
  document.querySelectorAll('nav a').forEach(item => {
    item.classList.remove('text-blue-500');
    item.classList.add('text-gray-500');
  });
  
  const activeNav = document.getElementById(`nav-${currentView}`);
  if (activeNav) {
    activeNav.classList.remove('text-gray-500');
    activeNav.classList.add('text-blue-500');
  }
  
  // Render the appropriate view
  switch (currentView) {
    case 'dashboard':
      renderDashboard(rootElement, user, activities, spiritualFitness);
      break;
      
    case 'activity':
      renderTemporaryScreen(rootElement, 'Activity Log', 'Track your recovery activities');
      break;
      
    case 'meetings':
      renderTemporaryScreen(rootElement, 'Meetings', 'Find and manage meetings');
      break;
      
    case 'nearby':
      renderTemporaryScreen(rootElement, 'Nearby Members', 'Connect with other members');
      break;
      
    case 'profile':
      renderTemporaryScreen(rootElement, 'Profile', 'Manage your account settings');
      break;
      
    case 'fitness':
      renderSpiritualFitness(rootElement, spiritualFitness);
      break;
      
    default:
      renderDashboard(rootElement, user, activities, spiritualFitness);
  }
}

/**
 * Render the Dashboard component
 */
function renderDashboard(rootElement, user, activities, spiritualFitness) {
  // Adapt from app/components/Dashboard.js
  
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
  }).slice(0, 5); // Only show 5 most recent
  
  // Format fitness score
  const fitnessScore = spiritualFitness?.score || 0;
  const formattedScore = fitnessScore.toFixed(2);
  
  rootElement.innerHTML = `
    <div class="space-y-6 max-w-md mx-auto px-4 pt-4 pb-20">
      <div class="flex items-center justify-between">
        <h2 class="text-2xl font-semibold text-gray-800">Hello, ${user?.name || 'Friend'}</h2>
        <button id="log-activity-btn" class="bg-blue-500 text-white px-3 py-2 rounded-md flex items-center hover:bg-blue-600 transition">
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
            <div class="text-3xl font-bold text-green-500">${sobrietyDays}</div>
            <div class="text-sm text-gray-500 mt-1">Days</div>
          </div>
          <div class="h-10 w-px bg-gray-200"></div>
          <div class="flex flex-col items-center text-center">
            <div class="text-3xl font-bold text-green-500">${sobrietyYears.toFixed(2)}</div>
            <div class="text-sm text-gray-500 mt-1">Years</div>
          </div>
        </div>
      </div>
      
      <!-- Recent Activities -->
      <div class="bg-white p-4 rounded-xl shadow-md">
        <div class="flex justify-between items-center mb-3">
          <h3 class="text-lg font-medium text-gray-800">Recent Activities</h3>
          <button id="view-all-activities" class="text-sm text-blue-600 hover:text-blue-800">
            View All
          </button>
        </div>
        
        ${recentActivities.length > 0 ? `
          <div class="space-y-3">
            ${recentActivities.map(activity => `
              <div class="flex items-center p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
                <div class="w-10 h-10 rounded-full flex items-center justify-center ${
                  activity.type === 'meeting' ? 'bg-blue-100 text-blue-600' :
                  activity.type === 'meditation' ? 'bg-green-100 text-green-600' : 
                  activity.type === 'reading' ? 'bg-purple-100 text-purple-600' :
                  activity.type === 'sponsor' ? 'bg-yellow-100 text-yellow-600' :
                  activity.type === 'service' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
                }">
                  <i class="${
                    activity.type === 'meeting' ? 'fas fa-users' :
                    activity.type === 'meditation' ? 'fas fa-brain' : 
                    activity.type === 'reading' ? 'fas fa-book' :
                    activity.type === 'sponsor' ? 'fas fa-handshake' :
                    activity.type === 'service' ? 'fas fa-hands-helping' : 'fas fa-star'
                  }"></i>
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
  
  // Add event listeners
  document.getElementById('view-fitness-btn')?.addEventListener('click', () => {
    renderCurrentView('fitness', user, activities, spiritualFitness);
  });
  
  document.getElementById('log-activity-btn')?.addEventListener('click', () => {
    renderCurrentView('activity', user, activities, spiritualFitness);
  });
  
  document.getElementById('first-activity-btn')?.addEventListener('click', () => {
    renderCurrentView('activity', user, activities, spiritualFitness);
  });
  
  document.getElementById('find-meetings-btn')?.addEventListener('click', () => {
    renderCurrentView('meetings', user, activities, spiritualFitness);
  });
  
  document.getElementById('nearby-members-btn')?.addEventListener('click', () => {
    renderCurrentView('nearby', user, activities, spiritualFitness);
  });
  
  document.getElementById('track-progress-btn')?.addEventListener('click', () => {
    renderCurrentView('fitness', user, activities, spiritualFitness);
  });
  
  document.getElementById('view-all-activities')?.addEventListener('click', () => {
    renderCurrentView('activity', user, activities, spiritualFitness);
  });
}

/**
 * Render the Spiritual Fitness details component
 */
function renderSpiritualFitness(rootElement, spiritualFitness) {
  // Adapted from app/components/SpiritualFitness.js
  const components = spiritualFitness.components || {};
  const activityCounts = spiritualFitness.activityCounts || {};
  
  rootElement.innerHTML = `
    <div class="space-y-6 max-w-md mx-auto px-4 pt-4 pb-20">
      <div class="flex items-center justify-between">
        <h2 class="text-2xl font-semibold text-gray-800">Spiritual Fitness</h2>
        <button id="back-to-dashboard" class="text-blue-500 hover:text-blue-700">
          <i class="fas fa-arrow-left mr-1"></i> Back
        </button>
      </div>
      
      <!-- Score Card -->
      <div class="bg-blue-500 text-white p-6 rounded-xl shadow-md text-center">
        <h3 class="text-xl font-semibold mb-2">Your Score</h3>
        <div class="text-5xl font-bold mb-2">${spiritualFitness.score.toFixed(2)}</div>
        <p class="text-white text-opacity-80">Based on your activities in the last 30 days</p>
      </div>
      
      <!-- Score Breakdown -->
      <div class="bg-white p-4 rounded-xl shadow-md">
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
        
        <!-- Reading & Literature -->
        <div class="mb-6">
          <div class="flex justify-between mb-1">
            <span class="font-medium">Reading & Literature</span>
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
        
        <!-- Sponsor/Sponsee Interaction -->
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
      <div class="bg-white p-4 rounded-xl shadow-md">
        <h3 class="text-lg font-medium mb-3">Recommendations</h3>
        <ul class="space-y-2">
          ${(components.meetings || 0) < 2 ? `
            <li class="flex items-start">
              <i class="fas fa-info-circle text-blue-500 mt-1 mr-2"></i>
              <span>Try to attend more meetings to strengthen your connection with the community.</span>
            </li>
          ` : ''}
          
          ${(components.prayer || 0) < 1 ? `
            <li class="flex items-start">
              <i class="fas fa-info-circle text-blue-500 mt-1 mr-2"></i>
              <span>Consider adding more prayer and meditation to your routine.</span>
            </li>
          ` : ''}
          
          ${(components.reading || 0) < 1 ? `
            <li class="flex items-start">
              <i class="fas fa-info-circle text-blue-500 mt-1 mr-2"></i>
              <span>Reading AA literature helps reinforce recovery principles.</span>
            </li>
          ` : ''}
          
          ${Object.values(components).every(v => v >= 1) ? `
            <li class="flex items-start">
              <i class="fas fa-check-circle text-green-500 mt-1 mr-2"></i>
              <span>You're maintaining a well-balanced recovery program. Keep up the great work!</span>
            </li>
          ` : ''}
        </ul>
      </div>
    </div>
  `;
  
  // Add event listeners
  document.getElementById('back-to-dashboard')?.addEventListener('click', () => {
    renderCurrentView('dashboard', {}, [], spiritualFitness);
  });
}

/**
 * Render a temporary screen for in-development features
 */
function renderTemporaryScreen(rootElement, title, subtitle) {
  rootElement.innerHTML = `
    <div class="space-y-6 max-w-md mx-auto px-4 pt-4 pb-20">
      <div class="flex items-center justify-between">
        <h2 class="text-2xl font-semibold text-gray-800">${title}</h2>
        <button id="back-to-dashboard" class="text-blue-500 hover:text-blue-700">
          <i class="fas fa-arrow-left mr-1"></i> Back
        </button>
      </div>
      
      <div class="bg-white p-6 rounded-xl shadow-md text-center">
        <i class="fas fa-tools text-gray-400 text-5xl mb-4"></i>
        <h3 class="text-xl font-medium mb-2">${subtitle}</h3>
        <p class="text-gray-500 mb-4">This feature is coming soon!</p>
        <button id="back-to-dashboard-btn" class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition">
          Return to Dashboard
        </button>
      </div>
    </div>
  `;
  
  // Add event listeners
  document.getElementById('back-to-dashboard')?.addEventListener('click', () => {
    renderCurrentView('dashboard', {}, [], { score: 0 });
  });
  
  document.getElementById('back-to-dashboard-btn')?.addEventListener('click', () => {
    renderCurrentView('dashboard', {}, [], { score: 0 });
  });
}

/**
 * Render an error screen
 */
function renderErrorScreen(message) {
  const rootElement = document.getElementById('root');
  if (!rootElement) return;
  
  rootElement.innerHTML = `
    <div class="h-screen flex flex-col items-center justify-center p-4">
      <div class="text-center">
        <i class="fas fa-exclamation-circle text-red-500 text-5xl mb-4"></i>
        <h1 class="text-2xl font-bold text-gray-800 mb-2">Something went wrong</h1>
        <p class="text-gray-600 mb-6">${message}</p>
        <button id="reload-app" class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition">
          Reload Application
        </button>
      </div>
    </div>
  `;
  
  // Add event listener to the reload button
  document.getElementById('reload-app')?.addEventListener('click', () => {
    window.location.reload();
  });
}

// Make necessary functions available globally
window.initializeApp = initializeApp;