/**
 * Database implementation for Spiritual Condition Tracker Web Version
 * Uses the existing utilities from the React Native app
 */

// Create a namespace for our database functionality
window.Database = {};

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
Database.initDatabase = async () => {
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
 * Initialize SQLite WASM database
 * @returns {Promise<Object>} SQLite database instance
 */
Database.initSqliteWasm = async () => {
  try {
    console.log('Initializing SQLite WASM database...');
    
    // Check if SQL.js is loaded
    if (!window.initSqlJs) {
      console.error('SQL.js not loaded');
      return null;
    }
    
    // Initialize SQLite with WASM
    const SQL = await window.initSqlJs({
      locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
    });
    
    // Create a database
    const db = new SQL.Database();
    
    // Create tables
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT,
        sobrietyDate TEXT,
        homeGroup TEXT,
        phone TEXT,
        email TEXT,
        sponsorId TEXT,
        privacySettings TEXT,
        createdAt TEXT,
        updatedAt TEXT
      );
    `);
    
    db.run(`
      CREATE TABLE IF NOT EXISTS activities (
        id TEXT PRIMARY KEY,
        userId TEXT,
        type TEXT,
        date TEXT,
        duration INTEGER,
        notes TEXT,
        createdAt TEXT,
        FOREIGN KEY(userId) REFERENCES users(id)
      );
    `);
    
    db.run(`
      CREATE TABLE IF NOT EXISTS spiritual_fitness (
        id TEXT PRIMARY KEY,
        userId TEXT,
        score REAL,
        prayerScore REAL,
        meditationScore REAL,
        readingScore REAL,
        meetingScore REAL,
        serviceScore REAL,
        calculatedAt TEXT,
        FOREIGN KEY(userId) REFERENCES users(id)
      );
    `);
    
    db.run(`
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
    
    console.log('SQLite WASM database initialized successfully');
    return db;
  } catch (error) {
    console.error('Error initializing SQLite WASM database:', error);
    return null;
  }
};

/**
 * Get all items from a collection
 * @param {string} collection - The collection name
 * @returns {Array} All items in the collection
 */
Database.getAll = (collection) => {
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
 * @param {string} collection - The collection name
 * @param {string} id - The item ID
 * @returns {Object|null} The found item or null
 */
Database. getById = (collection, id) => {
  const items = getAll(collection);
  return items.find(item => item.id === id) || null;
};

/**
 * Add an item to a collection
 * @param {string} collection - The collection name
 * @param {Object} item - The item to add
 * @returns {Object} The added item
 */
Database. insert = (collection, item) => {
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
 * @param {string} collection - The collection name
 * @param {string} id - The item ID
 * @param {Object} updates - The updates to apply
 * @returns {Object|null} The updated item or null if not found
 */
Database. update = (collection, id, updates) => {
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
 * @param {string} collection - The collection name
 * @param {string} id - The item ID
 * @returns {boolean} Whether the item was removed
 */
Database. deleteById = (collection, id) => {
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
 * @param {string} collection - The collection name
 * @param {Function} predicate - Filter function
 * @returns {Array} Filtered items
 */
Database. query = (collection, predicate) => {
  const items = getAll(collection);
  return items.filter(predicate);
};

/**
 * Calculate distance between two lat/long points
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} - Distance in miles
 */
Database. calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (lat1 === lat2 && lon1 === lon2) {
    return 0;
  }
  
  const radlat1 = (Math.PI * lat1) / 180;
  const radlat2 = (Math.PI * lat2) / 180;
  const theta = lon1 - lon2;
  const radtheta = (Math.PI * theta) / 180;
  
  let dist = Math.sin(radlat1) * Math.sin(radlat2) + 
            Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
  
  if (dist > 1) dist = 1;
  
  dist = Math.acos(dist);
  dist = (dist * 180) / Math.PI;
  dist = dist * 60 * 1.1515; // Miles
  
  return dist;
};

/**
 * Calculate sobriety days based on sobriety date
 * @param {string} sobrietyDate - Sobriety date in ISO format
 * @returns {number} - Number of days sober
 */
Database. calculateSobrietyDays = (sobrietyDate) => {
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
 * @param {string} sobrietyDate - Sobriety date in ISO format
 * @param {number} decimalPlaces - Number of decimal places
 * @returns {number} - Years of sobriety with decimal precision
 */
Database. calculateSobrietyYears = (sobrietyDate, decimalPlaces = 2) => {
  const days = calculateSobrietyDays(sobrietyDate);
  const years = days / 365.25; // Account for leap years
  
  return parseFloat(years.toFixed(decimalPlaces));
};

// User operations
Database. userOperations = {
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
Database. activityOperations = {
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
Database. spiritualFitnessOperations = {
  calculateSpiritualFitness: (userId) => {
    // Define weights for different activity types
    const weights = {
      meeting: 10,   // Attending a meeting
      prayer: 8,     // Prayer
      meditation: 8, // Meditation
      reading: 6,    // Reading AA literature
      callSponsor: 5, // Calling sponsor
      callSponsee: 4, // Calling sponsee
      service: 9,    // Service work
      stepWork: 10   // Working on steps
    };
    
    // Get user activities for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const activities = query('activities', 
      activity => activity.userId === userId && new Date(activity.date) >= thirtyDaysAgo
    );
    
    // Initialize scores
    let totalScore = 0;
    let eligibleActivities = 0;
    
    // Group activities by type and calculate scores
    const breakdown = {};
    
    activities.forEach(activity => {
      const type = activity.type;
      if (!weights[type]) return;
      
      // Initialize type in breakdown if not exists
      if (!breakdown[type]) {
        breakdown[type] = {
          count: 0,
          points: 0,
          recentDates: []
        };
      }
      
      // Update breakdown
      breakdown[type].count++;
      breakdown[type].points += weights[type];
      breakdown[type].recentDates.push(activity.date);
      
      // Update total score
      totalScore += weights[type];
      eligibleActivities++;
    });
    
    // Calculate final score (normalized to 10)
    let finalScore = 0;
    if (eligibleActivities > 0) {
      // Base score on total points, but cap at 10 and round to 2 decimal places
      finalScore = Math.min(10, (totalScore / (eligibleActivities * 4)));
      finalScore = Math.round(finalScore * 100) / 100;
    }
    
    // Save to database
    const now = new Date().toISOString();
    const fitnessId = `sf_${Date.now()}`;
    
    const fitnessRecord = {
      id: fitnessId,
      userId: userId,
      score: finalScore,
      breakdown: JSON.stringify(breakdown),
      calculatedAt: now
    };
    
    insert('spiritualFitness', fitnessRecord);
    
    return {
      score: finalScore,
      breakdown,
      eligibleActivities,
      totalPoints: totalScore,
      calculatedAt: now
    };
  },
  
  getLatestSpiritualFitness: (userId) => {
    const fitnessRecords = query('spiritualFitness', 
      record => record.userId === userId
    ).sort((a, b) => new Date(b.calculatedAt) - new Date(a.calculatedAt));
    
    if (fitnessRecords.length === 0) {
      return spiritualFitnessOperations.calculateSpiritualFitness(userId);
    }
    
    const latestRecord = fitnessRecords[0];
    
    // Parse breakdown if it's a string
    if (typeof latestRecord.breakdown === 'string') {
      try {
        latestRecord.breakdown = JSON.parse(latestRecord.breakdown);
      } catch (error) {
        console.error('Error parsing breakdown:', error);
        latestRecord.breakdown = {};
      }
    }
    
    return latestRecord;
  }
};

// Meeting operations
Database. meetingOperations = {
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
  },
  
  deleteMeeting: (meetingId) => {
    return deleteById('meetings', meetingId);
  }
};

// All functions are now attached to the Database object
// No need for module exports