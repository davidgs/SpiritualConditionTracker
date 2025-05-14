// Main App Component for Spiritual Condition Tracker

class SpiritualConditionTracker {
  constructor(rootElement) {
    this.root = rootElement;
    this.currentScreen = 'dashboard';
    this.user = null;
    this.activities = [];
    this.meetings = [];
    this.spiritualFitness = null;
    
    // Initialize app
    this.initialize();
  }
  
  async initialize() {
    try {
      // Load data
      await this.loadUserData();
      
      // Render UI
      this.renderApp();
      
      // Set up navigation
      this.setupNavigation();
      
      console.log('App initialized successfully');
    } catch (error) {
      console.error('Error initializing app:', error);
      this.renderErrorScreen(error.message);
    }
  }
  
  async loadUserData() {
    try {
      // Create a default user if none exists
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        this.user = JSON.parse(storedUser);
        console.log('User data loaded:', this.user);
      } else {
        // Create default user
        this.user = {
          id: 'user_' + Date.now(),
          name: 'Friend',
          sobrietyDate: '2020-01-01', // Default date
          homeGroup: '',
          phone: '',
          email: '',
          privacySettings: { shareLocation: false, shareActivities: false },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        // Save to storage
        localStorage.setItem('user', JSON.stringify(this.user));
        console.log('Default user created');
      }
      
      // Load activities
      const storedActivities = localStorage.getItem('activities');
      if (storedActivities) {
        this.activities = JSON.parse(storedActivities);
        console.log(`Loaded ${this.activities.length} activities`);
      }
      
      // Load meetings
      const storedMeetings = localStorage.getItem('meetings');
      if (storedMeetings) {
        this.meetings = JSON.parse(storedMeetings);
        console.log(`Loaded ${this.meetings.length} meetings`);
      }
      
      // Calculate spiritual fitness
      this.calculateSpiritualFitness();
      
    } catch (error) {
      console.error('Error loading user data:', error);
      this.user = {
        id: 'user_' + Date.now(),
        name: 'Friend',
        sobrietyDate: '2020-01-01',
        privacySettings: { shareLocation: false, shareActivities: false }
      };
      this.activities = [];
      this.meetings = [];
    }
  }
  
  calculateSpiritualFitness() {
    // Define weights for activity types
    const weights = {
      meeting: 10,    // Attending a meeting
      prayer: 8,      // Prayer 
      meditation: 8,  // Meditation
      reading: 6,     // Reading AA literature
      callSponsor: 5, // Calling sponsor
      callSponsee: 4, // Calling sponsee
      service: 9,     // Service work
      stepWork: 10    // Working on steps
    };
    
    // Get activities from the last 30 days
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentActivities = this.activities.filter(activity => {
      const activityDate = new Date(activity.date);
      return activityDate >= thirtyDaysAgo && activityDate <= now;
    });
    
    // Calculate scores
    let totalScore = 0;
    let totalPoints = 0;
    let eligibleActivities = 0;
    
    const breakdown = {};
    
    recentActivities.forEach(activity => {
      if (!weights[activity.type]) return;
      
      // Initialize type in breakdown if it doesn't exist
      if (!breakdown[activity.type]) {
        breakdown[activity.type] = { count: 0, points: 0 };
      }
      
      // Update breakdown
      breakdown[activity.type].count++;
      breakdown[activity.type].points += weights[activity.type];
      
      // Update total score
      totalPoints += weights[activity.type];
      eligibleActivities++;
    });
    
    // Calculate final score (normalized to 10)
    let finalScore = 0;
    if (eligibleActivities > 0) {
      finalScore = Math.min(10, (totalPoints / (eligibleActivities * 4)));
      finalScore = Math.round(finalScore * 100) / 100; // Round to 2 decimal places
    }
    
    this.spiritualFitness = {
      score: finalScore,
      breakdown,
      eligibleActivities,
      totalPoints,
      calculatedAt: new Date().toISOString()
    };
    
    console.log('Spiritual fitness calculated:', this.spiritualFitness.score);
    localStorage.setItem('spiritualFitness', JSON.stringify(this.spiritualFitness));
    
    return this.spiritualFitness;
  }
  
  setupNavigation() {
    try {
      // Create the bottom navigation
      const navHTML = `
        <nav class="app-nav">
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
        </nav>
      `;
      
      // Create the navigation element
      const navEl = document.createElement('div');
      navEl.innerHTML = navHTML;
      const navBar = navEl.firstElementChild;
      
      // Add to the body
      document.body.appendChild(navBar);
      
      // Add click event handlers directly
      const dashboardLink = navBar.querySelector('#nav-dashboard');
      const activitiesLink = navBar.querySelector('#nav-activities');
      const meetingsLink = navBar.querySelector('#nav-meetings');
      const nearbyLink = navBar.querySelector('#nav-nearby');
      const profileLink = navBar.querySelector('#nav-profile');
      
      if (dashboardLink) dashboardLink.addEventListener('click', () => this.navigateTo('dashboard'));
      if (activitiesLink) activitiesLink.addEventListener('click', () => this.navigateTo('activities'));
      if (meetingsLink) meetingsLink.addEventListener('click', () => this.navigateTo('meetings'));
      if (nearbyLink) nearbyLink.addEventListener('click', () => this.navigateTo('nearby'));
      if (profileLink) profileLink.addEventListener('click', () => this.navigateTo('profile'));
      
      console.log('Navigation setup complete');
    } catch (error) {
      console.error('Error setting up navigation:', error);
      // Continue without navigation if it fails
    }
  }
  
  navigateTo(screen) {
    // Update active tab
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active');
    });
    
    // Add active class to current tab
    const navItem = document.getElementById(`nav-${screen}`);
    if (navItem) navItem.classList.add('active');
    
    // Set current screen
    this.currentScreen = screen;
    
    // Render the screen
    this.renderApp();
  }
  
  renderApp() {
    // Render the appropriate screen based on currentScreen
    switch(this.currentScreen) {
      case 'dashboard':
        this.renderDashboard();
        break;
      case 'activities':
        this.renderActivities();
        break;
      case 'meetings':
        this.renderMeetings();
        break;
      case 'nearby':
        this.renderNearby();
        break;
      case 'profile':
        this.renderProfile();
        break;
      default:
        this.renderDashboard();
    }
  }
  
  renderDashboard() {
    console.log('Rendering dashboard...');
    
    // Default to 0 if calculations fail
    let sobrietyDays = 0;
    let sobrietyYears = 0;
    try {
      sobrietyDays = this.calculateSobrietyDays();
      sobrietyYears = this.calculateSobrietyYears();
    } catch (error) {
      console.error('Error calculating sobriety time:', error);
    }
    
    const fitnessScore = this.spiritualFitness?.score || 0;
    
    // Get recent activities (up to 5) with error handling
    let recentActivities = [];
    try {
      if (Array.isArray(this.activities)) {
        recentActivities = [...this.activities]
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 5);
      }
    } catch (error) {
      console.error('Error processing activities:', error);
    }
      
      this.root.innerHTML = `
      <div class="dashboard-container">
        <header>
          <h1>Hello, ${this.user?.name || 'Friend'}</h1>
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
              <span class="score-value">${fitnessScore.toFixed(2)}</span>
              <span class="score-max">/10</span>
            </div>
          </div>
          
          <button class="card-button" id="view-fitness-btn">View Details</button>
        </div>
        
        <!-- Recent Activities Card -->
        <div class="card activity-card">
          <div class="card-header">
            <i class="fas fa-list-alt"></i>
            <h2>Recovery Activities</h2>
          </div>
          
          <div class="activity-summary">
            <p>You've logged <strong>${recentActivities.length}</strong> recovery activities recently.</p>
          </div>
          
          ${recentActivities.length > 0 ? `
            <div class="activities-list">
              ${recentActivities.map(activity => `
                <div class="activity-item">
                  <div class="activity-icon ${activity.type}-icon">
                    <i class="fas ${this.getActivityIcon(activity.type)}"></i>
                  </div>
                  <div class="activity-details">
                    <div class="activity-title">${this.capitalizeFirst(activity.type)}${activity.name ? ': ' + activity.name : ''}</div>
                    <div class="activity-meta">${activity.duration ? activity.duration + ' min' : ''} • ${this.formatDate(activity.date)}</div>
                  </div>
                </div>
              `).join('')}
            </div>
          ` : `
            <p class="empty-state">No activities logged yet.</p>
          `}
          
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
    
    // Add event listeners with error handling
    try {
      // Update sobriety button
      const updateSobrietyBtn = document.getElementById('update-sobriety-btn');
      if (updateSobrietyBtn) {
        updateSobrietyBtn.addEventListener('click', () => this.navigateTo('profile'));
      }
      
      // View fitness details button
      const viewFitnessBtn = document.getElementById('view-fitness-btn');
      if (viewFitnessBtn) {
        viewFitnessBtn.addEventListener('click', () => this.showSpiritualFitnessDetails());
      }
      
      // Log activity button
      const logActivityBtn = document.getElementById('log-activity-btn');
      if (logActivityBtn) {
        logActivityBtn.addEventListener('click', () => this.navigateTo('activities'));
      }
      
      // Find meetings button
      const findMeetingsBtn = document.getElementById('find-meetings-btn');
      if (findMeetingsBtn) {
        findMeetingsBtn.addEventListener('click', () => this.navigateTo('meetings'));
      }
      
      // Nearby members button
      const nearbyMembersBtn = document.getElementById('nearby-members-btn');
      if (nearbyMembersBtn) {
        nearbyMembersBtn.addEventListener('click', () => this.navigateTo('nearby'));
      }
      
      // Track progress button
      const trackProgressBtn = document.getElementById('track-progress-btn');
      if (trackProgressBtn) {
        trackProgressBtn.addEventListener('click', () => this.showSpiritualFitnessDetails());
      }
      
      console.log('Dashboard event listeners attached');
    } catch (error) {
      console.error('Error attaching dashboard event listeners:', error);
    }
  }
  
  renderActivities() {
    // Placeholder - will implement in later iteration
    this.root.innerHTML = `
      <div class="activities-container">
        <header>
          <h1>Recovery Activities</h1>
          <p class="subtitle">Track your spiritual fitness activities</p>
        </header>
        
        <div class="card">
          <h2>Log New Activity</h2>
          <p>This section will allow you to log new recovery activities.</p>
          <button class="button-primary">Coming Soon</button>
        </div>
        
        <button class="back-btn" id="back-to-dashboard">
          <i class="fas fa-arrow-left"></i> Back to Dashboard
        </button>
      </div>
    `;
    
    document.getElementById('back-to-dashboard').addEventListener('click', () => this.navigateTo('dashboard'));
  }
  
  renderMeetings() {
    // Placeholder - will implement in later iteration
    this.root.innerHTML = `
      <div class="meetings-container">
        <header>
          <h1>AA Meetings</h1>
          <p class="subtitle">Find and manage your meetings</p>
        </header>
        
        <div class="card">
          <h2>Your Meetings</h2>
          <p>This section will display your saved meetings.</p>
          <button class="button-primary">Coming Soon</button>
        </div>
        
        <button class="back-btn" id="back-to-dashboard">
          <i class="fas fa-arrow-left"></i> Back to Dashboard
        </button>
      </div>
    `;
    
    document.getElementById('back-to-dashboard').addEventListener('click', () => this.navigateTo('dashboard'));
  }
  
  renderNearby() {
    // Placeholder - will implement in later iteration
    this.root.innerHTML = `
      <div class="nearby-container">
        <header>
          <h1>Nearby AA Members</h1>
          <p class="subtitle">Connect with others in recovery</p>
        </header>
        
        <div class="card">
          <h2>Proximity Wizard</h2>
          <p>This section will allow you to find nearby AA members.</p>
          <button class="button-primary">Coming Soon</button>
        </div>
        
        <button class="back-btn" id="back-to-dashboard">
          <i class="fas fa-arrow-left"></i> Back to Dashboard
        </button>
      </div>
    `;
    
    document.getElementById('back-to-dashboard').addEventListener('click', () => this.navigateTo('dashboard'));
  }
  
  renderProfile() {
    // Placeholder - will implement in later iteration
    this.root.innerHTML = `
      <div class="profile-container">
        <header>
          <h1>Your Profile</h1>
          <p class="subtitle">Update your personal information</p>
        </header>
        
        <div class="card">
          <h2>Personal Information</h2>
          <p>This section will allow you to update your profile information.</p>
          <button class="button-primary">Coming Soon</button>
        </div>
        
        <button class="back-btn" id="back-to-dashboard">
          <i class="fas fa-arrow-left"></i> Back to Dashboard
        </button>
      </div>
    `;
    
    document.getElementById('back-to-dashboard').addEventListener('click', () => this.navigateTo('dashboard'));
  }
  
  showSpiritualFitnessDetails() {
    alert('Spiritual Fitness Details coming soon!');
  }
  
  renderErrorScreen(errorMessage) {
    this.root.innerHTML = `
      <div class="error-container">
        <div class="error-icon">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
        <h1>Error</h1>
        <p>${errorMessage || 'An unexpected error occurred.'}</p>
        <button class="button-primary" id="retry-btn">Retry</button>
      </div>
    `;
    
    document.getElementById('retry-btn').addEventListener('click', () => {
      window.location.reload();
    });
  }
  
  calculateSobrietyDays() {
    if (!this.user?.sobrietyDate) return 0;
    
    const start = new Date(this.user.sobrietyDate);
    const now = new Date();
    
    // Reset hours to compare dates only
    start.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    
    const diffTime = Math.abs(now - start);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  }
  
  calculateSobrietyYears(decimalPlaces = 2) {
    const days = this.calculateSobrietyDays();
    const years = days / 365.25; // Account for leap years
    
    return parseFloat(years.toFixed(decimalPlaces));
  }
  
  // Utility methods
  capitalizeFirst(string) {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
  
  formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }
  
  getActivityIcon(type) {
    switch (type?.toLowerCase()) {
      case 'meeting':
        return 'fa-users';
      case 'prayer':
      case 'meditation':
        return 'fa-pray';
      case 'reading':
        return 'fa-book';
      case 'stepwork':
        return 'fa-tasks';
      case 'service':
        return 'fa-hands-helping';
      case 'callsponsor':
        return 'fa-phone';
      case 'callsponsee':
        return 'fa-phone-alt';
      default:
        return 'fa-star';
    }
  }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  const rootElement = document.getElementById('root');
  if (rootElement) {
    window.app = new SpiritualConditionTracker(rootElement);
  } else {
    console.error('Root element not found');
  }
});