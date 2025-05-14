// Simplified App for Spiritual Condition Tracker
document.addEventListener('DOMContentLoaded', function() {
  console.log('Spiritual Condition Tracker initialized');
  
  // Get the root element
  const root = document.getElementById('root');
  
  // Initialize user data
  let user = {
    name: 'Friend',
    sobrietyDate: '2020-01-01'
  };
  
  // Try to load user data from localStorage
  try {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      user = JSON.parse(storedUser);
      console.log('User data loaded');
    }
  } catch (error) {
    console.error('Error loading user data', error);
  }
  
  // Calculate sobriety days
  function calculateSobrietyDays() {
    if (!user.sobrietyDate) return 0;
    
    const start = new Date(user.sobrietyDate);
    const now = new Date();
    
    // Reset hours to compare dates only
    start.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    
    const diffTime = Math.abs(now - start);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  }
  
  // Calculate sobriety years
  function calculateSobrietyYears() {
    const days = calculateSobrietyDays();
    const years = days / 365.25; // Account for leap years
    
    return parseFloat(years.toFixed(2));
  }
  
  // Render the dashboard
  function renderDashboard() {
    const sobrietyDays = calculateSobrietyDays();
    const sobrietyYears = calculateSobrietyYears();
    
    root.innerHTML = `
      <div class="dashboard-container">
        <header>
          <h1>Hello, ${user.name}</h1>
          <p class="subtitle">Your Recovery Dashboard</p>
        </header>
        
        <!-- Sobriety Card -->
        <div class="card sobriety-card">
          <div class="card-header">
            <i class="fas fa-calendar-check"></i>
            <h2>Sobriety</h2>
          </div>
          
          <div class="sobriety-info">
            <div class="sobriety-metric">
              <div class="sobriety-value">${sobrietyDays.toLocaleString()}</div>
              <div class="sobriety-label">Days</div>
            </div>
            <div class="sobriety-separator"></div>
            <div class="sobriety-metric">
              <div class="sobriety-value">${sobrietyYears}</div>
              <div class="sobriety-label">Years</div>
            </div>
          </div>
          
          <button class="card-button" id="update-sobriety-btn">Update Sobriety Date</button>
        </div>
        
        <!-- Spiritual Fitness Card -->
        <div class="card fitness-card">
          <div class="card-header">
            <i class="fas fa-heart"></i>
            <h2>Spiritual Fitness</h2>
          </div>
          
          <div class="score-container">
            <div class="score-circle">
              <span class="score-value">7.50</span>
              <span class="score-max">/10</span>
            </div>
          </div>
          
          <button class="card-button" id="view-fitness-btn">View Details</button>
        </div>
        
        <!-- Recovery Activities Card -->
        <div class="card activity-card">
          <div class="card-header">
            <i class="fas fa-list-alt"></i>
            <h2>Recovery Activities</h2>
          </div>
          
          <div class="activity-summary">
            <p>Track your recovery activities to improve your spiritual fitness.</p>
          </div>
          
          <button class="card-button" id="log-activity-btn">Log New Activity</button>
        </div>
        
        <!-- Quick Actions -->
        <div class="quick-actions">
          <h2>Quick Actions</h2>
          <div class="action-buttons">
            <button class="action-button" id="find-meetings-btn">
              <i class="fas fa-users"></i>
              <span>Find Meetings</span>
            </button>
            
            <button class="action-button" id="nearby-members-btn">
              <i class="fas fa-map-marker-alt"></i>
              <span>Nearby Members</span>
            </button>
            
            <button class="action-button" id="track-progress-btn">
              <i class="fas fa-chart-line"></i>
              <span>Track Progress</span>
            </button>
          </div>
        </div>
      </div>
    `;
    
    // Add navigation bar
    const nav = document.createElement('nav');
    nav.className = 'app-nav';
    nav.innerHTML = `
      <a id="nav-dashboard" class="nav-item active">
        <i class="fas fa-home"></i>
        <span>Home</span>
      </a>
      <a id="nav-activities" class="nav-item">
        <i class="fas fa-clipboard-list"></i>
        <span>Activities</span>
      </a>
      <a id="nav-meetings" class="nav-item">
        <i class="fas fa-users"></i>
        <span>Meetings</span>
      </a>
      <a id="nav-nearby" class="nav-item">
        <i class="fas fa-map-marker-alt"></i>
        <span>Nearby</span>
      </a>
      <a id="nav-profile" class="nav-item">
        <i class="fas fa-user"></i>
        <span>Profile</span>
      </a>
    `;
    
    // Add the navigation to the body
    document.body.appendChild(nav);
    
    // Set up event listeners
    document.getElementById('update-sobriety-btn').addEventListener('click', function() {
      alert('Update Sobriety Date feature coming soon');
    });
    
    document.getElementById('view-fitness-btn').addEventListener('click', function() {
      alert('Spiritual Fitness Details coming soon');
    });
    
    document.getElementById('log-activity-btn').addEventListener('click', function() {
      alert('Log Activity feature coming soon');
    });
    
    document.getElementById('find-meetings-btn').addEventListener('click', function() {
      alert('Find Meetings feature coming soon');
    });
    
    document.getElementById('nearby-members-btn').addEventListener('click', function() {
      alert('Nearby Members feature coming soon');
    });
    
    document.getElementById('track-progress-btn').addEventListener('click', function() {
      alert('Track Progress feature coming soon');
    });
  }
  
  // Render the initial dashboard
  renderDashboard();
});