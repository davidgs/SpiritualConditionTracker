// Main application for Spiritual Condition Tracker
// Simplified version with direct styling to match React Native look and feel

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
    <div style="max-width: 600px; margin: 0 auto; padding: 16px;">
      <!-- Header -->
      <header style="margin-bottom: 20px; margin-top: 10px;">
        <h1 style="font-size: 28px; font-weight: bold; color: #2c3e50; margin: 0;">Hello, ${user?.name || 'Friend'}</h1>
        <p style="font-size: 16px; color: #7f8c8d; margin-top: 5px; margin-bottom: 0;">Your Recovery Dashboard</p>
      </header>
      
      <!-- Sobriety Counter -->
      <div style="background-color: #fff; border-radius: 12px; padding: 16px; margin-bottom: 16px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); border-left: 4px solid #27ae60;">
        <div style="display: flex; flex-direction: row; align-items: center; margin-bottom: 12px;">
          <i class="fas fa-calendar-check" style="font-size: 22px; color: #27ae60; margin-right: 8px;"></i>
          <h2 style="font-size: 18px; font-weight: bold; color: #2c3e50; margin: 0;">Sobriety</h2>
        </div>
        <div style="display: flex; flex-direction: row; justify-content: space-around; align-items: center; margin: 10px 0;">
          <div style="display: flex; flex-direction: column; align-items: center; text-align: center;">
            <div style="font-size: 28px; font-weight: bold; color: #27ae60; margin: 0;">${formattedSobrietyDays}</div>
            <div style="font-size: 14px; color: #7f8c8d; margin-top: 4px;">Days</div>
          </div>
          <div style="height: 40px; width: 1px; background-color: #ecf0f1;"></div>
          <div style="display: flex; flex-direction: column; align-items: center; text-align: center;">
            <div style="font-size: 28px; font-weight: bold; color: #27ae60; margin: 0;">${sobrietyYears}</div>
            <div style="font-size: 14px; color: #7f8c8d; margin-top: 4px;">Years</div>
          </div>
        </div>
        <button style="display: flex; justify-content: center; align-items: center; background-color: #f4f6f7; border-radius: 8px; padding: 12px; margin-top: 10px; font-weight: 600; color: #2c3e50; text-align: center; border: none; width: 100%; cursor: pointer;" id="update-sobriety-btn">Update Sobriety Date</button>
      </div>
      
      <!-- Spiritual Fitness Score -->
      <div style="background-color: #fff; border-radius: 12px; padding: 16px; margin-bottom: 16px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); border-left: 4px solid #e74c3c;">
        <div style="display: flex; flex-direction: row; align-items: center; margin-bottom: 12px;">
          <i class="fas fa-heart" style="font-size: 22px; color: #e74c3c; margin-right: 8px;"></i>
          <h2 style="font-size: 18px; font-weight: bold; color: #2c3e50; margin: 0;">Spiritual Fitness</h2>
        </div>
        <div style="display: flex; align-items: center; justify-content: center; margin: 10px 0;">
          <div style="position: relative; width: 100px; height: 100px; border-radius: 50%; background-color: #fef9f9; border: 4px solid #e74c3c; display: flex; justify-content: center; align-items: center;">
            <div style="position: relative; display: flex; align-items: flex-end;">
              <span style="font-size: 32px; font-weight: bold; color: #e74c3c; line-height: 1;">${formattedScore}</span>
              <span style="font-size: 14px; color: #e74c3c; margin-bottom: 4px; margin-left: 2px;">/10</span>
            </div>
          </div>
        </div>
        <button style="display: flex; justify-content: center; align-items: center; background-color: #f4f6f7; border-radius: 8px; padding: 12px; margin-top: 10px; font-weight: 600; color: #2c3e50; text-align: center; border: none; width: 100%; cursor: pointer;" id="view-fitness-btn">View Details</button>
      </div>
      
      <!-- Recovery Activities -->
      <div style="background-color: #fff; border-radius: 12px; padding: 16px; margin-bottom: 16px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); border-left: 4px solid #3498db;">
        <div style="display: flex; flex-direction: row; align-items: center; margin-bottom: 12px;">
          <i class="fas fa-list-alt" style="font-size: 22px; color: #3498db; margin-right: 8px;"></i>
          <h2 style="font-size: 18px; font-weight: bold; color: #2c3e50; margin: 0;">Recovery Activities</h2>
        </div>
        <div style="margin: 10px 0; display: flex; flex-direction: column; align-items: center;">
          <p style="font-size: 16px; text-align: center; color: #2c3e50; line-height: 24px; margin: 0;">
            You've logged <span style="font-weight: bold; color: #3498db;">${recentActivities.length}</span> recovery 
            activities in the last 30 days.
          </p>
        </div>
        <button style="display: flex; justify-content: center; align-items: center; background-color: #f4f6f7; border-radius: 8px; padding: 12px; margin-top: 10px; font-weight: 600; color: #2c3e50; text-align: center; border: none; width: 100%; cursor: pointer;" id="log-activity-btn">Log New Activity</button>
      </div>
      
      <!-- Quick Actions -->
      <div style="margin-top: 10px; margin-bottom: 30px;">
        <h2 style="font-size: 18px; font-weight: bold; margin-bottom: 16px; color: #2c3e50;">Quick Actions</h2>
        <div style="display: flex; flex-direction: row; justify-content: space-between;">
          <button style="flex: 1; display: flex; flex-direction: column; align-items: center; background-color: #fff; padding: 16px; border-radius: 12px; margin-right: 8px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05); border: none; cursor: pointer;" id="find-meetings-btn">
            <i class="fas fa-users" style="font-size: 24px; margin-bottom: 8px; color: #3498db;"></i>
            <span style="font-size: 12px; color: #2c3e50; text-align: center;">Find Meetings</span>
          </button>
          <button style="flex: 1; display: flex; flex-direction: column; align-items: center; background-color: #fff; padding: 16px; border-radius: 12px; margin: 0 4px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05); border: none; cursor: pointer;" id="nearby-members-btn">
            <i class="fas fa-map-marker-alt" style="font-size: 24px; margin-bottom: 8px; color: #3498db;"></i>
            <span style="font-size: 12px; color: #2c3e50; text-align: center;">Nearby Members</span>
          </button>
          <button style="flex: 1; display: flex; flex-direction: column; align-items: center; background-color: #fff; padding: 16px; border-radius: 12px; margin-left: 8px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05); border: none; cursor: pointer;" id="track-progress-btn">
            <i class="fas fa-chart-line" style="font-size: 24px; margin-bottom: 8px; color: #3498db;"></i>
            <span style="font-size: 12px; color: #2c3e50; text-align: center;">Track Progress</span>
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
  navElement.style.position = 'fixed';
  navElement.style.bottom = '0';
  navElement.style.left = '0';
  navElement.style.right = '0';
  navElement.style.backgroundColor = 'white';
  navElement.style.display = 'flex';
  navElement.style.flexDirection = 'row';
  navElement.style.justifyContent = 'space-around';
  navElement.style.padding = '10px 0';
  navElement.style.boxShadow = '0 -2px 10px rgba(0, 0, 0, 0.1)';
  navElement.style.zIndex = '1000';
  
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
    navItem.style.display = 'flex';
    navItem.style.flexDirection = 'column';
    navItem.style.alignItems = 'center';
    navItem.style.color = screen.id === 'dashboard' ? '#3498db' : '#7f8c8d';
    navItem.style.textDecoration = 'none';
    navItem.style.cursor = 'pointer';
    
    const icon = document.createElement('i');
    icon.className = `fas fa-${screen.icon}`;
    icon.style.fontSize = '22px';
    icon.style.marginBottom = '5px';
    
    const label = document.createElement('span');
    label.textContent = screen.label;
    label.style.fontSize = '12px';
    
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
    item.style.color = '#7f8c8d';
  });
  
  const activeNav = document.getElementById(`nav-${screenName}`);
  if (activeNav) {
    activeNav.style.color = '#3498db';
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
    <div style="max-width: 600px; margin: 0 auto; padding: 16px;">
      <header style="margin-bottom: 20px; margin-top: 10px;">
        <h1 style="font-size: 28px; font-weight: bold; color: #2c3e50; margin: 0;">${title}</h1>
        <p style="font-size: 16px; color: #7f8c8d; margin-top: 5px; margin-bottom: 0;">${subtitle}</p>
      </header>
      
      <div style="background-color: #fff; border-radius: 12px; padding: 16px; margin-bottom: 16px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
        <div style="display: flex; flex-direction: row; align-items: center; margin-bottom: 12px;">
          <i class="fas fa-code" style="font-size: 22px; color: #3498db; margin-right: 8px;"></i>
          <h2 style="font-size: 18px; font-weight: bold; color: #2c3e50; margin: 0;">Coming Soon</h2>
        </div>
        <div style="margin: 10px 0; display: flex; flex-direction: column; align-items: center;">
          <p style="font-size: 16px; text-align: center; color: #2c3e50; line-height: 24px; margin: 0;">
            This screen is under development. More features coming soon!
          </p>
        </div>
        <button style="display: flex; justify-content: center; align-items: center; background-color: #f4f6f7; border-radius: 8px; padding: 12px; margin-top: 10px; font-weight: 600; color: #2c3e50; text-align: center; border: none; width: 100%; cursor: pointer;" id="back-to-dashboard">Back to Dashboard</button>
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
    <div style="max-width: 600px; margin: 0 auto; padding: 16px;">
      <header style="margin-bottom: 20px; margin-top: 10px;">
        <h1 style="font-size: 28px; font-weight: bold; color: #2c3e50; margin: 0;">Spiritual Fitness</h1>
        <p style="font-size: 16px; color: #7f8c8d; margin-top: 5px; margin-bottom: 0;">Your recovery progress</p>
      </header>
      
      <div style="background-color: #fff; border-radius: 12px; padding: 16px; margin-bottom: 16px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); border-left: 4px solid #e74c3c;">
        <div style="display: flex; flex-direction: row; align-items: center; margin-bottom: 12px;">
          <i class="fas fa-heart" style="font-size: 22px; color: #e74c3c; margin-right: 8px;"></i>
          <h2 style="font-size: 18px; font-weight: bold; color: #2c3e50; margin: 0;">Your Score</h2>
        </div>
        
        <div style="display: flex; align-items: center; justify-content: center; margin: 10px 0;">
          <div style="position: relative; width: 120px; height: 120px; border-radius: 50%; background-color: #fef9f9; border: 4px solid #e74c3c; display: flex; justify-content: center; align-items: center;">
            <div style="position: relative; display: flex; align-items: flex-end;">
              <span style="font-size: 40px; font-weight: bold; color: #e74c3c; line-height: 1;">${spiritualFitness.score.toFixed(2)}</span>
              <span style="font-size: 16px; color: #e74c3c; margin-bottom: 6px; margin-left: 2px;">/10</span>
            </div>
          </div>
        </div>
        
        <div style="margin: 15px 0; text-align: center;">
          <p style="font-size: 16px; color: #2c3e50; line-height: 24px; margin: 0;">
            Based on your activities in the last 30 days
          </p>
        </div>
      </div>
      
      <!-- Score Breakdown -->
      <div style="background-color: #fff; border-radius: 12px; padding: 16px; margin-bottom: 16px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
        <div style="display: flex; flex-direction: row; align-items: center; margin-bottom: 12px;">
          <i class="fas fa-chart-bar" style="font-size: 22px; color: #3498db; margin-right: 8px;"></i>
          <h2 style="font-size: 18px; font-weight: bold; color: #2c3e50; margin: 0;">Score Breakdown</h2>
        </div>
        
        <div style="margin: 15px 0;">
          <!-- Meeting Attendance -->
          <div style="margin-bottom: 15px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
              <span style="font-weight: 600;">Meeting Attendance</span>
              <span style="color: #3498db; font-weight: 600;">${(components.meetings || 0).toFixed(1)}/3.0</span>
            </div>
            <div style="height: 8px; background-color: #ecf0f1; border-radius: 4px; overflow: hidden;">
              <div style="height: 100%; width: ${((components.meetings || 0) / 3) * 100}%; background-color: #3498db;"></div>
            </div>
            <p style="font-size: 0.9rem; color: #7f8c8d; margin-top: 5px;">
              ${activityCounts.meeting || 0} meetings in the last 30 days
            </p>
          </div>
          
          <!-- Prayer & Meditation -->
          <div style="margin-bottom: 15px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
              <span style="font-weight: 600;">Prayer & Meditation</span>
              <span style="color: #3498db; font-weight: 600;">${(components.prayer || 0).toFixed(1)}/2.0</span>
            </div>
            <div style="height: 8px; background-color: #ecf0f1; border-radius: 4px; overflow: hidden;">
              <div style="height: 100%; width: ${((components.prayer || 0) / 2) * 100}%; background-color: #3498db;"></div>
            </div>
            <p style="font-size: 0.9rem; color: #7f8c8d; margin-top: 5px;">
              ${(activityCounts.prayer || 0) + (activityCounts.meditation || 0)} sessions in the last 30 days
            </p>
          </div>
        </div>
        
        <button style="display: flex; justify-content: center; align-items: center; background-color: #f4f6f7; border-radius: 8px; padding: 12px; margin-top: 10px; font-weight: 600; color: #2c3e50; text-align: center; border: none; width: 100%; cursor: pointer;" id="back-to-dashboard">Back to Dashboard</button>
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
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; text-align: center; padding: 0 20px;">
      <div>
        <i class="fas fa-exclamation-circle" style="font-size: 48px; color: #e74c3c; margin-bottom: 20px;"></i>
      </div>
      <h1 style="font-size: 24px; font-weight: bold; margin-bottom: 10px; color: #e74c3c;">Something went wrong</h1>
      <p style="font-size: 16px; color: #7f8c8d; margin-bottom: 20px;">${message}</p>
      <button style="padding: 10px 20px; background-color: #3498db; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;" onclick="window.location.reload()">Reload App</button>
    </div>
  `;
}