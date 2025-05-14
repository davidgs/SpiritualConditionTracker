// Main App Component for Spiritual Condition Tracker (Web Version)

class App {
  constructor(rootElement) {
    this.root = rootElement;
    this.currentScreen = 'dashboard';
    this.user = null;
    this.activities = [];
    this.meetings = [];
    this.spiritualFitness = null;
    
    // Database initialization
    this.initializeDatabase()
      .then(() => this.loadUserData())
      .then(() => this.renderApp())
      .catch(error => {
        console.error('Error initializing app:', error);
        this.renderErrorScreen(error.message);
      });
  }
  
  async initializeDatabase() {
    try {
      // Initialize SQLite database using WebAssembly
      this.dbInitialized = false;
      
      if (window.initSqlJs) {
        const SQL = await window.initSqlJs({
          locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
        });
        
        // Create a new database
        this.db = new SQL.Database();
        
        // Create tables
        this.db.run(`
          CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            name TEXT,
            sobrietyDate TEXT,
            homeGroup TEXT,
            phone TEXT,
            email TEXT,
            privacySettings TEXT,
            createdAt TEXT,
            updatedAt TEXT
          );
        `);
        
        this.db.run(`
          CREATE TABLE IF NOT EXISTS activities (
            id TEXT PRIMARY KEY,
            userId TEXT,
            type TEXT,
            date TEXT,
            duration INTEGER,
            name TEXT,
            notes TEXT,
            createdAt TEXT,
            FOREIGN KEY(userId) REFERENCES users(id)
          );
        `);
        
        this.db.run(`
          CREATE TABLE IF NOT EXISTS meetings (
            id TEXT PRIMARY KEY,
            name TEXT,
            day TEXT,
            time TEXT,
            location TEXT,
            address TEXT,
            city TEXT,
            state TEXT,
            zip TEXT,
            type TEXT,
            notes TEXT,
            shared INTEGER,
            createdBy TEXT,
            createdAt TEXT,
            updatedAt TEXT,
            FOREIGN KEY(createdBy) REFERENCES users(id)
          );
        `);
        
        this.db.run(`
          CREATE TABLE IF NOT EXISTS spiritual_fitness (
            id TEXT PRIMARY KEY,
            userId TEXT,
            score REAL,
            calculatedAt TEXT,
            FOREIGN KEY(userId) REFERENCES users(id)
          );
        `);
        
        this.dbInitialized = true;
        console.log('SQLite database initialized successfully');
      } else {
        // Fallback to localStorage if SQLite initialization fails
        console.warn('SQLite not available, falling back to localStorage');
        this.dbInitialized = true;
      }
      
      return this.dbInitialized;
    } catch (error) {
      console.error('Error initializing database:', error);
      // Fallback to localStorage
      console.warn('Falling back to localStorage due to error');
      this.dbInitialized = true;
      return this.dbInitialized;
    }
  }
  
  async loadUserData() {
    try {
      // Attempt to load existing user data
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        this.user = JSON.parse(storedUser);
        console.log('User data loaded:', this.user);
      } else {
        // Create default user if none exists
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
      throw error;
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
    
    // Calculate final score (normalized to 100)
    let finalScore = 0;
    if (eligibleActivities > 0) {
      finalScore = Math.min(100, (totalPoints / (eligibleActivities * 4)) * 10);
      finalScore = Math.round(finalScore * 100) / 100; // Round to 2 decimal places
    }
    
    this.spiritualFitness = {
      score: finalScore,
      breakdown,
      eligibleActivities,
      totalPoints,
      calculatedAt: new Date().toISOString()
    };
    
    console.log('Spiritual fitness calculated:', this.spiritualFitness);
    localStorage.setItem('spiritualFitness', JSON.stringify(this.spiritualFitness));
    
    return this.spiritualFitness;
  }
  
  saveActivity(activity) {
    // Validate activity
    if (!activity.type || !activity.date) {
      throw new Error('Activity must have a type and date');
    }
    
    // Generate ID if not provided
    if (!activity.id) {
      activity.id = `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    // Add user ID and timestamp
    activity.userId = this.user.id;
    activity.createdAt = activity.createdAt || new Date().toISOString();
    
    // Add to activities array
    this.activities.push(activity);
    
    // Save to storage
    localStorage.setItem('activities', JSON.stringify(this.activities));
    
    // Recalculate spiritual fitness
    this.calculateSpiritualFitness();
    
    console.log('Activity saved:', activity);
    
    return activity;
  }
  
  saveMeeting(meeting) {
    // Validate meeting
    if (!meeting.name || !meeting.day || !meeting.time) {
      throw new Error('Meeting must have a name, day, and time');
    }
    
    // Generate ID if not provided
    if (!meeting.id) {
      meeting.id = `meeting_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    // Add user ID and timestamps
    meeting.createdBy = this.user.id;
    meeting.createdAt = meeting.createdAt || new Date().toISOString();
    meeting.updatedAt = new Date().toISOString();
    
    // Add to meetings array
    this.meetings.push(meeting);
    
    // Save to storage
    localStorage.setItem('meetings', JSON.stringify(this.meetings));
    
    console.log('Meeting saved:', meeting);
    
    return meeting;
  }
  
  updateUser(userData) {
    // Update user object
    this.user = { ...this.user, ...userData, updatedAt: new Date().toISOString() };
    
    // Save to storage
    localStorage.setItem('user', JSON.stringify(this.user));
    
    console.log('User updated:', this.user);
    
    return this.user;
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
  
  navigateTo(screen) {
    this.currentScreen = screen;
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
    
    // Add navigation event listeners
    this.attachNavListeners();
  }
  
  renderDashboard() {
    const sobrietyDays = this.calculateSobrietyDays();
    const sobrietyYears = this.calculateSobrietyYears();
    const fitnessScore = this.spiritualFitness?.score || 0;
    
    // Get recent activities (up to 5)
    const recentActivities = [...this.activities]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
    
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
              <span class="score-max">/100</span>
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
    
    // Add event listeners
    document.getElementById('update-sobriety-btn').addEventListener('click', () => this.navigateTo('profile'));
    document.getElementById('view-fitness-btn').addEventListener('click', () => this.showSpiritualFitnessDetails());
    document.getElementById('log-activity-btn').addEventListener('click', () => this.navigateTo('activities'));
    document.getElementById('find-meetings-btn').addEventListener('click', () => this.navigateTo('meetings'));
    document.getElementById('nearby-members-btn').addEventListener('click', () => this.navigateTo('nearby'));
    document.getElementById('track-progress-btn').addEventListener('click', () => this.showSpiritualFitnessDetails());
  }
  
  renderActivities() {
    // Sort activities by date (newest first)
    const sortedActivities = [...this.activities].sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    );
    
    this.root.innerHTML = `
      <div class="activities-container">
        <header>
          <h1>Recovery Activities</h1>
          <p class="subtitle">Track your spiritual fitness activities</p>
        </header>
        
        <!-- Activity Form -->
        <div class="card">
          <h2>Log New Activity</h2>
          
          <form id="activity-form" class="form">
            <div class="form-group">
              <label for="activity-type">Activity Type</label>
              <select id="activity-type" name="activity-type" required>
                <option value="">Select Activity Type</option>
                <option value="meeting">Meeting</option>
                <option value="prayer">Prayer/Meditation</option>
                <option value="reading">Reading</option>
                <option value="stepWork">Step Work</option>
                <option value="service">Service Work</option>
                <option value="callSponsor">Call Sponsor</option>
                <option value="callSponsee">Call Sponsee</option>
              </select>
            </div>
            
            <div class="form-group" id="meeting-name-group" style="display: none;">
              <label for="meeting-name">Meeting Name</label>
              <input type="text" id="meeting-name" name="meeting-name" placeholder="e.g., Big Book Study">
            </div>
            
            <div class="form-group" id="duration-group" style="display: none;">
              <label for="duration">Duration (minutes)</label>
              <input type="number" id="duration" name="duration" min="1" value="30">
            </div>
            
            <div class="form-group">
              <label for="activity-date">Date</label>
              <input type="date" id="activity-date" name="activity-date" required value="${new Date().toISOString().split('T')[0]}">
            </div>
            
            <div class="form-group">
              <label for="activity-notes">Notes</label>
              <textarea id="activity-notes" name="activity-notes" rows="3" placeholder="Optional notes about this activity"></textarea>
            </div>
            
            <div class="form-buttons">
              <button type="button" id="cancel-activity" class="button-secondary">Cancel</button>
              <button type="submit" id="save-activity" class="button-primary">Log Activity</button>
            </div>
          </form>
        </div>
        
        <!-- Activity History -->
        <div class="card">
          <h2>Activity History</h2>
          
          ${sortedActivities.length > 0 ? `
            <div class="activities-list">
              ${sortedActivities.map(activity => `
                <div class="activity-item">
                  <div class="activity-icon ${activity.type}-icon">
                    <i class="fas ${this.getActivityIcon(activity.type)}"></i>
                  </div>
                  <div class="activity-details">
                    <div class="activity-title">${this.capitalizeFirst(activity.type)}${activity.name ? ': ' + activity.name : ''}</div>
                    <div class="activity-meta">${activity.duration ? activity.duration + ' min' : ''} • ${this.formatDate(activity.date)}</div>
                    ${activity.notes ? `<div class="activity-notes">${activity.notes}</div>` : ''}
                  </div>
                  <button class="delete-btn" data-id="${activity.id}">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              `).join('')}
            </div>
          ` : `
            <p class="empty-state">No activities logged yet. Start by logging your first activity above.</p>
          `}
        </div>
        
        <button class="back-btn" id="back-to-dashboard">
          <i class="fas fa-arrow-left"></i> Back to Dashboard
        </button>
      </div>
    `;
    
    // Add event listeners
    const activityForm = document.getElementById('activity-form');
    const activityType = document.getElementById('activity-type');
    const cancelButton = document.getElementById('cancel-activity');
    const backButton = document.getElementById('back-to-dashboard');
    const deleteButtons = document.querySelectorAll('.delete-btn');
    
    // Activity type change
    activityType.addEventListener('change', () => {
      const meetingNameGroup = document.getElementById('meeting-name-group');
      const durationGroup = document.getElementById('duration-group');
      
      // Reset display
      meetingNameGroup.style.display = 'none';
      durationGroup.style.display = 'none';
      
      // Show relevant fields
      if (activityType.value === 'meeting') {
        meetingNameGroup.style.display = 'block';
      } else if (['prayer', 'meditation', 'reading', 'stepWork', 'service', 'callSponsor', 'callSponsee'].includes(activityType.value)) {
        durationGroup.style.display = 'block';
      }
    });
    
    // Form submission
    activityForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Get form values
      const type = activityType.value;
      const date = document.getElementById('activity-date').value;
      const notes = document.getElementById('activity-notes').value;
      
      // Create activity object
      const activity = {
        type,
        date,
        notes
      };
      
      // Add type-specific details
      if (type === 'meeting') {
        activity.name = document.getElementById('meeting-name').value;
      } else {
        activity.duration = parseInt(document.getElementById('duration').value, 10);
      }
      
      // Save activity
      this.saveActivity(activity);
      
      // Reset form
      activityForm.reset();
      
      // Refresh screen
      this.renderActivities();
    });
    
    // Cancel button
    cancelButton.addEventListener('click', () => {
      this.navigateTo('dashboard');
    });
    
    // Back button
    backButton.addEventListener('click', () => {
      this.navigateTo('dashboard');
    });
    
    // Delete buttons
    deleteButtons.forEach(button => {
      button.addEventListener('click', () => {
        const activityId = button.getAttribute('data-id');
        this.deleteActivity(activityId);
      });
    });
  }
  
  renderMeetings() {
    this.root.innerHTML = `
      <div class="meetings-container">
        <header>
          <h1>AA Meetings</h1>
          <p class="subtitle">Find and manage your meetings</p>
        </header>
        
        <!-- Meeting Form -->
        <div class="card">
          <h2>Add New Meeting</h2>
          
          <form id="meeting-form" class="form">
            <div class="form-group">
              <label for="meeting-name">Meeting Name</label>
              <input type="text" id="meeting-name" name="meeting-name" required placeholder="e.g., Downtown Big Book Study">
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="meeting-day">Day of Week</label>
                <select id="meeting-day" name="meeting-day" required>
                  <option value="">Select Day</option>
                  <option value="monday">Monday</option>
                  <option value="tuesday">Tuesday</option>
                  <option value="wednesday">Wednesday</option>
                  <option value="thursday">Thursday</option>
                  <option value="friday">Friday</option>
                  <option value="saturday">Saturday</option>
                  <option value="sunday">Sunday</option>
                </select>
              </div>
              
              <div class="form-group">
                <label for="meeting-time">Time</label>
                <input type="time" id="meeting-time" name="meeting-time" required>
              </div>
            </div>
            
            <div class="form-group">
              <label for="meeting-location">Location</label>
              <input type="text" id="meeting-location" name="meeting-location" required placeholder="e.g., Community Center">
            </div>
            
            <div class="form-group">
              <label for="meeting-address">Address</label>
              <input type="text" id="meeting-address" name="meeting-address" placeholder="e.g., 123 Main St">
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="meeting-city">City</label>
                <input type="text" id="meeting-city" name="meeting-city" placeholder="e.g., Anytown">
              </div>
              
              <div class="form-group">
                <label for="meeting-state">State</label>
                <input type="text" id="meeting-state" name="meeting-state" placeholder="e.g., CA">
              </div>
              
              <div class="form-group">
                <label for="meeting-zip">ZIP</label>
                <input type="text" id="meeting-zip" name="meeting-zip" placeholder="e.g., 90210">
              </div>
            </div>
            
            <div class="form-group">
              <label for="meeting-type">Meeting Type</label>
              <select id="meeting-type" name="meeting-type">
                <option value="">Select Type</option>
                <option value="open">Open</option>
                <option value="closed">Closed</option>
                <option value="speaker">Speaker</option>
                <option value="discussion">Discussion</option>
                <option value="big-book">Big Book</option>
                <option value="steps">12 Steps</option>
                <option value="traditions">12 Traditions</option>
                <option value="beginner">Beginner</option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="meeting-notes">Notes</label>
              <textarea id="meeting-notes" name="meeting-notes" rows="3" placeholder="Additional details about this meeting"></textarea>
            </div>
            
            <div class="form-group checkbox-group">
              <input type="checkbox" id="meeting-shared" name="meeting-shared">
              <label for="meeting-shared">Share this meeting with other app users</label>
            </div>
            
            <div class="form-buttons">
              <button type="button" id="cancel-meeting" class="button-secondary">Cancel</button>
              <button type="submit" id="save-meeting" class="button-primary">Save Meeting</button>
            </div>
          </form>
        </div>
        
        <!-- Meeting List -->
        <div class="card">
          <h2>Your Meetings</h2>
          
          ${this.meetings.length > 0 ? `
            <div class="meetings-list">
              ${this.meetings.map(meeting => `
                <div class="meeting-item">
                  <div class="meeting-day-badge">${this.capitalizeFirst(meeting.day).substr(0, 3)}</div>
                  <div class="meeting-details">
                    <div class="meeting-title">${meeting.name}</div>
                    <div class="meeting-meta">
                      <span>${meeting.time}</span> • 
                      <span>${meeting.location}</span>
                      ${meeting.shared ? ' • <span class="shared-badge">Shared</span>' : ''}
                    </div>
                    ${meeting.address ? `<div class="meeting-address">${meeting.address}, ${meeting.city || ''} ${meeting.state || ''} ${meeting.zip || ''}</div>` : ''}
                    ${meeting.notes ? `<div class="meeting-notes">${meeting.notes}</div>` : ''}
                  </div>
                  <button class="delete-btn" data-id="${meeting.id}">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              `).join('')}
            </div>
          ` : `
            <p class="empty-state">No meetings added yet. Start by adding your first meeting above.</p>
          `}
        </div>
        
        <button class="back-btn" id="back-to-dashboard">
          <i class="fas fa-arrow-left"></i> Back to Dashboard
        </button>
      </div>
    `;
    
    // Add event listeners
    const meetingForm = document.getElementById('meeting-form');
    const cancelButton = document.getElementById('cancel-meeting');
    const backButton = document.getElementById('back-to-dashboard');
    const deleteButtons = document.querySelectorAll('.delete-btn');
    
    // Form submission
    meetingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Get form values
      const meeting = {
        name: document.getElementById('meeting-name').value,
        day: document.getElementById('meeting-day').value,
        time: document.getElementById('meeting-time').value,
        location: document.getElementById('meeting-location').value,
        address: document.getElementById('meeting-address').value,
        city: document.getElementById('meeting-city').value,
        state: document.getElementById('meeting-state').value,
        zip: document.getElementById('meeting-zip').value,
        type: document.getElementById('meeting-type').value,
        notes: document.getElementById('meeting-notes').value,
        shared: document.getElementById('meeting-shared').checked
      };
      
      // Save meeting
      this.saveMeeting(meeting);
      
      // Reset form
      meetingForm.reset();
      
      // Refresh screen
      this.renderMeetings();
    });
    
    // Cancel button
    cancelButton.addEventListener('click', () => {
      this.navigateTo('dashboard');
    });
    
    // Back button
    backButton.addEventListener('click', () => {
      this.navigateTo('dashboard');
    });
    
    // Delete buttons
    deleteButtons.forEach(button => {
      button.addEventListener('click', () => {
        const meetingId = button.getAttribute('data-id');
        this.deleteMeeting(meetingId);
      });
    });
  }
  
  renderNearby() {
    this.root.innerHTML = `
      <div class="nearby-container">
        <header>
          <h1>Nearby AA Members</h1>
          <p class="subtitle">Connect with others in recovery</p>
        </header>
        
        <!-- Proximity Wizard Card -->
        <div class="card">
          <h2>Proximity Wizard</h2>
          <p>Find and connect with other AA members nearby who have opted in to sharing their location.</p>
          
          <div class="steps-container">
            <div class="step">
              <div class="step-number">1</div>
              <div class="step-content">
                <h3>Enable Location Sharing</h3>
                <p>Update your privacy settings to share your location with nearby members.</p>
                <button class="button-primary" id="enable-location">Update Privacy Settings</button>
              </div>
            </div>
            
            <div class="step">
              <div class="step-number">2</div>
              <div class="step-content">
                <h3>Start Discovery</h3>
                <p>Begin searching for nearby members. Your device will broadcast your presence to others.</p>
                <button class="button-primary" id="start-discovery">Start Discovery</button>
              </div>
            </div>
            
            <div class="step">
              <div class="step-number">3</div>
              <div class="step-content">
                <h3>Connect</h3>
                <p>Send connection requests to members you'd like to connect with.</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Privacy Note -->
        <div class="card info-card">
          <div class="card-header">
            <i class="fas fa-shield-alt"></i>
            <h2>Privacy Information</h2>
          </div>
          <p>Your privacy is important. Location sharing is completely optional and only used when the Proximity Wizard is active. No location data is stored on servers.</p>
        </div>
        
        <button class="back-btn" id="back-to-dashboard">
          <i class="fas fa-arrow-left"></i> Back to Dashboard
        </button>
      </div>
    `;
    
    // Add event listeners
    const enableLocationBtn = document.getElementById('enable-location');
    const startDiscoveryBtn = document.getElementById('start-discovery');
    const backButton = document.getElementById('back-to-dashboard');
    
    // Enable location button
    enableLocationBtn.addEventListener('click', () => {
      this.navigateTo('profile');
    });
    
    // Start discovery button
    startDiscoveryBtn.addEventListener('click', () => {
      this.simulateProximityDiscovery();
    });
    
    // Back button
    backButton.addEventListener('click', () => {
      this.navigateTo('dashboard');
    });
  }
  
  simulateProximityDiscovery() {
    // Check if location sharing is enabled
    if (!this.user.privacySettings.shareLocation) {
      alert('Please enable location sharing in your privacy settings first.');
      return;
    }
    
    // Show a loading indicator
    document.getElementById('start-discovery').innerHTML = 'Searching...';
    document.getElementById('start-discovery').disabled = true;
    
    // After a delay, show a simulated discovery result
    setTimeout(() => {
      // Create simulated nearby members
      const nearbyMembers = [
        { id: 'nearby1', name: 'John D.', distance: '0.5 miles', sobrietyYears: 1.5 },
        { id: 'nearby2', name: 'Sarah M.', distance: '0.8 miles', sobrietyYears: 3.2 },
        { id: 'nearby3', name: 'Robert H.', distance: '1.2 miles', sobrietyYears: 5.7 }
      ];
      
      // Reset button
      document.getElementById('start-discovery').innerHTML = 'Restart Discovery';
      document.getElementById('start-discovery').disabled = false;
      
      // Add discovered members to the page
      const stepsContainer = document.querySelector('.steps-container');
      
      // Create a new element for the results
      const resultsElement = document.createElement('div');
      resultsElement.className = 'discovery-results';
      resultsElement.innerHTML = `
        <h3>Nearby Members Found</h3>
        <div class="nearby-members-list">
          ${nearbyMembers.map(member => `
            <div class="nearby-member">
              <div class="member-avatar">
                <i class="fas fa-user"></i>
              </div>
              <div class="member-details">
                <div class="member-name">${member.name}</div>
                <div class="member-meta">
                  <span>${member.distance}</span> • 
                  <span>${member.sobrietyYears} years sober</span>
                </div>
              </div>
              <button class="connect-btn" data-id="${member.id}">
                <i class="fas fa-user-plus"></i>
              </button>
            </div>
          `).join('')}
        </div>
        <p class="discovery-note">Note: This is a simulated demonstration. In a real application, this would connect to nearby devices.</p>
      `;
      
      // Add the results to the page
      stepsContainer.appendChild(resultsElement);
      
      // Add event listeners to connect buttons
      document.querySelectorAll('.connect-btn').forEach(button => {
        button.addEventListener('click', () => {
          const memberId = button.getAttribute('data-id');
          alert(`Connection request sent to ${nearbyMembers.find(m => m.id === memberId).name}`);
          button.innerHTML = '<i class="fas fa-check"></i>';
          button.disabled = true;
        });
      });
    }, 2000);
  }
  
  renderProfile() {
    this.root.innerHTML = `
      <div class="profile-container">
        <header>
          <h1>Your Profile</h1>
          <p class="subtitle">Update your personal information</p>
        </header>
        
        <!-- Profile Form -->
        <div class="card">
          <h2>Personal Information</h2>
          
          <form id="profile-form" class="form">
            <div class="form-group">
              <label for="profile-name">Your Name</label>
              <input type="text" id="profile-name" name="profile-name" value="${this.user.name}" required>
            </div>
            
            <div class="form-group">
              <label for="sobriety-date">Sobriety Date</label>
              <input type="date" id="sobriety-date" name="sobriety-date" value="${this.user.sobrietyDate.split('T')[0]}" required>
              <p class="input-note">This will be used to calculate your sobriety time.</p>
            </div>
            
            <div class="form-group">
              <label for="home-group">Home Group</label>
              <input type="text" id="home-group" name="home-group" value="${this.user.homeGroup || ''}">
            </div>
            
            <div class="form-group">
              <label for="profile-email">Email Address</label>
              <input type="email" id="profile-email" name="profile-email" value="${this.user.email || ''}">
            </div>
            
            <div class="form-group">
              <label for="profile-phone">Phone Number</label>
              <input type="tel" id="profile-phone" name="profile-phone" value="${this.user.phone || ''}">
            </div>
            
            <h3>Privacy Settings</h3>
            
            <div class="form-group checkbox-group">
              <input type="checkbox" id="share-location" name="share-location" ${this.user.privacySettings.shareLocation ? 'checked' : ''}>
              <label for="share-location">Share my location with nearby members</label>
              <p class="input-note">Allows other app users to discover you when using the Proximity Wizard.</p>
            </div>
            
            <div class="form-group checkbox-group">
              <input type="checkbox" id="share-activities" name="share-activities" ${this.user.privacySettings.shareActivities ? 'checked' : ''}>
              <label for="share-activities">Share my activities with connections</label>
              <p class="input-note">Allows your connections to see your recovery activities.</p>
            </div>
            
            <div class="form-buttons">
              <button type="button" id="cancel-profile" class="button-secondary">Cancel</button>
              <button type="submit" id="save-profile" class="button-primary">Save Profile</button>
            </div>
          </form>
        </div>
        
        <!-- Stats Card -->
        <div class="card">
          <h2>Your Recovery Stats</h2>
          
          <div class="stats-grid">
            <div class="stat">
              <div class="stat-value">${this.calculateSobrietyDays().toLocaleString()}</div>
              <div class="stat-label">Days Sober</div>
            </div>
            
            <div class="stat">
              <div class="stat-value">${this.activities.length}</div>
              <div class="stat-label">Activities Logged</div>
            </div>
            
            <div class="stat">
              <div class="stat-value">${this.meetings.length}</div>
              <div class="stat-label">Meetings Saved</div>
            </div>
            
            <div class="stat">
              <div class="stat-value">${this.spiritualFitness?.score.toFixed(2) || '0.00'}</div>
              <div class="stat-label">Spiritual Fitness</div>
            </div>
          </div>
        </div>
        
        <button class="back-btn" id="back-to-dashboard">
          <i class="fas fa-arrow-left"></i> Back to Dashboard
        </button>
      </div>
    `;
    
    // Add event listeners
    const profileForm = document.getElementById('profile-form');
    const cancelButton = document.getElementById('cancel-profile');
    const backButton = document.getElementById('back-to-dashboard');
    
    // Form submission
    profileForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Get form values
      const userData = {
        name: document.getElementById('profile-name').value,
        sobrietyDate: document.getElementById('sobriety-date').value,
        homeGroup: document.getElementById('home-group').value,
        email: document.getElementById('profile-email').value,
        phone: document.getElementById('profile-phone').value,
        privacySettings: {
          shareLocation: document.getElementById('share-location').checked,
          shareActivities: document.getElementById('share-activities').checked
        }
      };
      
      // Update user
      this.updateUser(userData);
      
      // Show confirmation
      alert('Profile updated successfully');
      
      // Navigate back to dashboard
      this.navigateTo('dashboard');
    });
    
    // Cancel button
    cancelButton.addEventListener('click', () => {
      this.navigateTo('dashboard');
    });
    
    // Back button
    backButton.addEventListener('click', () => {
      this.navigateTo('dashboard');
    });
  }
  
  showSpiritualFitnessDetails() {
    // Calculate fitness if not already done
    if (!this.spiritualFitness) {
      this.calculateSpiritualFitness();
    }
    
    // Create modal content
    const modalContent = `
      <div class="modal-content">
        <div class="modal-header">
          <h2>Spiritual Fitness Details</h2>
          <button class="close-modal">&times;</button>
        </div>
        
        <div class="modal-body">
          <div class="fitness-score-container">
            <div class="fitness-score-circle">
              <span class="fitness-score-value">${this.spiritualFitness.score.toFixed(2)}</span>
              <span class="fitness-score-max">/100</span>
            </div>
            <p class="fitness-score-note">Based on your recent activities</p>
          </div>
          
          <div class="fitness-breakdown">
            <h3>Score Breakdown</h3>
            <p>Your spiritual fitness score is calculated based on your recovery activities from the past 30 days.</p>
            
            <div class="breakdown-list">
              ${Object.entries(this.spiritualFitness.breakdown).map(([type, data]) => `
                <div class="breakdown-item">
                  <div class="breakdown-type">
                    <i class="fas ${this.getActivityIcon(type)}"></i>
                    <span>${this.capitalizeFirst(type)}</span>
                  </div>
                  <div class="breakdown-details">
                    <div class="breakdown-count">${data.count} activities</div>
                    <div class="breakdown-points">${data.points} points</div>
                  </div>
                </div>
              `).join('') || '<p>No activities recorded in the past 30 days.</p>'}
            </div>
            
            <div class="fitness-explanation">
              <h3>How It's Calculated</h3>
              <p>Your spiritual fitness score is based on a weighted calculation of your recovery activities. Different activities contribute different amounts to your overall score:</p>
              <ul>
                <li><strong>Meetings:</strong> 10 points each</li>
                <li><strong>Prayer/Meditation:</strong> 8 points each</li>
                <li><strong>Reading AA Literature:</strong> 6 points each</li>
                <li><strong>Step Work:</strong> 10 points each</li>
                <li><strong>Service Work:</strong> 9 points each</li>
                <li><strong>Sponsor Contact:</strong> 5 points each</li>
              </ul>
              <p>The final score is normalized to a 0-100 scale.</p>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="button-primary" id="close-fitness-details">Close</button>
        </div>
      </div>
    `;
    
    // Create modal element
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = modalContent;
    
    // Add modal to the page
    document.body.appendChild(modal);
    
    // Add event listeners
    const closeButtons = modal.querySelectorAll('.close-modal, #close-fitness-details');
    closeButtons.forEach(button => {
      button.addEventListener('click', () => {
        document.body.removeChild(modal);
      });
    });
    
    // Close on outside click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
    });
  }
  
  deleteActivity(activityId) {
    if (confirm('Are you sure you want to delete this activity?')) {
      // Filter out the activity
      this.activities = this.activities.filter(activity => activity.id !== activityId);
      
      // Save to storage
      localStorage.setItem('activities', JSON.stringify(this.activities));
      
      // Recalculate spiritual fitness
      this.calculateSpiritualFitness();
      
      // Refresh current screen
      this.renderActivities();
    }
  }
  
  deleteMeeting(meetingId) {
    if (confirm('Are you sure you want to delete this meeting?')) {
      // Filter out the meeting
      this.meetings = this.meetings.filter(meeting => meeting.id !== meetingId);
      
      // Save to storage
      localStorage.setItem('meetings', JSON.stringify(this.meetings));
      
      // Refresh current screen
      this.renderMeetings();
    }
  }
  
  attachNavListeners() {
    // Add navigation menu listeners
    const dashboardLink = document.getElementById('nav-dashboard');
    const activitiesLink = document.getElementById('nav-activities');
    const meetingsLink = document.getElementById('nav-meetings');
    const nearbyLink = document.getElementById('nav-nearby');
    const profileLink = document.getElementById('nav-profile');
    
    if (dashboardLink) dashboardLink.addEventListener('click', () => this.navigateTo('dashboard'));
    if (activitiesLink) activitiesLink.addEventListener('click', () => this.navigateTo('activities'));
    if (meetingsLink) meetingsLink.addEventListener('click', () => this.navigateTo('meetings'));
    if (nearbyLink) nearbyLink.addEventListener('click', () => this.navigateTo('nearby'));
    if (profileLink) profileLink.addEventListener('click', () => this.navigateTo('profile'));
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
  
  // Utility methods
  capitalizeFirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
  
  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }
  
  getActivityIcon(type) {
    switch (type.toLowerCase()) {
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

// Initialize the app when the document is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Load FontAwesome (since we're using it in the app)
  if (!document.getElementById('fontawesome-css')) {
    const link = document.createElement('link');
    link.id = 'fontawesome-css';
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css';
    document.head.appendChild(link);
  }
  
  // Add app navigation to the body
  const navHTML = `
    <nav class="app-nav">
      <a id="nav-dashboard" class="nav-item ${window.location.hash === '' || window.location.hash === '#dashboard' ? 'active' : ''}">
        <i class="fas fa-home"></i>
        <span>Home</span>
      </a>
      <a id="nav-activities" class="nav-item ${window.location.hash === '#activities' ? 'active' : ''}">
        <i class="fas fa-clipboard-list"></i>
        <span>Activities</span>
      </a>
      <a id="nav-meetings" class="nav-item ${window.location.hash === '#meetings' ? 'active' : ''}">
        <i class="fas fa-users"></i>
        <span>Meetings</span>
      </a>
      <a id="nav-nearby" class="nav-item ${window.location.hash === '#nearby' ? 'active' : ''}">
        <i class="fas fa-map-marker-alt"></i>
        <span>Nearby</span>
      </a>
      <a id="nav-profile" class="nav-item ${window.location.hash === '#profile' ? 'active' : ''}">
        <i class="fas fa-user"></i>
        <span>Profile</span>
      </a>
    </nav>
  `;
  
  // Get the root element
  const rootEl = document.getElementById('root');
  
  // Add the navigation after the root element
  const navEl = document.createElement('div');
  navEl.innerHTML = navHTML;
  rootEl.parentNode.insertBefore(navEl.firstElementChild, rootEl.nextSibling);
  
  // Initialize the app
  const app = new App(rootEl);
  
  // Listen for hash changes and navigate accordingly
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.slice(1) || 'dashboard';
    app.navigateTo(hash);
  });
  
  // Set initial hash if not present
  if (!window.location.hash) {
    window.location.hash = '#dashboard';
  }
});

// Export the App class
window.SpiritualConditionTracker = App;