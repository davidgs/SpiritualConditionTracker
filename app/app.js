// Spiritual Condition Tracker - Main Application
document.addEventListener('DOMContentLoaded', function() {
  console.log('Spiritual Condition Tracker App loaded');
  
  // App state
  const state = {
    // User state
    user: {
      sobrietyDate: new Date('2022-11-01'), // Example date: Nov 1, 2022
      name: 'Example User',
      spiritualFitness: 85 // 0-100 score
    },
    
    // Activities log
    activities: [
      { id: 1, type: 'meeting', name: 'Big Book Study', date: '2025-05-13', notes: 'Group discussion on Step 4' },
      { id: 2, type: 'prayer', duration: 20, date: '2025-05-13', notes: 'Morning meditation' },
      { id: 3, type: 'reading', duration: 30, date: '2025-05-12', book: 'Big Book', notes: 'Chapter 5' },
      { id: 4, type: 'meeting', name: 'Home Group', date: '2025-05-11', notes: 'Discussed service work' },
      { id: 5, type: 'sponsor', duration: 45, date: '2025-05-10', notes: 'Weekly check-in' }
    ],
    
    // Meetings list
    meetings: [
      { id: 1, name: 'Big Book Study', day: 'Monday', time: '19:00', location: 'Community Center' },
      { id: 2, name: 'Home Group', day: 'Wednesday', time: '18:30', location: 'Church on Main St' },
      { id: 3, name: 'Step Study', day: 'Friday', time: '20:00', location: 'Recovery Center' }
    ],
    
    // Nearby members (within proximity settings)
    nearbyMembers: [],
    
    // Current view state
    currentView: 'dashboard'
  };
  
  // Calculate sobriety time in years (XX.yy format)
  function calculateSobrietyYears(sobrietyDate) {
    const today = new Date();
    const diffTime = Math.abs(today - sobrietyDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return (diffDays / 365.25).toFixed(2);
  }
  
  // Calculate sobriety time in days
  function calculateSobrietyDays(sobrietyDate) {
    const today = new Date();
    const diffTime = Math.abs(today - sobrietyDate);
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }
  
  // Format date for display
  function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }
  
  // Save data to localStorage
  function saveToLocalStorage() {
    localStorage.setItem('spiritualTrackerData', JSON.stringify({
      user: state.user,
      activities: state.activities,
      meetings: state.meetings
    }));
  }
  
  // Load data from localStorage
  function loadFromLocalStorage() {
    const savedData = localStorage.getItem('spiritualTrackerData');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      if (parsedData.user) state.user = parsedData.user;
      if (parsedData.activities) state.activities = parsedData.activities;
      if (parsedData.meetings) state.meetings = parsedData.meetings;
      
      // Convert sobriety date string back to Date object
      if (state.user.sobrietyDate) {
        state.user.sobrietyDate = new Date(state.user.sobrietyDate);
      }
    }
  }
  
  // Attempt to load saved data
  loadFromLocalStorage();
  
  // Render the application UI
  function renderApp() {
    const root = document.getElementById('root');
    
    // Calculate current sobriety values
    const sobrietyYears = calculateSobrietyYears(state.user.sobrietyDate);
    const sobrietyDays = calculateSobrietyDays(state.user.sobrietyDate);
    
    // Get current date for display
    const today = new Date();
    const dateStr = today.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    // Compose the HTML for the app
    root.innerHTML = `
      <header>
        <div class="header-content">
          <div>
            <h1>Spiritual Condition Tracker</h1>
            <p class="subtitle">Your AA Recovery Dashboard</p>
            <p class="date-display">${dateStr}</p>
          </div>
        </div>
      </header>
      
      <nav>
        <div class="nav-container">
          <a href="#dashboard" class="nav-item ${state.currentView === 'dashboard' ? 'active' : ''}" 
            data-view="dashboard">Dashboard</a>
          <a href="#activities" class="nav-item ${state.currentView === 'activities' ? 'active' : ''}" 
            data-view="activities">Activities</a>
          <a href="#meetings" class="nav-item ${state.currentView === 'meetings' ? 'active' : ''}" 
            data-view="meetings">Meetings</a>
          <a href="#nearby" class="nav-item ${state.currentView === 'nearby' ? 'active' : ''}" 
            data-view="nearby">Nearby</a>
          <a href="#profile" class="nav-item ${state.currentView === 'profile' ? 'active' : ''}" 
            data-view="profile">Profile</a>
        </div>
      </nav>
      
      <main>
        ${renderCurrentView(state.currentView)}
      </main>
      
      <footer>
        <div class="footer-content">
          <p>Spiritual Condition Tracker - AA Recovery App</p>
        </div>
      </footer>
    `;
    
    // Add event listeners after DOM is updated
    attachEventListeners();
  }
  
  // Render the current selected view
  function renderCurrentView(viewName) {
    switch(viewName) {
      case 'dashboard':
        return renderDashboard();
      case 'activities':
        return renderActivities();
      case 'meetings':
        return renderMeetings();
      case 'nearby':
        return renderNearby();
      case 'profile':
        return renderProfile();
      default:
        return renderDashboard();
    }
  }
  
  // Render the dashboard view
  function renderDashboard() {
    const sobrietyYears = calculateSobrietyYears(state.user.sobrietyDate);
    const sobrietyDays = calculateSobrietyDays(state.user.sobrietyDate);
    const recentActivities = state.activities.slice(0, 3); // Get 3 most recent activities
    
    return `
      <h2>Welcome, ${state.user.name}</h2>
      
      <div class="sober-time">${sobrietyYears} Years</div>
      <div class="sober-time-label">${sobrietyDays} Days of Sobriety</div>
      
      <div class="dashboard">
        <div class="card">
          <h2>Spiritual Fitness</h2>
          <div class="progress-container">
            <div class="progress-bar" style="width: ${state.user.spiritualFitness}%"></div>
          </div>
          <p style="text-align: center; margin-top: 10px;">${state.user.spiritualFitness}%</p>
          <div class="button-group">
            <button class="button" id="prayer-btn">Log Prayer</button>
            <button class="button" id="meeting-btn">Log Meeting</button>
            <button class="button" id="reading-btn">Log Reading</button>
          </div>
        </div>
        
        <div class="card">
          <h2>Recent Activities</h2>
          <ul class="activity-list">
            ${recentActivities.map(activity => `
              <li class="activity-item">
                <span class="activity-type">${capitalizeFirstLetter(activity.type)}</span>
                <span class="activity-date">${formatDate(activity.date)}</span>
              </li>
            `).join('')}
          </ul>
          <div class="button-group">
            <button class="button" id="view-all-activities">View All</button>
          </div>
        </div>
        
        <div class="card">
          <h2>Statistics</h2>
          <div class="stats-grid">
            <div class="stat">
              <div class="stat-value">${state.activities.filter(a => a.type === 'meeting').length}</div>
              <div class="stat-label">Meetings</div>
            </div>
            <div class="stat">
              <div class="stat-value">${state.activities.filter(a => a.type === 'prayer').length}</div>
              <div class="stat-label">Prayers</div>
            </div>
            <div class="stat">
              <div class="stat-value">${state.activities.filter(a => a.type === 'reading').length}</div>
              <div class="stat-label">Readings</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
  
  // Render the activities view
  function renderActivities() {
    return `
      <h2>Activity Log</h2>
      
      <div class="card">
        <h2>Log New Activity</h2>
        <form id="activity-form">
          <div class="form-group">
            <label for="activity-type">Activity Type</label>
            <select id="activity-type" name="activity-type">
              <option value="meeting">Meeting</option>
              <option value="prayer">Prayer/Meditation</option>
              <option value="reading">Reading</option>
              <option value="sponsor">Sponsor Contact</option>
              <option value="service">Service Work</option>
            </select>
          </div>
          
          <div class="form-group" id="meeting-name-group" style="display: none;">
            <label for="meeting-name">Meeting Name</label>
            <input type="text" id="meeting-name" name="meeting-name">
          </div>
          
          <div class="form-group" id="duration-group" style="display: none;">
            <label for="duration">Duration (minutes)</label>
            <input type="number" id="duration" name="duration" min="1">
          </div>
          
          <div class="form-group">
            <label for="activity-date">Date</label>
            <input type="date" id="activity-date" name="activity-date" value="${new Date().toISOString().slice(0, 10)}">
          </div>
          
          <div class="form-group">
            <label for="activity-notes">Notes</label>
            <textarea id="activity-notes" name="activity-notes" rows="3"></textarea>
          </div>
          
          <div class="button-group">
            <button type="submit" class="button" id="save-activity">Save Activity</button>
          </div>
        </form>
      </div>
      
      <div class="card">
        <h2>Activity History</h2>
        <ul class="activity-list">
          ${state.activities.map(activity => `
            <li class="activity-item">
              <span class="activity-type">${capitalizeFirstLetter(activity.type)}${activity.name ? ': ' + activity.name : ''}${activity.duration ? ' (' + activity.duration + ' min)' : ''}</span>
              <span class="activity-date">${formatDate(activity.date)}</span>
            </li>
          `).join('')}
        </ul>
      </div>
    `;
  }
  
  // Render the meetings view
  function renderMeetings() {
    return `
      <h2>Meetings</h2>
      
      <div class="card">
        <h2>Your Meeting List</h2>
        <ul class="activity-list">
          ${state.meetings.map(meeting => `
            <li class="activity-item">
              <span class="activity-type">${meeting.name}</span>
              <span class="activity-date">${meeting.day} at ${meeting.time} - ${meeting.location}</span>
            </li>
          `).join('')}
        </ul>
        <div class="button-group">
          <button class="button" id="add-meeting-btn">Add Meeting</button>
        </div>
      </div>
      
      <div id="add-meeting-form" class="card" style="display: none;">
        <h2>Add New Meeting</h2>
        <form id="meeting-form">
          <div class="form-group">
            <label for="meeting-name-input">Meeting Name</label>
            <input type="text" id="meeting-name-input" name="meeting-name-input">
          </div>
          
          <div class="form-group">
            <label for="meeting-day">Day of Week</label>
            <select id="meeting-day" name="meeting-day">
              <option value="Monday">Monday</option>
              <option value="Tuesday">Tuesday</option>
              <option value="Wednesday">Wednesday</option>
              <option value="Thursday">Thursday</option>
              <option value="Friday">Friday</option>
              <option value="Saturday">Saturday</option>
              <option value="Sunday">Sunday</option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="meeting-time">Time</label>
            <input type="time" id="meeting-time" name="meeting-time">
          </div>
          
          <div class="form-group">
            <label for="meeting-location">Location</label>
            <input type="text" id="meeting-location" name="meeting-location">
          </div>
          
          <div class="button-group">
            <button type="submit" class="button" id="save-meeting">Save Meeting</button>
            <button type="button" class="button" id="cancel-meeting">Cancel</button>
          </div>
        </form>
      </div>
    `;
  }
  
  // Render the nearby view
  function renderNearby() {
    return `
      <h2>Nearby Members</h2>
      
      <div class="card">
        <h2>Proximity Wizard</h2>
        <p>Find other members in recovery near you. This feature helps you connect with people on the same journey.</p>
        <div class="button-group">
          <button class="button" id="start-proximity">Start Proximity Wizard</button>
        </div>
      </div>
      
      <div class="card">
        <h2>Nearby Members</h2>
        ${state.nearbyMembers.length > 0 ? `
          <ul class="activity-list">
            ${state.nearbyMembers.map(member => `
              <li class="activity-item">
                <span class="activity-type">${member.name}</span>
                <span class="activity-date">${member.distance} away</span>
              </li>
            `).join('')}
          </ul>
        ` : `
          <p>No nearby members found. Use the Proximity Wizard to discover others in recovery near you.</p>
        `}
      </div>
    `;
  }
  
  // Render the profile view
  function renderProfile() {
    return `
      <h2>Your Profile</h2>
      
      <div class="card">
        <h2>Personal Information</h2>
        <form id="profile-form">
          <div class="form-group">
            <label for="profile-name">Your Name</label>
            <input type="text" id="profile-name" name="profile-name" value="${state.user.name}">
          </div>
          
          <div class="form-group">
            <label for="sobriety-date">Sobriety Date</label>
            <input type="date" id="sobriety-date" name="sobriety-date" 
              value="${state.user.sobrietyDate.toISOString().slice(0, 10)}">
          </div>
          
          <div class="button-group">
            <button type="submit" class="button" id="save-profile">Save Profile</button>
          </div>
        </form>
      </div>
      
      <div class="card">
        <h2>Spiritual Fitness</h2>
        <p>Your spiritual fitness score is calculated based on your logged activities.</p>
        <div class="progress-container">
          <div class="progress-bar" style="width: ${state.user.spiritualFitness}%"></div>
        </div>
        <p style="text-align: center; margin-top: 10px;">${state.user.spiritualFitness}%</p>
      </div>
    `;
  }
  
  // Attach event listeners to interactive elements
  function attachEventListeners() {
    // Navigation links
    document.querySelectorAll('.nav-item').forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        const view = this.getAttribute('data-view');
        state.currentView = view;
        renderApp();
      });
    });
    
    // Dashboard quick links
    const prayerBtn = document.getElementById('prayer-btn');
    if (prayerBtn) {
      prayerBtn.addEventListener('click', function() {
        state.currentView = 'activities';
        renderApp();
        
        // Pre-select prayer type
        const activityTypeSelect = document.getElementById('activity-type');
        if (activityTypeSelect) {
          activityTypeSelect.value = 'prayer';
          activityTypeSelect.dispatchEvent(new Event('change'));
        }
      });
    }
    
    const meetingBtn = document.getElementById('meeting-btn');
    if (meetingBtn) {
      meetingBtn.addEventListener('click', function() {
        state.currentView = 'activities';
        renderApp();
        
        // Pre-select meeting type
        const activityTypeSelect = document.getElementById('activity-type');
        if (activityTypeSelect) {
          activityTypeSelect.value = 'meeting';
          activityTypeSelect.dispatchEvent(new Event('change'));
        }
      });
    }
    
    const readingBtn = document.getElementById('reading-btn');
    if (readingBtn) {
      readingBtn.addEventListener('click', function() {
        state.currentView = 'activities';
        renderApp();
        
        // Pre-select reading type
        const activityTypeSelect = document.getElementById('activity-type');
        if (activityTypeSelect) {
          activityTypeSelect.value = 'reading';
          activityTypeSelect.dispatchEvent(new Event('change'));
        }
      });
    }
    
    // View all activities button
    const viewAllActivitiesBtn = document.getElementById('view-all-activities');
    if (viewAllActivitiesBtn) {
      viewAllActivitiesBtn.addEventListener('click', function() {
        state.currentView = 'activities';
        renderApp();
      });
    }
    
    // Add meeting button
    const addMeetingBtn = document.getElementById('add-meeting-btn');
    if (addMeetingBtn) {
      addMeetingBtn.addEventListener('click', function() {
        const addMeetingForm = document.getElementById('add-meeting-form');
        if (addMeetingForm) {
          addMeetingForm.style.display = 'block';
        }
      });
    }
    
    // Cancel meeting button
    const cancelMeetingBtn = document.getElementById('cancel-meeting');
    if (cancelMeetingBtn) {
      cancelMeetingBtn.addEventListener('click', function() {
        const addMeetingForm = document.getElementById('add-meeting-form');
        if (addMeetingForm) {
          addMeetingForm.style.display = 'none';
        }
      });
    }
    
    // Start proximity wizard
    const startProximityBtn = document.getElementById('start-proximity');
    if (startProximityBtn) {
      startProximityBtn.addEventListener('click', function() {
        alert('Proximity Wizard functionality would connect to nearby devices to find other users. This is a sample UI only.');
        
        // Simulate finding nearby members
        state.nearbyMembers = [
          { id: 1, name: 'John D.', distance: '0.5 miles' },
          { id: 2, name: 'Sarah M.', distance: '0.8 miles' },
          { id: 3, name: 'Robert H.', distance: '1.2 miles' }
        ];
        
        renderApp();
      });
    }
    
    // Activity type change
    const activityType = document.getElementById('activity-type');
    if (activityType) {
      activityType.addEventListener('change', function() {
        const meetingNameGroup = document.getElementById('meeting-name-group');
        const durationGroup = document.getElementById('duration-group');
        
        // Reset displays
        if (meetingNameGroup) meetingNameGroup.style.display = 'none';
        if (durationGroup) durationGroup.style.display = 'none';
        
        // Show relevant fields based on activity type
        switch(this.value) {
          case 'meeting':
            if (meetingNameGroup) meetingNameGroup.style.display = 'block';
            break;
          case 'prayer':
          case 'reading':
          case 'sponsor':
          case 'service':
            if (durationGroup) durationGroup.style.display = 'block';
            break;
        }
      });
    }
    
    // Activity form submit
    const activityForm = document.getElementById('activity-form');
    if (activityForm) {
      activityForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const activityType = document.getElementById('activity-type').value;
        const activityDate = document.getElementById('activity-date').value;
        const activityNotes = document.getElementById('activity-notes').value;
        
        // Create new activity object
        const newActivity = {
          id: Date.now(), // Use timestamp as ID
          type: activityType,
          date: activityDate,
          notes: activityNotes
        };
        
        // Add type-specific properties
        if (activityType === 'meeting') {
          newActivity.name = document.getElementById('meeting-name').value;
        } else {
          newActivity.duration = parseInt(document.getElementById('duration').value, 10);
        }
        
        // Add to activities array
        state.activities.unshift(newActivity);
        
        // Save to localStorage
        saveToLocalStorage();
        
        // Update spiritual fitness score (simplified calculation)
        updateSpiritualFitness();
        
        // Reset form
        activityForm.reset();
        
        // Show confirmation message
        alert('Activity logged successfully!');
        
        // Re-render app
        renderApp();
      });
    }
    
    // Meeting form submit
    const meetingForm = document.getElementById('meeting-form');
    if (meetingForm) {
      meetingForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Create new meeting object
        const newMeeting = {
          id: Date.now(), // Use timestamp as ID
          name: document.getElementById('meeting-name-input').value,
          day: document.getElementById('meeting-day').value,
          time: document.getElementById('meeting-time').value,
          location: document.getElementById('meeting-location').value
        };
        
        // Add to meetings array
        state.meetings.push(newMeeting);
        
        // Save to localStorage
        saveToLocalStorage();
        
        // Reset form and hide it
        meetingForm.reset();
        document.getElementById('add-meeting-form').style.display = 'none';
        
        // Show confirmation message
        alert('Meeting added successfully!');
        
        // Re-render app
        renderApp();
      });
    }
    
    // Profile form submit
    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
      profileForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Update user state
        state.user.name = document.getElementById('profile-name').value;
        state.user.sobrietyDate = new Date(document.getElementById('sobriety-date').value);
        
        // Save to localStorage
        saveToLocalStorage();
        
        // Show confirmation message
        alert('Profile updated successfully!');
        
        // Re-render app
        renderApp();
      });
    }
  }
  
  // Update spiritual fitness score based on recent activities
  function updateSpiritualFitness() {
    // Simple algorithm: more recent activities = higher score
    // Real implementation would be more sophisticated
    
    // Get activities from last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentActivities = state.activities.filter(activity => {
      const activityDate = new Date(activity.date);
      return activityDate >= thirtyDaysAgo;
    });
    
    // Calculate score based on activity count (simplified)
    let score = Math.min(85, recentActivities.length * 5);
    
    // Update user's spiritual fitness score
    state.user.spiritualFitness = score;
    
    // Save to localStorage
    saveToLocalStorage();
  }
  
  // Helper function: Capitalize first letter of string
  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
  
  // Initial render
  renderApp();
});