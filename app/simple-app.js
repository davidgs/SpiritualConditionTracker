// Spiritual Condition Tracker App
document.addEventListener('DOMContentLoaded', function() {
  console.log('Spiritual Condition Tracker initialized');
  
  // Get the root element
  const root = document.getElementById('root');
  
  // Sample activity data
  const sampleActivities = [
    {
      id: 'act1',
      type: 'meeting',
      name: 'Home Group Meeting',
      date: '2025-05-14',
      duration: 60,
      notes: 'Shared about gratitude'
    },
    {
      id: 'act2',
      type: 'prayer',
      name: 'Morning Meditation',
      date: '2025-05-14',
      duration: 15,
      notes: 'Focused on serenity'
    },
    {
      id: 'act3',
      type: 'reading',
      name: 'Big Book Study',
      date: '2025-05-13',
      duration: 30,
      notes: 'Chapter 5'
    },
    {
      id: 'act4',
      type: 'service',
      name: 'Coffee Setup',
      date: '2025-05-12',
      duration: 45,
      notes: 'Before evening meeting'
    },
    {
      id: 'act5',
      type: 'stepwork',
      name: 'Step 4 Inventory',
      date: '2025-05-11',
      duration: 60,
      notes: 'Working with sponsor'
    }
  ];
  
  // Sample meetings data
  const sampleMeetings = [
    {
      id: 'meet1',
      name: 'Downtown Group',
      type: 'Discussion',
      day: 'Monday',
      time: '19:00',
      location: '123 Main St',
      notes: 'Beginner-friendly'
    },
    {
      id: 'meet2',
      name: 'Serenity Group',
      type: 'Big Book Study',
      day: 'Wednesday',
      time: '18:30',
      location: '456 Oak Ave',
      notes: 'Wheelchair accessible'
    },
    {
      id: 'meet3',
      name: 'Morning Meditation',
      type: 'Meditation',
      day: 'Daily',
      time: '07:00',
      location: '789 Pine Blvd',
      notes: 'Hybrid zoom option'
    }
  ];
  
  // Default user object
  let user = {
    id: 'user_' + Date.now(),
    name: 'John D.',
    sobrietyDate: '2020-01-01',
    homeGroup: 'Downtown Group',
    phone: '',
    email: '',
    privacySettings: {
      shareLocation: false,
      shareActivities: false
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  // App state
  let currentScreen = 'dashboard';
  let activities = [...sampleActivities];
  let meetings = [...sampleMeetings];
  let spiritualFitness = { score: 7.5 };
  
  // Try to load user data from localStorage
  try {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      user = JSON.parse(storedUser);
      console.log('User data loaded:', user);
    }
    
    const storedActivities = localStorage.getItem('activities');
    if (storedActivities) {
      activities = JSON.parse(storedActivities);
    }
    
    const storedMeetings = localStorage.getItem('meetings');
    if (storedMeetings) {
      meetings = JSON.parse(storedMeetings);
    }
    
    calculateSpiritualFitness();
  } catch (error) {
    console.error('Error loading data from localStorage:', error);
  }
  
  // Save data to localStorage
  function saveData() {
    try {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('activities', JSON.stringify(activities));
      localStorage.setItem('meetings', JSON.stringify(meetings));
      localStorage.setItem('spiritualFitness', JSON.stringify(spiritualFitness));
    } catch (error) {
      console.error('Error saving data to localStorage:', error);
    }
  }
  
  // Calculate spiritual fitness score
  function calculateSpiritualFitness() {
    // Get all activities in the last 30 days
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);
    
    const recentActivities = activities.filter(a => {
      const activityDate = new Date(a.date);
      return activityDate >= thirtyDaysAgo;
    });
    
    // Count activities by type
    const activityCounts = {
      meeting: 0,
      prayer: 0,
      meditation: 0,
      reading: 0,
      service: 0,
      stepwork: 0,
      sponsorship: 0
    };
    
    recentActivities.forEach(activity => {
      if (activityCounts[activity.type] !== undefined) {
        activityCounts[activity.type]++;
      }
    });
    
    // Calculate score components (max 10 points)
    const scoreComponents = {
      meetings: Math.min(activityCounts.meeting / 10, 1) * 3,
      prayer: Math.min((activityCounts.prayer + activityCounts.meditation) / 20, 1) * 2,
      reading: Math.min(activityCounts.reading / 15, 1) * 1.5,
      service: Math.min(activityCounts.service / 5, 1) * 1.5,
      stepwork: Math.min(activityCounts.stepwork / 5, 1) * 1,
      sponsorship: Math.min(activityCounts.sponsorship / 5, 1) * 1
    };
    
    // Sum up for total score
    const totalScore = Object.values(scoreComponents).reduce((sum, score) => sum + score, 0);
    
    // Store the fitness data
    spiritualFitness = {
      score: parseFloat(totalScore.toFixed(2)),
      components: scoreComponents,
      activityCounts: activityCounts,
      calculatedAt: new Date().toISOString()
    };
    
    console.log('Spiritual fitness calculated:', spiritualFitness.score);
    
    return spiritualFitness;
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
  
  // Calculate sobriety years with decimal precision
  function calculateSobrietyYears(decimalPlaces = 2) {
    const days = calculateSobrietyDays();
    const years = days / 365.25; // Account for leap years
    
    return parseFloat(years.toFixed(decimalPlaces));
  }
  
  // Format date for display
  function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }
  
  // Get icon class for activity type
  function getActivityIcon(type) {
    const icons = {
      meeting: 'fas fa-users',
      prayer: 'fas fa-pray',
      meditation: 'fas fa-Om',
      reading: 'fas fa-book',
      service: 'fas fa-hands-helping',
      stepwork: 'fas fa-tasks',
      sponsorship: 'fas fa-user-friends'
    };
    
    return icons[type] || 'fas fa-star';
  }
  
  // Capitalize first letter of a string
  function capitalizeFirst(string) {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
  
  // Save a new activity
  function saveActivity(activity) {
    if (!activity.id) {
      activity.id = 'act_' + Date.now();
    }
    
    const existingIndex = activities.findIndex(a => a.id === activity.id);
    
    if (existingIndex >= 0) {
      // Update existing
      activities[existingIndex] = activity;
    } else {
      // Add new
      activities.push(activity);
    }
    
    // Recalculate spiritual fitness
    calculateSpiritualFitness();
    
    // Save to localStorage
    saveData();
    
    return activity;
  }
  
  // Delete an activity
  function deleteActivity(activityId) {
    const index = activities.findIndex(a => a.id === activityId);
    
    if (index >= 0) {
      activities.splice(index, 1);
      
      // Recalculate spiritual fitness
      calculateSpiritualFitness();
      
      // Save to localStorage
      saveData();
      
      return true;
    }
    
    return false;
  }
  
  // Save a meeting
  function saveMeeting(meeting) {
    if (!meeting.id) {
      meeting.id = 'meet_' + Date.now();
    }
    
    const existingIndex = meetings.findIndex(m => m.id === meeting.id);
    
    if (existingIndex >= 0) {
      // Update existing
      meetings[existingIndex] = meeting;
    } else {
      // Add new
      meetings.push(meeting);
    }
    
    // Save to localStorage
    saveData();
    
    return meeting;
  }
  
  // Delete a meeting
  function deleteMeeting(meetingId) {
    const index = meetings.findIndex(m => m.id === meetingId);
    
    if (index >= 0) {
      meetings.splice(index, 1);
      
      // Save to localStorage
      saveData();
      
      return true;
    }
    
    return false;
  }
  
  // Update user profile
  function updateUser(userData) {
    user = { ...user, ...userData, updatedAt: new Date().toISOString() };
    
    // Save to localStorage
    saveData();
    
    return user;
  }
  
  // Navigation
  function navigateTo(screen) {
    // Clear any previous navigation
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => item.classList.remove('active'));
    
    // Set the active nav item
    const activeNav = document.getElementById(`nav-${screen}`);
    if (activeNav) {
      activeNav.classList.add('active');
    }
    
    // Update current screen
    currentScreen = screen;
    
    // Render the appropriate screen
    switch (screen) {
      case 'dashboard':
        renderDashboard();
        break;
      case 'activities':
        renderActivities();
        break;
      case 'meetings':
        renderMeetings();
        break;
      case 'nearby':
        renderNearby();
        break;
      case 'profile':
        renderProfile();
        break;
      default:
        renderDashboard();
    }
  }
  
  // Render dashboard screen
  function renderDashboard() {
    const sobrietyDays = calculateSobrietyDays();
    const sobrietyYears = calculateSobrietyYears();
    
    // Get recent activities (up to 5)
    const recentActivities = [...activities]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
    
    // Create activity items HTML
    let activitiesHTML = '';
    
    if (recentActivities.length > 0) {
      recentActivities.forEach(activity => {
        activitiesHTML += `
          <div class="activity-item">
            <div class="activity-icon ${activity.type}-icon">
              <i class="${getActivityIcon(activity.type)}"></i>
            </div>
            <div class="activity-details">
              <div class="activity-title">${activity.name}</div>
              <div class="activity-meta">${formatDate(activity.date)} · ${activity.duration} mins</div>
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
              <span class="score-value">${spiritualFitness.score.toFixed(2)}</span>
              <span class="score-max">/10</span>
            </div>
          </div>
          
          <button class="card-button" id="view-fitness-btn">View Details</button>
        </div>
        
        <!-- Recovery Activities Card -->
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
    
    // Set up event listeners
    document.getElementById('update-sobriety-btn').addEventListener('click', function() {
      navigateTo('profile');
    });
    
    document.getElementById('view-fitness-btn').addEventListener('click', function() {
      showSpiritualFitnessDetails();
    });
    
    document.getElementById('log-activity-btn').addEventListener('click', function() {
      navigateTo('activities');
    });
    
    document.getElementById('find-meetings-btn').addEventListener('click', function() {
      navigateTo('meetings');
    });
    
    document.getElementById('nearby-members-btn').addEventListener('click', function() {
      navigateTo('nearby');
    });
    
    document.getElementById('track-progress-btn').addEventListener('click', function() {
      showSpiritualFitnessDetails();
    });
  }
  
  // Render activities screen
  function renderActivities() {
    // Sort activities by date (newest first)
    const sortedActivities = [...activities].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Create activity items HTML
    let activitiesHTML = '';
    
    if (sortedActivities.length > 0) {
      sortedActivities.forEach(activity => {
        activitiesHTML += `
          <div class="activity-item" data-id="${activity.id}">
            <div class="activity-icon ${activity.type}-icon">
              <i class="${getActivityIcon(activity.type)}"></i>
            </div>
            <div class="activity-details">
              <div class="activity-title">${activity.name}</div>
              <div class="activity-meta">${formatDate(activity.date)} · ${activity.duration} mins</div>
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
    
    root.innerHTML = `
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
                <input type="date" id="activity-date" required>
              </div>
              
              <div class="form-group">
                <label for="activity-duration">Duration (mins)</label>
                <input type="number" id="activity-duration" min="1" required>
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
    
    // Set current date in the date field
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('activity-date').value = today;
    
    // Set up form submission
    document.getElementById('activity-form').addEventListener('submit', function(e) {
      e.preventDefault();
      
      const activityType = document.getElementById('activity-type').value;
      const activityName = document.getElementById('activity-name').value;
      const activityDate = document.getElementById('activity-date').value;
      const activityDuration = parseInt(document.getElementById('activity-duration').value);
      const activityNotes = document.getElementById('activity-notes').value;
      
      const newActivity = {
        id: 'act_' + Date.now(),
        type: activityType,
        name: activityName,
        date: activityDate,
        duration: activityDuration,
        notes: activityNotes
      };
      
      saveActivity(newActivity);
      
      // Reset form and re-render
      document.getElementById('activity-form').reset();
      document.getElementById('activity-date').value = today;
      
      // Re-render the activities list
      renderActivities();
    });
    
    // Set up delete buttons
    document.querySelectorAll('.delete-btn').forEach(button => {
      button.addEventListener('click', function() {
        const activityId = this.getAttribute('data-id');
        
        if (confirm('Are you sure you want to delete this activity?')) {
          deleteActivity(activityId);
          renderActivities();
        }
      });
    });
  }
  
  // Render meetings screen
  function renderMeetings() {
    // Sort meetings by day of week
    const daysOrder = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Daily'];
    const sortedMeetings = [...meetings].sort((a, b) => {
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
    
    root.innerHTML = `
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
    document.getElementById('meeting-form').addEventListener('submit', function(e) {
      e.preventDefault();
      
      const meetingName = document.getElementById('meeting-name').value;
      const meetingType = document.getElementById('meeting-type').value;
      const meetingDay = document.getElementById('meeting-day').value;
      const meetingTime = document.getElementById('meeting-time').value;
      const meetingLocation = document.getElementById('meeting-location').value;
      const meetingNotes = document.getElementById('meeting-notes').value;
      
      const newMeeting = {
        id: 'meet_' + Date.now(),
        name: meetingName,
        type: meetingType,
        day: meetingDay,
        time: meetingTime,
        location: meetingLocation,
        notes: meetingNotes
      };
      
      saveMeeting(newMeeting);
      
      // Reset form and re-render
      document.getElementById('meeting-form').reset();
      
      // Re-render the meetings list
      renderMeetings();
    });
    
    // Set up delete buttons
    document.querySelectorAll('.delete-btn').forEach(button => {
      button.addEventListener('click', function() {
        const meetingId = this.getAttribute('data-id');
        
        if (confirm('Are you sure you want to delete this meeting?')) {
          deleteMeeting(meetingId);
          renderMeetings();
        }
      });
    });
  }
  
  // Render nearby screen
  function renderNearby() {
    root.innerHTML = `
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
    
    // Set up discovery button
    document.getElementById('start-discovery-btn').addEventListener('click', function() {
      simulateProximityDiscovery();
    });
  }
  
  // Simulate proximity discovery
  function simulateProximityDiscovery() {
    // Check if location sharing is enabled
    if (!user.privacySettings.shareLocation) {
      alert('Please enable location sharing in your profile first.');
      navigateTo('profile');
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
    
    // Simulate loading delay
    setTimeout(() => {
      // Sample nearby members data
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
      
      // Display results
      discoverySection.innerHTML = `
        <div class="discovery-icon">
          <i class="fas fa-check-circle"></i>
        </div>
        <h2 class="discovery-title">Discovery Complete</h2>
        <p class="discovery-description">
          ${nearbyMembers.length} members found nearby
        </p>
        
        <div class="nearby-members-list">
          ${nearbyMembers.map(member => `
            <div class="nearby-member">
              <div class="member-avatar">
                <i class="fas fa-user"></i>
              </div>
              <div class="member-details">
                <div class="member-name">${member.name}</div>
                <div class="member-meta">
                  ${calculateMemberSobriety(member.sobrietyDate)} · ${member.homeGroup}
                </div>
              </div>
              <div class="member-distance">${member.distance} mi</div>
              <button class="connect-btn" data-id="${member.id}">
                <i class="fas fa-user-plus"></i>
              </button>
            </div>
          `).join('')}
        </div>
        
        <button class="discovery-button" id="restart-discovery-btn" style="margin-top: 20px">
          <i class="fas fa-redo"></i> Scan Again
        </button>
        
        <p class="discovery-note">
          Note: This is a simulated feature. In production, this would use Bluetooth
          or similar technology for proximity detection.
        </p>
      `;
      
      // Set up restart button
      document.getElementById('restart-discovery-btn').addEventListener('click', function() {
        simulateProximityDiscovery();
      });
      
      // Set up connect buttons
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
    }, 2000);
  }
  
  // Calculate member sobriety time for display
  function calculateMemberSobriety(sobrietyDate) {
    const start = new Date(sobrietyDate);
    const now = new Date();
    
    const diffTime = Math.abs(now - start);
    const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);
    
    if (diffYears < 1) {
      const diffMonths = Math.floor(diffYears * 12);
      return `${diffMonths} month${diffMonths !== 1 ? 's' : ''}`;
    } else {
      return `${Math.floor(diffYears)} year${Math.floor(diffYears) !== 1 ? 's' : ''}`;
    }
  }
  
  // Render profile screen
  function renderProfile() {
    root.innerHTML = `
      <div class="profile-container">
        <header>
          <h1>Your Profile</h1>
          <p class="subtitle">Manage your personal information</p>
        </header>
        
        <div class="profile-header">
          <div class="profile-avatar">
            <i class="fas fa-user"></i>
          </div>
          <h2 class="profile-name">${user.name}</h2>
          <p class="profile-group">${user.homeGroup || 'No home group set'}</p>
        </div>
        
        <div class="card">
          <h3>Personal Information</h3>
          <form id="profile-form" class="form">
            <div class="form-group">
              <label for="user-name">Name</label>
              <input type="text" id="user-name" value="${user.name}" required>
              <p class="input-note">First name and last initial (e.g., John D.)</p>
            </div>
            
            <div class="form-group">
              <label for="sobriety-date">Sobriety Date</label>
              <input type="date" id="sobriety-date" value="${user.sobrietyDate}" required>
            </div>
            
            <div class="form-group">
              <label for="home-group">Home Group</label>
              <input type="text" id="home-group" value="${user.homeGroup || ''}">
            </div>
            
            <div class="form-group">
              <label for="user-phone">Phone (optional)</label>
              <input type="tel" id="user-phone" value="${user.phone || ''}">
            </div>
            
            <div class="form-group">
              <label for="user-email">Email (optional)</label>
              <input type="email" id="user-email" value="${user.email || ''}">
            </div>
            
            <h3>Privacy Settings</h3>
            
            <div class="form-group checkbox-group">
              <input type="checkbox" id="share-location" ${user.privacySettings.shareLocation ? 'checked' : ''}>
              <label for="share-location">Share location for nearby member discovery</label>
            </div>
            
            <div class="form-group checkbox-group">
              <input type="checkbox" id="share-activities" ${user.privacySettings.shareActivities ? 'checked' : ''}>
              <label for="share-activities">Share activities with connected members</label>
            </div>
            
            <button type="submit" class="button-primary">Save Profile</button>
          </form>
        </div>
      </div>
    `;
    
    // Set up form submission
    document.getElementById('profile-form').addEventListener('submit', function(e) {
      e.preventDefault();
      
      const updatedUser = {
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
      
      updateUser(updatedUser);
      
      alert('Profile updated successfully!');
      
      // Return to dashboard
      navigateTo('dashboard');
    });
  }
  
  // Show spiritual fitness details in a modal
  function showSpiritualFitnessDetails() {
    // Create modal element
    const modal = document.createElement('div');
    modal.className = 'modal-backdrop';
    modal.id = 'fitness-modal';
    
    const components = spiritualFitness.components || {};
    const activityCounts = spiritualFitness.activityCounts || {};
    
    modal.innerHTML = `
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
    
    // Add modal to the DOM
    document.body.appendChild(modal);
    
    // Set up close buttons
    document.getElementById('close-modal').addEventListener('click', function() {
      document.body.removeChild(modal);
    });
    
    document.getElementById('close-fitness-btn').addEventListener('click', function() {
      document.body.removeChild(modal);
    });
    
    // Close on background click
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
    });
  }
  
  // Error handler
  function showError(message) {
    root.innerHTML = `
      <div class="error-container">
        <div class="error-icon">
          <i class="fas fa-exclamation-circle"></i>
        </div>
        <h2 class="error-title">Something went wrong</h2>
        <p class="error-message">${message}</p>
        <button class="error-button" id="error-reload-btn">Reload App</button>
      </div>
    `;
    
    document.getElementById('error-reload-btn').addEventListener('click', function() {
      window.location.reload();
    });
  }
  
  // Initialize the app
  function initApp() {
    try {
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
      
      // Add navigation to the body
      document.body.appendChild(nav);
      
      // Add event listeners to navigation items
      document.getElementById('nav-dashboard').addEventListener('click', () => navigateTo('dashboard'));
      document.getElementById('nav-activities').addEventListener('click', () => navigateTo('activities'));
      document.getElementById('nav-meetings').addEventListener('click', () => navigateTo('meetings'));
      document.getElementById('nav-nearby').addEventListener('click', () => navigateTo('nearby'));
      document.getElementById('nav-profile').addEventListener('click', () => navigateTo('profile'));
      
      // Render the initial screen (dashboard)
      navigateTo('dashboard');
      
      console.log('App initialized successfully');
      
    } catch (error) {
      console.error('Error initializing app:', error);
      showError('There was a problem loading the app. Please try again.');
    }
  }
  
  // Initialize the app
  initApp();
});