// Main app component for Spiritual Condition Tracker
// Adapts React Native components for direct web use

// Initialize database and state
document.addEventListener('DOMContentLoaded', function() {
  // Root element for the application
  const rootElement = document.getElementById('root');
  
  // Initialize React component
  if (rootElement) {
    // Create a new application instance
    const app = new SpiritualConditionTracker(rootElement);
    window.app = app; // Make it accessible globally for debugging
  }
});

/**
 * Main application class for the Spiritual Condition Tracker
 */
class SpiritualConditionTracker {
  constructor(rootElement) {
    this.root = rootElement;
    this.initialize();
  }
  
  /**
   * Initialize the application
   */
  async initialize() {
    try {
      // Initialize database
      await this.initializeDatabase();
      
      // Load user data
      await this.loadUserData();
      
      // Set up navigation
      this.setupNavigation();
      
      // Calculate spiritual fitness
      this.calculateSpiritualFitness();
      
      // Render the main dashboard
      this.renderDashboard();
      
      console.log('App initialized successfully');
    } catch (error) {
      console.error('Error initializing app:', error);
      this.renderErrorScreen('Failed to initialize the application. Please try again.');
    }
  }
  
  /**
   * Initialize the database
   */
  async initializeDatabase() {
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
  async loadUserData() {
    try {
      // Get all users (for simplicity, we'll use the first one)
      const users = window.Database.userOperations.getAll();
      
      if (users && users.length > 0) {
        this.user = users[0];
        console.log('User data loaded:', this.user);
        
        // Load activities for this user
        this.activities = window.Database.activityOperations.getAll({ 
          userId: this.user.id 
        });
        
        // Load meetings
        this.meetings = window.Database.meetingOperations.getAll();
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
  calculateSpiritualFitness() {
    try {
      if (!this.user || !this.activities) {
        this.spiritualFitness = { score: 0 };
        return this.spiritualFitness;
      }
      
      // Calculate spiritual fitness
      this.spiritualFitness = window.Database.spiritualFitnessOperations.calculateAndSave(
        this.user.id, 
        this.activities
      );
      
      console.log('Spiritual fitness calculated:', this.spiritualFitness.score);
      
      return this.spiritualFitness;
    } catch (error) {
      console.error('Error calculating spiritual fitness:', error);
      this.spiritualFitness = { score: 0 };
      return this.spiritualFitness;
    }
  }
  
  /**
   * Set up navigation
   */
  setupNavigation() {
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
    
    // Create a new element for the navigation
    const navElement = document.createElement('div');
    navElement.innerHTML = navHTML;
    const navBar = navElement.firstElementChild;
    
    // Add navigation to the body
    document.body.appendChild(navBar);
    
    // Add event listeners to navigation items
    const dashboardNav = document.getElementById('nav-dashboard');
    if (dashboardNav) {
      dashboardNav.addEventListener('click', () => this.navigateTo('dashboard'));
    }
    
    const activitiesNav = document.getElementById('nav-activities');
    if (activitiesNav) {
      activitiesNav.addEventListener('click', () => this.navigateTo('activities'));
    }
    
    const meetingsNav = document.getElementById('nav-meetings');
    if (meetingsNav) {
      meetingsNav.addEventListener('click', () => this.navigateTo('meetings'));
    }
    
    const nearbyNav = document.getElementById('nav-nearby');
    if (nearbyNav) {
      nearbyNav.addEventListener('click', () => this.navigateTo('nearby'));
    }
    
    const profileNav = document.getElementById('nav-profile');
    if (profileNav) {
      profileNav.addEventListener('click', () => this.navigateTo('profile'));
    }
  }
  
  /**
   * Handle navigation between screens
   * @param {string} screen - The screen to navigate to
   */
  navigateTo(screen) {
    // Update active navigation item
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => item.classList.remove('active'));
    
    const activeNav = document.getElementById(`nav-${screen}`);
    if (activeNav) {
      activeNav.classList.add('active');
    }
    
    // Render appropriate screen
    switch (screen) {
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
      case 'spiritual':
        this.showSpiritualFitnessDetails();
        break;
      default:
        this.renderDashboard();
    }
  }
  
  /**
   * Render the dashboard screen
   */
  renderDashboard() {
    // Calculate sobriety days and years
    const sobrietyDays = this.calculateSobrietyDays();
    const sobrietyYears = this.calculateSobrietyYears();
    
    // Get recent activities (up to 5)
    const recentActivities = [...(this.activities || [])]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
    
    // Format score
    const fitnessScore = this.spiritualFitness?.score || 0;
    const formattedScore = fitnessScore.toFixed(2);
    
    // Create activity items HTML
    let activitiesHTML = '';
    
    if (recentActivities.length > 0) {
      recentActivities.forEach(activity => {
        activitiesHTML += `
          <div class="activity-item">
            <div class="activity-icon ${activity.type}-icon">
              <i class="${this.getActivityIcon(activity.type)}"></i>
            </div>
            <div class="activity-details">
              <div class="activity-title">${activity.name}</div>
              <div class="activity-meta">${this.formatDate(activity.date)} · ${activity.duration} mins</div>
              ${activity.notes ? `<div class="activity-notes">${activity.notes}</div>` : ''}
            </div>
          </div>
        `;
      });
    } else {
      activitiesHTML = `
        <div class="empty-state">
          <p>No recent activities. Start tracking your recovery journey!</p>
        </div>
      `;
    }
    
    // Create dashboard HTML
    this.root.innerHTML = `
      <div class="dashboard-container">
        <header>
          <h1>Hello, ${this.user?.name || 'Friend'}</h1>
          <p class="subtitle">Your Recovery Dashboard</p>
        </header>
        
        <!-- Sobriety Counter -->
        <div class="card sobriety-card">
          <div class="card-header">
            <i class="fas fa-calendar-check"></i>
            <h2>Sobriety</h2>
          </div>
          <div class="sobriety-info">
            <div class="sobriety-metric">
              <div class="sobriety-value">${this.formatNumberWithCommas(sobrietyDays)}</div>
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
        
        <!-- Spiritual Fitness Score -->
        <div class="card fitness-card">
          <div class="card-header">
            <i class="fas fa-heart"></i>
            <h2>Spiritual Fitness</h2>
          </div>
          <div class="score-container">
            <div class="score-circle">
              <span class="score-value">${formattedScore}</span>
              <span class="score-max">/10</span>
            </div>
          </div>
          <button class="card-button" id="view-fitness-btn">View Details</button>
        </div>
        
        <!-- Recent Activity -->
        <div class="card activity-card">
          <div class="card-header">
            <i class="fas fa-list-alt"></i>
            <h2>Recent Activities</h2>
          </div>
          <div class="activity-list">
            ${activitiesHTML}
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
    
    // Add event listeners
    document.getElementById('update-sobriety-btn').addEventListener('click', () => this.navigateTo('profile'));
    document.getElementById('view-fitness-btn').addEventListener('click', () => this.navigateTo('spiritual'));
    document.getElementById('log-activity-btn').addEventListener('click', () => this.navigateTo('activities'));
    document.getElementById('find-meetings-btn').addEventListener('click', () => this.navigateTo('meetings'));
    document.getElementById('nearby-members-btn').addEventListener('click', () => this.navigateTo('nearby'));
    document.getElementById('track-progress-btn').addEventListener('click', () => this.navigateTo('spiritual'));
  }
  
  /**
   * Render the activities screen
   */
  renderActivities() {
    // Sort activities by date (newest first)
    const sortedActivities = [...(this.activities || [])]
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Create activities HTML
    let activitiesHTML = '';
    
    if (sortedActivities.length > 0) {
      sortedActivities.forEach(activity => {
        activitiesHTML += `
          <div class="activity-item" data-id="${activity.id}">
            <div class="activity-icon ${activity.type}-icon">
              <i class="${this.getActivityIcon(activity.type)}"></i>
            </div>
            <div class="activity-details">
              <div class="activity-title">${activity.name}</div>
              <div class="activity-meta">${this.formatDate(activity.date)} · ${activity.duration} mins</div>
              ${activity.notes ? `<div class="activity-notes">${activity.notes}</div>` : ''}
            </div>
            <button class="delete-btn" data-id="${activity.id}">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        `;
      });
    } else {
      activitiesHTML = `
        <div class="empty-state">
          <p>No activities recorded yet. Start tracking your recovery activities!</p>
        </div>
      `;
    }
    
    // Default date value (today)
    const today = new Date().toISOString().split('T')[0];
    
    // Create activities screen HTML
    this.root.innerHTML = `
      <div class="dashboard-container">
        <header>
          <h1>Recovery Activities</h1>
          <p class="subtitle">Track your spiritual progress</p>
        </header>
        
        <div class="card">
          <h3>Log New Activity</h3>
          <form id="activity-form" class="form">
            <div class="form-group">
              <label for="activity-type">Activity Type</label>
              <select id="activity-type" required>
                <option value="">Select Type</option>
                <option value="meeting">Meeting Attendance</option>
                <option value="prayer">Prayer</option>
                <option value="meditation">Meditation</option>
                <option value="reading">Reading</option>
                <option value="service">Service Work</option>
                <option value="stepwork">Step Work</option>
                <option value="sponsorship">Sponsorship</option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="activity-name">Name/Description</label>
              <input type="text" id="activity-name" placeholder="e.g., Home Group Meeting" required>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="activity-date">Date</label>
                <input type="date" id="activity-date" value="${today}" required>
              </div>
              
              <div class="form-group">
                <label for="activity-duration">Duration (mins)</label>
                <input type="number" id="activity-duration" min="1" value="60" required>
              </div>
            </div>
            
            <div class="form-group">
              <label for="activity-notes">Notes (optional)</label>
              <textarea id="activity-notes" rows="3" placeholder="Any reflections or details"></textarea>
            </div>
            
            <button type="submit" class="button-primary">Save Activity</button>
          </form>
        </div>
        
        <div class="card">
          <h3>Your Activities</h3>
          <div class="activities-list">
            ${activitiesHTML}
          </div>
        </div>
      </div>
    `;
    
    // Set up form submission
    document.getElementById('activity-form').addEventListener('submit', (e) => {
      e.preventDefault();
      
      const activityType = document.getElementById('activity-type').value;
      const activityName = document.getElementById('activity-name').value;
      const activityDate = document.getElementById('activity-date').value;
      const activityDuration = parseInt(document.getElementById('activity-duration').value);
      const activityNotes = document.getElementById('activity-notes').value;
      
      this.saveActivity({
        userId: this.user.id,
        type: activityType,
        name: activityName,
        date: activityDate,
        duration: activityDuration,
        notes: activityNotes
      });
      
      // Reset form
      document.getElementById('activity-form').reset();
      document.getElementById('activity-date').value = today;
      
      // Re-render the activities screen
      this.renderActivities();
    });
    
    // Set up delete buttons
    document.querySelectorAll('.delete-btn').forEach(button => {
      button.addEventListener('click', (e) => {
        const activityId = e.currentTarget.getAttribute('data-id');
        
        if (confirm('Are you sure you want to delete this activity?')) {
          this.deleteActivity(activityId);
          this.renderActivities();
        }
      });
    });
  }
  
  /**
   * Render the meetings screen
   */
  renderMeetings() {
    // Sort meetings by day of week
    const daysOrder = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Daily'];
    const sortedMeetings = [...(this.meetings || [])].sort((a, b) => {
      return daysOrder.indexOf(a.day) - daysOrder.indexOf(b.day);
    });
    
    // Create meetings HTML
    let meetingsHTML = '';
    
    if (sortedMeetings.length > 0) {
      sortedMeetings.forEach(meeting => {
        meetingsHTML += `
          <div class="meeting-item" data-id="${meeting.id}">
            <div class="meeting-day-badge">
              ${meeting.day.substring(0, 3)}
            </div>
            <div class="meeting-details">
              <div class="meeting-title">${meeting.name}</div>
              <div class="meeting-meta">${meeting.type} · ${meeting.time}</div>
              <div class="meeting-address">${meeting.location}</div>
              ${meeting.notes ? `<div class="meeting-notes">${meeting.notes}</div>` : ''}
            </div>
            <button class="delete-btn" data-id="${meeting.id}">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        `;
      });
    } else {
      meetingsHTML = `
        <div class="empty-state">
          <p>No meetings saved yet. Add your regular meetings!</p>
        </div>
      `;
    }
    
    // Create meetings screen HTML
    this.root.innerHTML = `
      <div class="dashboard-container">
        <header>
          <h1>Meetings</h1>
          <p class="subtitle">Manage your meeting list</p>
        </header>
        
        <div class="card">
          <h3>Add New Meeting</h3>
          <form id="meeting-form" class="form">
            <div class="form-group">
              <label for="meeting-name">Meeting Name</label>
              <input type="text" id="meeting-name" placeholder="e.g., Downtown Group" required>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="meeting-type">Type</label>
                <select id="meeting-type" required>
                  <option value="">Select Type</option>
                  <option value="Discussion">Discussion</option>
                  <option value="Speaker">Speaker</option>
                  <option value="Big Book Study">Big Book Study</option>
                  <option value="Step Study">Step Study</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Meditation">Meditation</option>
                  <option value="Men's">Men's</option>
                  <option value="Women's">Women's</option>
                  <option value="LGBTQ+">LGBTQ+</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div class="form-group">
                <label for="meeting-day">Day</label>
                <select id="meeting-day" required>
                  <option value="">Select Day</option>
                  <option value="Sunday">Sunday</option>
                  <option value="Monday">Monday</option>
                  <option value="Tuesday">Tuesday</option>
                  <option value="Wednesday">Wednesday</option>
                  <option value="Thursday">Thursday</option>
                  <option value="Friday">Friday</option>
                  <option value="Saturday">Saturday</option>
                  <option value="Daily">Daily</option>
                </select>
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="meeting-time">Time</label>
                <input type="time" id="meeting-time" required>
              </div>
              
              <div class="form-group">
                <label for="meeting-location">Location</label>
                <input type="text" id="meeting-location" placeholder="Address or Zoom link" required>
              </div>
            </div>
            
            <div class="form-group">
              <label for="meeting-notes">Notes (optional)</label>
              <textarea id="meeting-notes" rows="2" placeholder="Additional details"></textarea>
            </div>
            
            <button type="submit" class="button-primary">Save Meeting</button>
          </form>
        </div>
        
        <div class="card">
          <h3>Your Meetings</h3>
          <div class="meetings-list">
            ${meetingsHTML}
          </div>
        </div>
      </div>
    `;
    
    // Set up form submission
    document.getElementById('meeting-form').addEventListener('submit', (e) => {
      e.preventDefault();
      
      const meetingName = document.getElementById('meeting-name').value;
      const meetingType = document.getElementById('meeting-type').value;
      const meetingDay = document.getElementById('meeting-day').value;
      const meetingTime = document.getElementById('meeting-time').value;
      const meetingLocation = document.getElementById('meeting-location').value;
      const meetingNotes = document.getElementById('meeting-notes').value;
      
      this.saveMeeting({
        name: meetingName,
        type: meetingType,
        day: meetingDay,
        time: meetingTime,
        location: meetingLocation,
        notes: meetingNotes,
        createdBy: this.user.id
      });
      
      // Reset form
      document.getElementById('meeting-form').reset();
      
      // Re-render the meetings screen
      this.renderMeetings();
    });
    
    // Set up delete buttons
    document.querySelectorAll('.delete-btn').forEach(button => {
      button.addEventListener('click', (e) => {
        const meetingId = e.currentTarget.getAttribute('data-id');
        
        if (confirm('Are you sure you want to delete this meeting?')) {
          this.deleteMeeting(meetingId);
          this.renderMeetings();
        }
      });
    });
  }
  
  /**
   * Render the nearby members screen
   */
  renderNearby() {
    this.root.innerHTML = `
      <div class="nearby-container">
        <header>
          <h1>Nearby Members</h1>
          <p class="subtitle">Connect with the fellowship</p>
        </header>
        
        <div class="discovery-section">
          <div class="discovery-icon">
            <i class="fas fa-broadcast-tower"></i>
          </div>
          <h2 class="discovery-title">Member Discovery</h2>
          <p class="discovery-description">
            Find other members nearby who have opted to share their location. Your privacy is always protected.
          </p>
          
          <div class="steps-container">
            <div class="step">
              <div class="step-number">1</div>
              <div class="step-content">
                <h3>Enable Location</h3>
                <p>Turn on location sharing in your profile settings.</p>
              </div>
            </div>
            
            <div class="step">
              <div class="step-number">2</div>
              <div class="step-content">
                <h3>Start Discovery</h3>
                <p>Press the button below to scan for nearby members.</p>
              </div>
            </div>
            
            <div class="step">
              <div class="step-number">3</div>
              <div class="step-content">
                <h3>Connect Safely</h3>
                <p>Choose to connect with members you wish to communicate with.</p>
              </div>
            </div>
          </div>
          
          <button class="discovery-button" id="start-discovery-btn">
            <i class="fas fa-search"></i> Start Discovery
          </button>
        </div>
        
        <div class="info-card card">
          <div class="card-header">
            <i class="fas fa-info-circle"></i>
            <h2>Privacy First</h2>
          </div>
          <p>
            Your location is never stored on a server or shared without your explicit permission.
            Discovery only works when both members have opted in to location sharing.
          </p>
        </div>
      </div>
    `;
    
    // Add event listener to discovery button
    document.getElementById('start-discovery-btn').addEventListener('click', () => {
      this.simulateProximityDiscovery();
    });
  }
  
  /**
   * Simulate proximity discovery for nearby members
   */
  simulateProximityDiscovery() {
    // Check if location sharing is enabled
    if (!this.user.privacySettings.shareLocation) {
      alert('Please enable location sharing in your profile first.');
      this.navigateTo('profile');
      return;
    }
    
    // Show loading state
    const discoverySection = document.querySelector('.discovery-section');
    discoverySection.innerHTML = `
      <div class="loading-container">
        <div class="loading-spinner"></div>
        <p>Scanning for nearby members...</p>
      </div>
    `;
    
    // Simulate discovery delay
    setTimeout(() => {
      // Sample nearby members data (for demonstration)
      const nearbyMembers = [
        {
          id: 'mem1',
          name: 'Robert J.',
          sobrietyDate: '2018-04-15',
          homeGroup: 'Serenity Group',
          distance: 0.3
        },
        {
          id: 'mem2',
          name: 'Sara M.',
          sobrietyDate: '2020-09-21',
          homeGroup: 'Downtown Group',
          distance: 0.7
        },
        {
          id: 'mem3',
          name: 'Michael T.',
          sobrietyDate: '2015-02-28',
          homeGroup: 'Morning Meditation',
          distance: 1.2
        }
      ];
      
      // Create nearby members HTML
      let membersHTML = '';
      nearbyMembers.forEach(member => {
        // Calculate approximate sobriety time for display
        const sobrietyDays = window.Database.calculateSobrietyDays(member.sobrietyDate);
        const sobrietyYears = Math.floor(sobrietyDays / 365);
        const sobrietyTime = sobrietyYears >= 1 ? 
          `${sobrietyYears} year${sobrietyYears !== 1 ? 's' : ''}` : 
          `${Math.floor(sobrietyDays / 30)} month${Math.floor(sobrietyDays / 30) !== 1 ? 's' : ''}`;
        
        membersHTML += `
          <div class="nearby-member">
            <div class="member-avatar">
              <i class="fas fa-user"></i>
            </div>
            <div class="member-details">
              <div class="member-name">${member.name}</div>
              <div class="member-meta">
                ${sobrietyTime} · ${member.homeGroup}
              </div>
            </div>
            <div class="member-distance">${member.distance} mi</div>
            <button class="connect-btn" data-id="${member.id}">
              <i class="fas fa-user-plus"></i>
            </button>
          </div>
        `;
      });
      
      // Update discovery section with results
      discoverySection.innerHTML = `
        <div class="discovery-icon">
          <i class="fas fa-check-circle"></i>
        </div>
        <h2 class="discovery-title">Discovery Complete</h2>
        <p class="discovery-description">
          ${nearbyMembers.length} members found nearby
        </p>
        
        <div class="nearby-members-list">
          ${membersHTML}
        </div>
        
        <button class="discovery-button" id="restart-discovery-btn" style="margin-top: 20px">
          <i class="fas fa-redo"></i> Scan Again
        </button>
        
        <p class="discovery-note">
          Note: This is a simulated feature. In production, this would use Bluetooth
          or similar technology for proximity detection.
        </p>
      `;
      
      // Add event listeners
      document.getElementById('restart-discovery-btn').addEventListener('click', () => {
        this.simulateProximityDiscovery();
      });
      
      document.querySelectorAll('.connect-btn').forEach(button => {
        button.addEventListener('click', function() {
          const memberId = this.getAttribute('data-id');
          alert(`Connection request sent to member #${memberId}`);
          
          // Change button to show connected
          this.innerHTML = '<i class="fas fa-check"></i>';
          this.style.backgroundColor = '#2ecc71';
          this.disabled = true;
        });
      });
    }, 2000); // 2 second delay for simulation
  }
  
  /**
   * Render the profile screen
   */
  renderProfile() {
    this.root.innerHTML = `
      <div class="profile-container">
        <header>
          <h1>Your Profile</h1>
          <p class="subtitle">Manage your personal information</p>
        </header>
        
        <div class="profile-header">
          <div class="profile-avatar">
            <i class="fas fa-user"></i>
          </div>
          <h2 class="profile-name">${this.user.name}</h2>
          <p class="profile-group">${this.user.homeGroup || 'No home group set'}</p>
        </div>
        
        <div class="card">
          <h3>Personal Information</h3>
          <form id="profile-form" class="form">
            <div class="form-group">
              <label for="user-name">Name</label>
              <input type="text" id="user-name" value="${this.user.name}" required>
              <p class="input-note">First name and last initial (e.g., John D.)</p>
            </div>
            
            <div class="form-group">
              <label for="sobriety-date">Sobriety Date</label>
              <input type="date" id="sobriety-date" value="${this.user.sobrietyDate}" required>
            </div>
            
            <div class="form-group">
              <label for="home-group">Home Group</label>
              <input type="text" id="home-group" value="${this.user.homeGroup || ''}">
            </div>
            
            <div class="form-group">
              <label for="user-phone">Phone (optional)</label>
              <input type="tel" id="user-phone" value="${this.user.phone || ''}">
            </div>
            
            <div class="form-group">
              <label for="user-email">Email (optional)</label>
              <input type="email" id="user-email" value="${this.user.email || ''}">
            </div>
            
            <h3>Privacy Settings</h3>
            
            <div class="form-group checkbox-group">
              <input type="checkbox" id="share-location" ${this.user.privacySettings.shareLocation ? 'checked' : ''}>
              <label for="share-location">Share location for nearby member discovery</label>
            </div>
            
            <div class="form-group checkbox-group">
              <input type="checkbox" id="share-activities" ${this.user.privacySettings.shareActivities ? 'checked' : ''}>
              <label for="share-activities">Share activities with connected members</label>
            </div>
            
            <button type="submit" class="button-primary">Save Profile</button>
          </form>
        </div>
      </div>
    `;
    
    // Set up form submission
    document.getElementById('profile-form').addEventListener('submit', (e) => {
      e.preventDefault();
      
      const userData = {
        name: document.getElementById('user-name').value,
        sobrietyDate: document.getElementById('sobriety-date').value,
        homeGroup: document.getElementById('home-group').value,
        phone: document.getElementById('user-phone').value,
        email: document.getElementById('user-email').value,
        privacySettings: {
          shareLocation: document.getElementById('share-location').checked,
          shareActivities: document.getElementById('share-activities').checked
        }
      };
      
      this.updateUser(userData);
      
      alert('Profile updated successfully!');
      this.navigateTo('dashboard');
    });
  }
  
  /**
   * Show spiritual fitness details in a modal
   */
  showSpiritualFitnessDetails() {
    const spiritualFitness = this.spiritualFitness || { score: 0, components: {}, activityCounts: {} };
    const components = spiritualFitness.components || {};
    const activityCounts = spiritualFitness.activityCounts || {};
    
    // Create modal element
    const modalElement = document.createElement('div');
    modalElement.className = 'modal-backdrop';
    modalElement.id = 'fitness-modal';
    
    modalElement.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2 class="modal-title">Spiritual Fitness Details</h2>
          <button class="modal-close" id="close-modal">&times;</button>
        </div>
        
        <div class="fitness-details">
          <div class="fitness-score-container">
            <div class="fitness-score-circle">
              <span class="fitness-score-value">${spiritualFitness.score.toFixed(2)}</span>
              <span class="fitness-score-max">/10</span>
            </div>
            <p class="fitness-score-note">Based on your last 30 days of activities</p>
          </div>
          
          <div class="fitness-breakdown">
            <h3>Score Breakdown</h3>
            
            <div class="fitness-category">
              <div class="category-header">
                <h4 class="category-name">Meeting Attendance</h4>
                <span class="category-score">${(components.meetings || 0).toFixed(1)}/3.0</span>
              </div>
              <div class="progress-bar">
                <div class="progress-fill" style="width: ${((components.meetings || 0) / 3) * 100}%"></div>
              </div>
              <p>${activityCounts.meeting || 0} meetings in the last 30 days</p>
            </div>
            
            <div class="fitness-category">
              <div class="category-header">
                <h4 class="category-name">Prayer & Meditation</h4>
                <span class="category-score">${(components.prayer || 0).toFixed(1)}/2.0</span>
              </div>
              <div class="progress-bar">
                <div class="progress-fill" style="width: ${((components.prayer || 0) / 2) * 100}%"></div>
              </div>
              <p>${(activityCounts.prayer || 0) + (activityCounts.meditation || 0)} sessions in the last 30 days</p>
            </div>
            
            <div class="fitness-category">
              <div class="category-header">
                <h4 class="category-name">Reading</h4>
                <span class="category-score">${(components.reading || 0).toFixed(1)}/1.5</span>
              </div>
              <div class="progress-bar">
                <div class="progress-fill" style="width: ${((components.reading || 0) / 1.5) * 100}%"></div>
              </div>
              <p>${activityCounts.reading || 0} reading sessions in the last 30 days</p>
            </div>
            
            <div class="fitness-category">
              <div class="category-header">
                <h4 class="category-name">Service Work</h4>
                <span class="category-score">${(components.service || 0).toFixed(1)}/1.5</span>
              </div>
              <div class="progress-bar">
                <div class="progress-fill" style="width: ${((components.service || 0) / 1.5) * 100}%"></div>
              </div>
              <p>${activityCounts.service || 0} service activities in the last 30 days</p>
            </div>
            
            <div class="fitness-category">
              <div class="category-header">
                <h4 class="category-name">Step Work</h4>
                <span class="category-score">${(components.stepwork || 0).toFixed(1)}/1.0</span>
              </div>
              <div class="progress-bar">
                <div class="progress-fill" style="width: ${((components.stepwork || 0) / 1) * 100}%"></div>
              </div>
              <p>${activityCounts.stepwork || 0} step work sessions in the last 30 days</p>
            </div>
            
            <div class="fitness-category">
              <div class="category-header">
                <h4 class="category-name">Sponsorship</h4>
                <span class="category-score">${(components.sponsorship || 0).toFixed(1)}/1.0</span>
              </div>
              <div class="progress-bar">
                <div class="progress-fill" style="width: ${((components.sponsorship || 0) / 1) * 100}%"></div>
              </div>
              <p>${activityCounts.sponsorship || 0} sponsorship interactions in the last 30 days</p>
            </div>
          </div>
          
          <div class="fitness-explanation">
            <h3>About Spiritual Fitness</h3>
            <p>Your spiritual fitness score reflects your engagement with key recovery activities over the past 30 days. The more consistent your practice, the higher your score.</p>
            <p>The score is weighted to reflect the importance of different activities in maintaining a strong recovery:</p>
            <ul>
              <li><strong>Meeting attendance (30%):</strong> Regular fellowship is essential</li>
              <li><strong>Prayer & meditation (20%):</strong> Connection with higher power</li>
              <li><strong>Reading (15%):</strong> Learning from program literature</li>
              <li><strong>Service work (15%):</strong> Helping others in recovery</li>
              <li><strong>Step work (10%):</strong> Working through the steps</li>
              <li><strong>Sponsorship (10%):</strong> Giving and receiving guidance</li>
            </ul>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="button-primary" id="close-fitness-btn">Close</button>
        </div>
      </div>
    `;
    
    // Add modal to the document
    document.body.appendChild(modalElement);
    
    // Set up close buttons
    document.getElementById('close-modal').addEventListener('click', () => {
      document.body.removeChild(modalElement);
    });
    
    document.getElementById('close-fitness-btn').addEventListener('click', () => {
      document.body.removeChild(modalElement);
    });
    
    // Close on background click
    modalElement.addEventListener('click', (e) => {
      if (e.target === modalElement) {
        document.body.removeChild(modalElement);
      }
    });
  }
  
  /**
   * Save a new activity or update an existing one
   * @param {Object} activity - The activity data to save
   * @returns {Object} The saved activity
   */
  saveActivity(activity) {
    try {
      // Save or update the activity
      const savedActivity = window.Database.activityOperations.create(activity);
      
      // Update activities list
      if (!this.activities) {
        this.activities = [];
      }
      
      // Check if this is an update (has ID and exists in the list)
      const existingIndex = this.activities.findIndex(a => a.id === savedActivity.id);
      if (existingIndex >= 0) {
        // Update existing
        this.activities[existingIndex] = savedActivity;
      } else {
        // Add new
        this.activities.push(savedActivity);
      }
      
      // Recalculate spiritual fitness
      this.calculateSpiritualFitness();
      
      return savedActivity;
    } catch (error) {
      console.error('Error saving activity:', error);
      alert('Failed to save activity. Please try again.');
      return null;
    }
  }
  
  /**
   * Delete an activity
   * @param {string} activityId - The ID of the activity to delete
   * @returns {boolean} Whether the deletion was successful
   */
  deleteActivity(activityId) {
    try {
      // Delete from database
      const success = window.Database.activityOperations.delete(activityId);
      
      if (success) {
        // Remove from activities list
        this.activities = this.activities.filter(a => a.id !== activityId);
        
        // Recalculate spiritual fitness
        this.calculateSpiritualFitness();
      }
      
      return success;
    } catch (error) {
      console.error('Error deleting activity:', error);
      alert('Failed to delete activity. Please try again.');
      return false;
    }
  }
  
  /**
   * Save a new meeting or update an existing one
   * @param {Object} meeting - The meeting data to save
   * @returns {Object} The saved meeting
   */
  saveMeeting(meeting) {
    try {
      // Save or update the meeting
      const savedMeeting = window.Database.meetingOperations.create(meeting);
      
      // Update meetings list
      if (!this.meetings) {
        this.meetings = [];
      }
      
      // Check if this is an update (has ID and exists in the list)
      const existingIndex = this.meetings.findIndex(m => m.id === savedMeeting.id);
      if (existingIndex >= 0) {
        // Update existing
        this.meetings[existingIndex] = savedMeeting;
      } else {
        // Add new
        this.meetings.push(savedMeeting);
      }
      
      return savedMeeting;
    } catch (error) {
      console.error('Error saving meeting:', error);
      alert('Failed to save meeting. Please try again.');
      return null;
    }
  }
  
  /**
   * Delete a meeting
   * @param {string} meetingId - The ID of the meeting to delete
   * @returns {boolean} Whether the deletion was successful
   */
  deleteMeeting(meetingId) {
    try {
      // Delete from database
      const success = window.Database.meetingOperations.delete(meetingId);
      
      if (success) {
        // Remove from meetings list
        this.meetings = this.meetings.filter(m => m.id !== meetingId);
      }
      
      return success;
    } catch (error) {
      console.error('Error deleting meeting:', error);
      alert('Failed to delete meeting. Please try again.');
      return false;
    }
  }
  
  /**
   * Update user profile data
   * @param {Object} userData - The user data to update
   * @returns {Object} The updated user
   */
  updateUser(userData) {
    try {
      // Update the user
      const updatedUser = window.Database.userOperations.update(this.user.id, userData);
      
      // Update local user data
      this.user = updatedUser;
      
      return updatedUser;
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user. Please try again.');
      return null;
    }
  }
  
  /**
   * Calculate the number of sobriety days
   * @returns {number} Number of days sober
   */
  calculateSobrietyDays() {
    if (!this.user || !this.user.sobrietyDate) return 0;
    
    return window.Database.calculateSobrietyDays(this.user.sobrietyDate);
  }
  
  /**
   * Calculate sobriety years with decimal precision
   * @param {number} decimalPlaces - Number of decimal places (default: 2)
   * @returns {number} Years of sobriety with decimal precision
   */
  calculateSobrietyYears(decimalPlaces = 2) {
    if (!this.user || !this.user.sobrietyDate) return 0;
    
    return window.Database.calculateSobrietyYears(this.user.sobrietyDate, decimalPlaces);
  }
  
  /**
   * Format a number with commas for thousands separators
   * @param {number} number - The number to format
   * @returns {string} Formatted number string with commas
   */
  formatNumberWithCommas(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
  
  /**
   * Format a date string to a readable format
   * @param {string} dateString - Date in ISO format
   * @returns {string} Formatted date string
   */
  formatDate(dateString) {
    if (!dateString) return '';
    
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    
    return new Date(dateString).toLocaleDateString(undefined, options);
  }
  
  /**
   * Get the appropriate icon for an activity type
   * @param {string} type - Activity type
   * @returns {string} Icon class name
   */
  getActivityIcon(type) {
    const icons = {
      meeting: 'fas fa-users',
      prayer: 'fas fa-pray',
      meditation: 'fas fa-om',
      reading: 'fas fa-book',
      service: 'fas fa-hands-helping',
      stepwork: 'fas fa-tasks',
      sponsorship: 'fas fa-user-friends'
    };
    
    return icons[type] || 'fas fa-star';
  }
  
  /**
   * Render an error screen
   * @param {string} message - Error message to display
   */
  renderErrorScreen(message) {
    this.root.innerHTML = `
      <div class="error-container">
        <div class="error-icon">
          <i class="fas fa-exclamation-circle"></i>
        </div>
        <h2 class="error-title">Something went wrong</h2>
        <p class="error-message">${message}</p>
        <button class="error-button" id="error-reload-btn">Reload App</button>
      </div>
    `;
    
    document.getElementById('error-reload-btn').addEventListener('click', () => {
      window.location.reload();
    });
  }
}

// Export the class for usage
window.SpiritualConditionTracker = SpiritualConditionTracker;