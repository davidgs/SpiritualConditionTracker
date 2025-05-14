// Spiritual Condition Tracker App

// Database implementation with localStorage
const db = (function() {
  // Storage keys for each "table"
  const STORAGE_KEYS = {
    users: 'aa_tracker_users',
    activities: 'aa_tracker_activities',
    spiritualFitness: 'aa_tracker_spiritual_fitness',
    meetings: 'aa_tracker_meetings',
    meetingReminders: 'aa_tracker_meeting_reminders',
    nearbyMembers: 'aa_tracker_nearby_members'
  };

  /**
   * Initialize all data stores
   */
  const initDatabase = async () => {
    console.log('Initializing web localStorage database...');
    try {
      // Initialize each "table" if it doesn't exist
      Object.values(STORAGE_KEYS).forEach(key => {
        if (!localStorage.getItem(key)) {
          localStorage.setItem(key, JSON.stringify([]));
        }
      });
      
      console.log('Web localStorage database initialized');
      return true;
    } catch (error) {
      console.error('Error initializing web database:', error);
      throw error;
    }
  };

  /**
   * Get all items from a collection
   */
  const getAll = (collection) => {
    const key = STORAGE_KEYS[collection];
    if (!key) {
      console.error(`Unknown collection: ${collection}`);
      return [];
    }
    
    try {
      return JSON.parse(localStorage.getItem(key)) || [];
    } catch (error) {
      console.error(`Error getting items from ${collection}:`, error);
      return [];
    }
  };

  /**
   * Get an item by ID from a collection
   */
  const getById = (collection, id) => {
    const items = getAll(collection);
    return items.find(item => item.id === id) || null;
  };

  /**
   * Add an item to a collection
   */
  const insert = (collection, item) => {
    const key = STORAGE_KEYS[collection];
    if (!key) {
      console.error(`Unknown collection: ${collection}`);
      return null;
    }
    
    try {
      const items = getAll(collection);
      items.push(item);
      localStorage.setItem(key, JSON.stringify(items));
      return item;
    } catch (error) {
      console.error(`Error adding item to ${collection}:`, error);
      return null;
    }
  };

  /**
   * Update an item in a collection
   */
  const update = (collection, id, updates) => {
    const key = STORAGE_KEYS[collection];
    if (!key) {
      console.error(`Unknown collection: ${collection}`);
      return null;
    }
    
    try {
      const items = getAll(collection);
      const index = items.findIndex(item => item.id === id);
      
      if (index === -1) {
        return null;
      }
      
      const updatedItem = { ...items[index], ...updates };
      items[index] = updatedItem;
      
      localStorage.setItem(key, JSON.stringify(items));
      return updatedItem;
    } catch (error) {
      console.error(`Error updating item in ${collection}:`, error);
      return null;
    }
  };

  /**
   * Remove an item from a collection
   */
  const deleteById = (collection, id) => {
    const key = STORAGE_KEYS[collection];
    if (!key) {
      console.error(`Unknown collection: ${collection}`);
      return false;
    }
    
    try {
      const items = getAll(collection);
      const filteredItems = items.filter(item => item.id !== id);
      
      if (filteredItems.length === items.length) {
        return false;
      }
      
      localStorage.setItem(key, JSON.stringify(filteredItems));
      return true;
    } catch (error) {
      console.error(`Error removing item from ${collection}:`, error);
      return false;
    }
  };

  /**
   * Query items in a collection
   */
  const query = (collection, predicate) => {
    const items = getAll(collection);
    return items.filter(predicate);
  };

  /**
   * Calculate sobriety days based on sobriety date
   */
  const calculateSobrietyDays = (sobrietyDate) => {
    if (!sobrietyDate) return 0;
    
    const start = new Date(sobrietyDate);
    const today = new Date();
    
    // Reset hours to compare dates only
    start.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    const diffTime = Math.abs(today - start);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  /**
   * Calculate sobriety years with decimal precision
   */
  const calculateSobrietyYears = (sobrietyDate, decimalPlaces = 2) => {
    const days = calculateSobrietyDays(sobrietyDate);
    const years = days / 365.25; // Account for leap years
    
    return parseFloat(years.toFixed(decimalPlaces));
  };

  // User operations
  const userOperations = {
    createUser: (userData) => {
      const now = new Date().toISOString();
      const userId = userData.id || `user_${Date.now()}`;
      
      const user = {
        id: userId,
        name: userData.name || '',
        sobrietyDate: userData.sobrietyDate || null,
        homeGroup: userData.homeGroup || '',
        phone: userData.phone || '',
        email: userData.email || '',
        sponsorId: userData.sponsorId || null,
        privacySettings: userData.privacySettings || {},
        createdAt: now,
        updatedAt: now
      };
      
      insert('users', user);
      return userId;
    },
    
    getUserById: (userId) => {
      return getById('users', userId);
    },
    
    updateUser: (userId, userData) => {
      const updates = {
        updatedAt: new Date().toISOString(),
        ...userData
      };
      
      return update('users', userId, updates);
    }
  };

  // Activity operations
  const activityOperations = {
    createActivity: (activityData) => {
      const now = new Date().toISOString();
      const activityId = activityData.id || `activity_${Date.now()}`;
      
      const activity = {
        id: activityId,
        userId: activityData.userId,
        type: activityData.type,
        date: activityData.date || now,
        duration: activityData.duration || 0,
        notes: activityData.notes || '',
        createdAt: now
      };
      
      insert('activities', activity);
      return activityId;
    },
    
    getUserActivities: (userId) => {
      return query('activities', activity => activity.userId === userId)
        .sort((a, b) => new Date(b.date) - new Date(a.date));
    },
    
    getRecentActivities: (userId, limit = 10) => {
      return query('activities', activity => activity.userId === userId)
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, limit);
    },
    
    deleteActivity: (activityId) => {
      return deleteById('activities', activityId);
    }
  };

  // Spiritual fitness operations
  const spiritualFitnessOperations = {
    calculateSpiritualFitness: (userId) => {
      // Get user activities for the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const activities = query('activities', 
        activity => activity.userId === userId && new Date(activity.date) >= thirtyDaysAgo
      );
      
      // Calculate scores based on activity frequency and duration
      const scores = {
        prayer: 0,
        meditation: 0,
        reading: 0,
        meeting: 0,
        service: 0
      };
      
      // Process each activity type
      activities.forEach(activity => {
        const type = activity.type.toLowerCase();
        const duration = activity.duration || 0;
        
        if (type.includes('prayer')) {
          scores.prayer += duration / 10; // 10 minutes per day is ideal
        } else if (type.includes('meditation')) {
          scores.meditation += duration / 15; // 15 minutes per day is ideal
        } else if (type.includes('reading')) {
          scores.reading += duration / 20; // 20 minutes per day is ideal
        } else if (type.includes('meeting')) {
          scores.meeting += 1; // Each meeting counts as 1 point
        } else if (type.includes('service')) {
          scores.service += duration / 30; // 30 minutes per week is ideal
        }
      });
      
      // Cap each score at 10
      Object.keys(scores).forEach(key => {
        scores[key] = Math.min(10, scores[key]);
      });
      
      // Calculate total score (max 50)
      const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
      
      // Convert to percentage (0-100) with 2 decimal precision
      const finalScore = parseFloat(((totalScore / 50) * 100).toFixed(2));
      
      // Save to database
      const now = new Date().toISOString();
      const fitnessId = `sf_${Date.now()}`;
      
      const fitnessRecord = {
        id: fitnessId,
        userId: userId,
        score: finalScore,
        prayerScore: scores.prayer,
        meditationScore: scores.meditation,
        readingScore: scores.reading,
        meetingScore: scores.meeting,
        serviceScore: scores.service,
        calculatedAt: now
      };
      
      insert('spiritualFitness', fitnessRecord);
      
      return {
        score: finalScore,
        details: scores,
        calculatedAt: now
      };
    }
  };

  // Meeting operations
  const meetingOperations = {
    createMeeting: (meetingData) => {
      const now = new Date().toISOString();
      const meetingId = meetingData.id || `meeting_${Date.now()}`;
      
      const meeting = {
        id: meetingId,
        name: meetingData.name || '',
        day: meetingData.day || '',
        time: meetingData.time || '',
        location: meetingData.location || '',
        address: meetingData.address || '',
        city: meetingData.city || '',
        state: meetingData.state || '',
        zip: meetingData.zip || '',
        type: meetingData.type || '',
        notes: meetingData.notes || '',
        shared: meetingData.shared === true,
        createdBy: meetingData.createdBy || null,
        createdAt: now,
        updatedAt: now
      };
      
      insert('meetings', meeting);
      return meetingId;
    },
    
    getSharedMeetings: () => {
      return query('meetings', meeting => meeting.shared === true)
        .sort((a, b) => {
          // Sort by day of week, then time
          const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
          const dayDiff = days.indexOf(a.day.toLowerCase()) - days.indexOf(b.day.toLowerCase());
          if (dayDiff !== 0) return dayDiff;
          return a.time.localeCompare(b.time);
        });
    },
    
    getUserMeetings: (userId) => {
      return query('meetings', meeting => meeting.createdBy === userId)
        .sort((a, b) => {
          // Sort by day of week, then time
          const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
          const dayDiff = days.indexOf(a.day.toLowerCase()) - days.indexOf(b.day.toLowerCase());
          if (dayDiff !== 0) return dayDiff;
          return a.time.localeCompare(b.time);
        });
    }
  };

  // Return the database API
  return {
    initDatabase,
    getAll,
    getById,
    insert,
    update,
    deleteById,
    query,
    calculateSobrietyDays,
    calculateSobrietyYears,
    userOperations,
    activityOperations,
    spiritualFitnessOperations,
    meetingOperations
  };
})();

// Main application code
document.addEventListener('DOMContentLoaded', async function() {
  console.log('Spiritual Condition Tracker App loaded');
  
  // Application state
  const state = {
    dbStatus: 'Not initialized',
    testUserId: null,
    testResults: [],
    loading: true,
    platformInfo: 'Web Platform'
  };

  // DOM Elements
  const elements = {
    root: document.getElementById('root')
  };

  // Initialize database
  async function initDb() {
    try {
      await db.initDatabase();
      state.dbStatus = 'Initialized';
      log('Database initialized successfully');
      log('Using localStorage database implementation');
      state.loading = false;
    } catch (error) {
      state.dbStatus = `Error: ${error.message}`;
      log(`Database init error: ${error.message}`);
      state.loading = false;
    }
    renderApp();
  }

  // Helper function to log messages
  function log(message) {
    console.log(message);
    state.testResults.push(message);
    renderApp();
  }

  // Clear logs
  function clearLogs() {
    state.testResults = [];
    renderApp();
  }

  // Create test user
  async function createTestUser() {
    try {
      const userId = await db.userOperations.createUser({
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
      
      state.testUserId = userId;
      log(`Created test user with ID: ${userId}`);
    } catch (error) {
      log(`Error creating user: ${error.message}`);
    }
  }

  // Create test activity
  async function createTestActivity() {
    if (!state.testUserId) {
      log('Create a test user first');
      return;
    }

    try {
      const activityId = await db.activityOperations.createActivity({
        userId: state.testUserId,
        type: 'prayer',
        duration: 15,
        notes: 'Morning prayer'
      });
      
      log(`Created activity with ID: ${activityId}`);
    } catch (error) {
      log(`Error creating activity: ${error.message}`);
    }
  }

  // Calculate spiritual fitness
  async function calculateSpiritualFitness() {
    if (!state.testUserId) {
      log('Create a test user first');
      return;
    }

    try {
      const fitness = await db.spiritualFitnessOperations.calculateSpiritualFitness(state.testUserId);
      log(`Spiritual fitness: ${fitness.score.toFixed(2)}`);
      log(`Details: ${JSON.stringify(fitness.details)}`);
    } catch (error) {
      log(`Error calculating spiritual fitness: ${error.message}`);
    }
  }

  // Get user activities
  async function getUserActivities() {
    if (!state.testUserId) {
      log('Create a test user first');
      return;
    }

    try {
      const activities = await db.activityOperations.getUserActivities(state.testUserId);
      log(`Found ${activities.length} activities`);
      
      activities.forEach(activity => {
        log(`- ${activity.type}: ${activity.duration} minutes`);
      });
    } catch (error) {
      log(`Error getting activities: ${error.message}`);
    }
  }

  // Create test meeting
  async function createTestMeeting() {
    if (!state.testUserId) {
      log('Create a test user first');
      return;
    }

    try {
      const meetingId = await db.meetingOperations.createMeeting({
        name: 'Thursday Night Beginners',
        day: 'thursday',
        time: '19:00',
        location: 'Community Center',
        address: '123 Main St',
        city: 'Anytown',
        state: 'CA',
        zip: '90210',
        type: 'open',
        notes: 'Beginner-friendly meeting',
        shared: true,
        createdBy: state.testUserId
      });
      
      log(`Created meeting with ID: ${meetingId}`);
    } catch (error) {
      log(`Error creating meeting: ${error.message}`);
    }
  }

  // Get meetings
  async function getMeetings() {
    try {
      const meetings = await db.meetingOperations.getSharedMeetings();
      log(`Found ${meetings.length} shared meetings`);
      
      meetings.forEach(meeting => {
        log(`- ${meeting.name} (${meeting.day}, ${meeting.time})`);
      });
    } catch (error) {
      log(`Error getting meetings: ${error.message}`);
    }
  }

  // Render the app based on current state
  function renderApp() {
    if (state.loading) {
      renderLoadingScreen();
    } else {
      renderMainApp();
    }

    // Add event listeners
    attachEventListeners();
  }

  // Render loading screen
  function renderLoadingScreen() {
    elements.root.innerHTML = `
      <div class="loading-container">
        <div class="loading-spinner"></div>
        <p class="loading-text">Initializing database...</p>
      </div>
    `;
  }

  // Render main app
  function renderMainApp() {
    elements.root.innerHTML = `
      <div class="app-container">
        <header>
          <h1 class="title">Spiritual Condition Tracker</h1>
          <p class="subtitle">Database Integration Test</p>
        </header>
        
        <div class="status-container">
          <span class="status-label">Database Status:</span>
          <span class="status-value ${state.dbStatus === 'Initialized' ? 'status-good' : 
                                   state.dbStatus.startsWith('Error') ? 'status-bad' : 
                                   'status-pending'}">
            ${state.dbStatus}
          </span>
        </div>
        
        <div class="status-container">
          <span class="status-label">Platform:</span>
          <span class="status-value">${state.platformInfo}</span>
        </div>
        
        <div class="button-container">
          <button id="create-user-btn" class="app-button">Create Test User</button>
          <button id="create-activity-btn" class="app-button">Create Activity</button>
          <button id="create-meeting-btn" class="app-button">Create Meeting</button>
          <button id="calculate-fitness-btn" class="app-button">Calculate Spiritual Fitness</button>
          <button id="get-activities-btn" class="app-button">Get Activities</button>
          <button id="get-meetings-btn" class="app-button">Get Meetings</button>
          <button id="clear-logs-btn" class="app-button clear-btn">Clear Logs</button>
        </div>
        
        <h2 class="logs-title">Test Results:</h2>
        <div class="logs-container">
          ${state.testResults.map(result => `
            <div class="log-line">${result}</div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // Attach event listeners to buttons
  function attachEventListeners() {
    const createUserBtn = document.getElementById('create-user-btn');
    if (createUserBtn) {
      createUserBtn.addEventListener('click', createTestUser);
    }
    
    const createActivityBtn = document.getElementById('create-activity-btn');
    if (createActivityBtn) {
      createActivityBtn.addEventListener('click', createTestActivity);
    }
    
    const createMeetingBtn = document.getElementById('create-meeting-btn');
    if (createMeetingBtn) {
      createMeetingBtn.addEventListener('click', createTestMeeting);
    }
    
    const calculateFitnessBtn = document.getElementById('calculate-fitness-btn');
    if (calculateFitnessBtn) {
      calculateFitnessBtn.addEventListener('click', calculateSpiritualFitness);
    }
    
    const getActivitiesBtn = document.getElementById('get-activities-btn');
    if (getActivitiesBtn) {
      getActivitiesBtn.addEventListener('click', getUserActivities);
    }
    
    const getMeetingsBtn = document.getElementById('get-meetings-btn');
    if (getMeetingsBtn) {
      getMeetingsBtn.addEventListener('click', getMeetings);
    }
    
    const clearLogsBtn = document.getElementById('clear-logs-btn');
    if (clearLogsBtn) {
      clearLogsBtn.addEventListener('click', clearLogs);
    }
  }

  // Start the app
  initDb();
});