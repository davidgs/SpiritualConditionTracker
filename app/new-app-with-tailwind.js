// Main application for Spiritual Condition Tracker
// Using Tailwind classes instead of inline styles

document.addEventListener('DOMContentLoaded', function() {
  initializeApp();
});

async function initializeApp() {
  try {
    console.log("Initializing app...");
    // Initialize database
    await window.Database.initDatabase();
    
    // Load user data
    const users = window.Database.userOperations.getAll();
    const user = users && users.length > 0 ? users[0] : null;
    
    // Load activities
    const activities = user ? window.Database.activityOperations.getAll({ 
      userId: user.id 
    }) : [];
    
    // Calculate spiritual fitness
    const spiritualFitness = window.Database.spiritualFitnessOperations.calculateAndSave(
      user?.id, 
      activities
    );
    
    // Render dashboard
    renderDashboard(user, activities, spiritualFitness);
    
    // Setup navigation
    setupNavigation();
    
  } catch (error) {
    console.error("Error initializing app:", error);
    renderErrorScreen("Failed to initialize application. Please try again.");
  }
}

function renderDashboard(user, activities, spiritualFitness) {
  // Calculate sobriety days and years
  const sobrietyDays = window.Database.calculateSobrietyDays(user?.sobrietyDate);
  const sobrietyYears = window.Database.calculateSobrietyYears(user?.sobrietyDate, 2);
  
  // Filter recent activities (last 30 days)
  const now = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(now.getDate() - 30);
  const recentActivities = activities.filter(activity => new Date(activity.date) >= thirtyDaysAgo);
  
  // Format number with commas
  const formattedSobrietyDays = sobrietyDays.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  
  // Format fitness score
  const fitnessScore = spiritualFitness?.score || 0;
  const formattedScore = fitnessScore.toFixed(2);
  
  // Render dashboard HTML
  const rootElement = document.getElementById('root');
  rootElement.innerHTML = `
    <div class="container-custom">
      <!-- Header -->
      <header class="mt-4 mb-6">
        <h1 class="text-2xl font-bold text-gray-800">Hello, ${user?.name || 'Friend'}</h1>
        <p class="text-gray-600">Your Recovery Dashboard</p>
      </header>
      
      <!-- Sobriety Counter -->
      <div class="card border-l-4 border-l-green-500">
        <div class="flex items-center mb-3">
          <i class="fas fa-calendar-check text-xl text-green-500 mr-2"></i>
          <h2 class="text-lg font-semibold text-gray-800">Sobriety</h2>
        </div>
        <div class="flex justify-around items-center my-3">
          <div class="flex flex-col items-center text-center">
            <div class="text-2xl font-bold text-green-500">${formattedSobrietyDays}</div>
            <div class="text-sm text-gray-500 mt-1">Days</div>
          </div>
          <div class="h-10 w-px bg-gray-200"></div>
          <div class="flex flex-col items-center text-center">
            <div class="text-2xl font-bold text-green-500">${sobrietyYears}</div>
            <div class="text-sm text-gray-500 mt-1">Years</div>
          </div>
        </div>
        <button id="update-sobriety-btn" class="btn-secondary w-full mt-3">Update Sobriety Date</button>
      </div>
      
      <!-- Spiritual Fitness Score -->
      <div class="card border-l-4 border-l-red-500">
        <div class="flex items-center mb-3">
          <i class="fas fa-heart text-xl text-red-500 mr-2"></i>
          <h2 class="text-lg font-semibold text-gray-800">Spiritual Fitness</h2>
        </div>
        <div class="flex justify-center my-3">
          <div class="relative w-24 h-24 rounded-full bg-red-50 border-4 border-red-500 flex justify-center items-center">
            <div class="flex items-end">
              <span class="text-3xl font-bold text-red-500 leading-none">${formattedScore}</span>
              <span class="text-sm text-red-500 mb-1 ml-1">/10</span>
            </div>
          </div>
        </div>
        <button id="view-fitness-btn" class="btn-secondary w-full mt-3">View Details</button>
      </div>
      
      <!-- Recovery Activities -->
      <div class="card border-l-4 border-l-blue-500">
        <div class="flex items-center mb-3">
          <i class="fas fa-list-alt text-xl text-blue-500 mr-2"></i>
          <h2 class="text-lg font-semibold text-gray-800">Recovery Activities</h2>
        </div>
        <div class="text-center my-3">
          <p class="text-gray-700">
            You've logged <span class="font-semibold text-blue-500">${recentActivities.length}</span> recovery 
            activities in the last 30 days.
          </p>
        </div>
        <button id="log-activity-btn" class="btn-secondary w-full mt-3">Log New Activity</button>
      </div>
      
      <!-- Quick Actions -->
      <div class="mt-6 mb-8">
        <h2 class="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <div class="flex justify-between">
          <button id="find-meetings-btn" class="flex flex-col items-center bg-white rounded-lg p-4 shadow-sm flex-1 mr-2">
            <i class="fas fa-users text-xl text-blue-500 mb-2"></i>
            <span class="text-xs text-gray-700 text-center">Find Meetings</span>
          </button>
          <button id="nearby-members-btn" class="flex flex-col items-center bg-white rounded-lg p-4 shadow-sm flex-1 mx-1">
            <i class="fas fa-map-marker-alt text-xl text-blue-500 mb-2"></i>
            <span class="text-xs text-gray-700 text-center">Nearby Members</span>
          </button>
          <button id="track-progress-btn" class="flex flex-col items-center bg-white rounded-lg p-4 shadow-sm flex-1 ml-2">
            <i class="fas fa-chart-line text-xl text-blue-500 mb-2"></i>
            <span class="text-xs text-gray-700 text-center">Track Progress</span>
          </button>
        </div>
      </div>
    </div>
  `;
  
  // Add event listeners to buttons
  document.getElementById('update-sobriety-btn').addEventListener('click', () => {
    navigateTo('profile');
  });
  
  document.getElementById('view-fitness-btn').addEventListener('click', () => {
    navigateTo('spiritual');
  });
  
  document.getElementById('log-activity-btn').addEventListener('click', () => {
    navigateTo('activities');
  });
  
  document.getElementById('find-meetings-btn').addEventListener('click', () => {
    navigateTo('meetings');
  });
  
  document.getElementById('nearby-members-btn').addEventListener('click', () => {
    navigateTo('nearby');
  });
  
  document.getElementById('track-progress-btn').addEventListener('click', () => {
    navigateTo('spiritual');
  });
}

function setupNavigation() {
  // Create the bottom navigation bar
  const navElement = document.createElement('nav');
  navElement.className = 'fixed bottom-0 left-0 right-0 bg-white flex justify-around py-3 shadow-md z-10';
  
  const screens = [
    { id: 'dashboard', icon: 'home', label: 'Home' },
    { id: 'activities', icon: 'clipboard-list', label: 'Activities' },
    { id: 'meetings', icon: 'users', label: 'Meetings' },
    { id: 'nearby', icon: 'map-marker-alt', label: 'Nearby' },
    { id: 'profile', icon: 'user', label: 'Profile' }
  ];
  
  screens.forEach(screen => {
    const navItem = document.createElement('a');
    navItem.id = `nav-${screen.id}`;
    navItem.className = `flex flex-col items-center ${screen.id === 'dashboard' ? 'text-blue-500' : 'text-gray-500'} cursor-pointer`;
    
    const icon = document.createElement('i');
    icon.className = `fas fa-${screen.icon} text-lg mb-1`;
    
    const label = document.createElement('span');
    label.textContent = screen.label;
    label.className = 'text-xs';
    
    navItem.appendChild(icon);
    navItem.appendChild(label);
    
    navItem.addEventListener('click', () => navigateTo(screen.id));
    
    navElement.appendChild(navItem);
  });
  
  document.body.appendChild(navElement);
}

function navigateTo(screenName) {
  console.log('Navigating to:', screenName);
  
  // Update active nav item
  document.querySelectorAll('[id^="nav-"]').forEach(item => {
    item.classList.remove('text-blue-500');
    item.classList.add('text-gray-500');
  });
  
  const activeNav = document.getElementById(`nav-${screenName}`);
  if (activeNav) {
    activeNav.classList.remove('text-gray-500');
    activeNav.classList.add('text-blue-500');
  }
  
  // Clear any temporary screens or modals
  const modals = document.querySelectorAll('.modal-container');
  modals.forEach(modal => modal.remove());
  
  // Handle navigation to different screens
  switch (screenName) {
    case 'dashboard':
      const users = window.Database.userOperations.getAll();
      const user = users && users.length > 0 ? users[0] : null;
      const activities = user ? window.Database.activityOperations.getAll({ userId: user.id }) : [];
      const spiritualFitness = window.Database.spiritualFitnessOperations.calculateAndSave(user?.id, activities);
      renderDashboard(user, activities, spiritualFitness);
      break;
      
    case 'activities':
      renderTemporaryScreen('Activities', 'Track your recovery activities');
      break;
      
    case 'meetings':
      renderTemporaryScreen('Meetings', 'Find and manage meetings');
      break;
      
    case 'nearby':
      renderTemporaryScreen('Nearby Members', 'Connect with other members');
      break;
      
    case 'profile':
      renderTemporaryScreen('Profile', 'Manage your personal information');
      break;
      
    case 'spiritual':
      renderSpiritualFitnessDetails();
      break;
      
    default:
      console.error('Unknown screen:', screenName);
  }
}

function renderTemporaryScreen(title, subtitle) {
  const rootElement = document.getElementById('root');
  rootElement.innerHTML = `
    <div class="container-custom">
      <header class="mt-4 mb-6">
        <h1 class="text-2xl font-bold text-gray-800">${title}</h1>
        <p class="text-gray-600">${subtitle}</p>
      </header>
      
      <div class="card">
        <div class="flex items-center mb-3">
          <i class="fas fa-code text-xl text-blue-500 mr-2"></i>
          <h2 class="text-lg font-semibold text-gray-800">Coming Soon</h2>
        </div>
        <div class="text-center my-4">
          <p class="text-gray-700">
            This screen is under development. More features coming soon!
          </p>
        </div>
        <button id="back-to-dashboard" class="btn-secondary w-full mt-3">Back to Dashboard</button>
      </div>
    </div>
  `;
  
  document.getElementById('back-to-dashboard').addEventListener('click', () => {
    navigateTo('dashboard');
  });
}

function renderSpiritualFitnessDetails() {
  // Get user and calculate spiritual fitness
  const users = window.Database.userOperations.getAll();
  const user = users && users.length > 0 ? users[0] : null;
  const activities = user ? window.Database.activityOperations.getAll({ userId: user.id }) : [];
  const spiritualFitness = window.Database.spiritualFitnessOperations.calculateAndSave(user?.id, activities);
  
  const components = spiritualFitness?.components || {};
  const activityCounts = spiritualFitness?.activityCounts || {};
  
  const rootElement = document.getElementById('root');
  rootElement.innerHTML = `
    <div class="container-custom">
      <header class="mt-4 mb-6">
        <h1 class="text-2xl font-bold text-gray-800">Spiritual Fitness</h1>
        <p class="text-gray-600">Your recovery progress</p>
      </header>
      
      <div class="card border-l-4 border-l-red-500">
        <div class="flex items-center mb-3">
          <i class="fas fa-heart text-xl text-red-500 mr-2"></i>
          <h2 class="text-lg font-semibold text-gray-800">Your Score</h2>
        </div>
        
        <div class="flex justify-center my-4">
          <div class="relative w-28 h-28 rounded-full bg-red-50 border-4 border-red-500 flex justify-center items-center">
            <div class="flex items-end">
              <span class="text-4xl font-bold text-red-500 leading-none">${spiritualFitness.score.toFixed(2)}</span>
              <span class="text-sm text-red-500 mb-2 ml-1">/10</span>
            </div>
          </div>
        </div>
        
        <div class="text-center my-3">
          <p class="text-gray-700">
            Based on your activities in the last 30 days
          </p>
        </div>
      </div>
      
      <!-- Score Breakdown -->
      <div class="card">
        <div class="flex items-center mb-3">
          <i class="fas fa-chart-bar text-xl text-blue-500 mr-2"></i>
          <h2 class="text-lg font-semibold text-gray-800">Score Breakdown</h2>
        </div>
        
        <div class="my-4">
          <!-- Meeting Attendance -->
          <div class="mb-4">
            <div class="flex justify-between mb-1">
              <span class="font-medium">Meeting Attendance</span>
              <span class="text-blue-500 font-medium">${(components.meetings || 0).toFixed(1)}/3.0</span>
            </div>
            <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div class="h-full bg-blue-500 rounded-full" style="width: ${((components.meetings || 0) / 3) * 100}%;"></div>
            </div>
            <p class="text-sm text-gray-500 mt-1">
              ${activityCounts.meeting || 0} meetings in the last 30 days
            </p>
          </div>
          
          <!-- Prayer & Meditation -->
          <div class="mb-4">
            <div class="flex justify-between mb-1">
              <span class="font-medium">Prayer & Meditation</span>
              <span class="text-blue-500 font-medium">${(components.prayer || 0).toFixed(1)}/2.0</span>
            </div>
            <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div class="h-full bg-blue-500 rounded-full" style="width: ${((components.prayer || 0) / 2) * 100}%;"></div>
            </div>
            <p class="text-sm text-gray-500 mt-1">
              ${(activityCounts.prayer || 0) + (activityCounts.meditation || 0)} sessions in the last 30 days
            </p>
          </div>
        </div>
        
        <button id="back-to-dashboard" class="btn-secondary w-full mt-3">Back to Dashboard</button>
      </div>
    </div>
  `;
  
  document.getElementById('back-to-dashboard').addEventListener('click', () => {
    navigateTo('dashboard');
  });
}

function renderErrorScreen(message) {
  const rootElement = document.getElementById('root');
  rootElement.innerHTML = `
    <div class="flex flex-col items-center justify-center h-screen text-center px-4">
      <div>
        <i class="fas fa-exclamation-circle text-4xl text-red-500 mb-4"></i>
      </div>
      <h1 class="text-xl font-bold mb-2 text-red-500">Something went wrong</h1>
      <p class="text-gray-600 mb-4">${message}</p>
      <button class="btn-primary" onclick="window.location.reload()">Reload App</button>
    </div>
  `;
}