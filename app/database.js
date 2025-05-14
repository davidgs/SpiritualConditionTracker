/**
 * Web-specific database implementation for Spiritual Condition Tracker
 * Uses localStorage to store data in the browser
 */

// Storage keys for each "table"
const STORAGE_KEYS = {
  users: 'aa_tracker_users',
  activities: 'aa_tracker_activities',
  spiritualFitness: 'aa_tracker_spiritual_fitness',
  meetings: 'aa_tracker_meetings',
  meetingReminders: 'aa_tracker_meeting_reminders',
  nearbyMembers: 'aa_tracker_nearby_members'
};

// Create a global database namespace
window.Database = window.Database || {};

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
Database.getById = (collection, id) => {
  const items = Database.getAll(collection);
  return items.find(item => item.id === id) || null;
};

/**
 * Add an item to a collection
 * @param {string} collection - The collection name
 * @param {Object} item - The item to add
 * @returns {Object} The added item
 */
Database.insert = (collection, item) => {
  const key = STORAGE_KEYS[collection];
  if (!key) {
    console.error(`Unknown collection: ${collection}`);
    return null;
  }
  
  try {
    const items = Database.getAll(collection);
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
Database.update = (collection, id, updates) => {
  const key = STORAGE_KEYS[collection];
  if (!key) {
    console.error(`Unknown collection: ${collection}`);
    return null;
  }
  
  try {
    const items = Database.getAll(collection);
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
Database.deleteById = (collection, id) => {
  const key = STORAGE_KEYS[collection];
  if (!key) {
    console.error(`Unknown collection: ${collection}`);
    return false;
  }
  
  try {
    const items = Database.getAll(collection);
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
Database.query = (collection, predicate) => {
  const items = Database.getAll(collection);
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
Database.calculateDistance = (lat1, lon1, lat2, lon2) => {
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
Database.calculateSobrietyDays = (sobrietyDate) => {
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
Database.calculateSobrietyYears = (sobrietyDate, decimalPlaces = 2) => {
  const days = Database.calculateSobrietyDays(sobrietyDate);
  const years = days / 365.25; // Account for leap years
  
  return parseFloat(years.toFixed(decimalPlaces));
};

// User operations
Database.userOperations = {
  getAll: () => Database.getAll('users'),
  
  get: (userId) => Database.getById('users', userId),
  
  create: (userData) => {
    const timestamp = new Date().toISOString();
    const userId = userData.id || `user_${Date.now()}`;
    
    const user = {
      id: userId,
      name: userData.name || '',
      sobrietyDate: userData.sobrietyDate || null,
      homeGroup: userData.homeGroup || '',
      phone: userData.phone || '',
      email: userData.email || '',
      privacySettings: userData.privacySettings || {
        shareLocation: false,
        shareActivities: false
      },
      createdAt: timestamp,
      updatedAt: timestamp
    };
    
    Database.insert('users', user);
    return user;
  },
  
  update: (userId, userData) => {
    const updates = {
      ...userData,
      updatedAt: new Date().toISOString()
    };
    
    return Database.update('users', userId, updates);
  },
  
  delete: (userId) => Database.deleteById('users', userId)
};

// Activity operations
Database.activityOperations = {
  getAll: (options = {}) => {
    const activities = Database.getAll('activities');
    
    let filtered = activities;
    
    // Filter by user ID if provided
    if (options.userId) {
      filtered = filtered.filter(a => a.userId === options.userId);
    }
    
    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Apply limit if provided
    if (options.limit && options.limit > 0) {
      filtered = filtered.slice(0, options.limit);
    }
    
    return filtered;
  },
  
  get: (activityId) => Database.getById('activities', activityId),
  
  create: (activityData) => {
    const timestamp = new Date().toISOString();
    const activityId = activityData.id || `activity_${Date.now()}`;
    
    const activity = {
      id: activityId,
      userId: activityData.userId,
      type: activityData.type,
      name: activityData.name || '',
      date: activityData.date || timestamp.split('T')[0],
      duration: activityData.duration || 0,
      notes: activityData.notes || '',
      createdAt: timestamp
    };
    
    Database.insert('activities', activity);
    return activity;
  },
  
  update: (activityId, activityData) => {
    return Database.update('activities', activityId, activityData);
  },
  
  delete: (activityId) => Database.deleteById('activities', activityId)
};

// Spiritual fitness operations
Database.spiritualFitnessOperations = {
  getForUser: (userId) => {
    const records = Database.getAll('spiritualFitness');
    
    return records
      .filter(record => record.userId === userId)
      .sort((a, b) => new Date(b.calculatedAt) - new Date(a.calculatedAt))[0] || null;
  },
  
  calculateAndSave: (userId, activities) => {
    // Get activities for the last 30 days
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);
    
    // Filter recent activities
    const recentActivities = activities.filter(activity => {
      const activityDate = new Date(activity.date);
      return activityDate >= thirtyDaysAgo && activity.userId === userId;
    });
    
    // Count activity types
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
    
    // Calculate components (max 10 points total)
    const scoreComponents = {
      meetings: Math.min(activityCounts.meeting / 10, 1) * 3, // 30% - Attendance at meetings (max 3 points)
      prayer: Math.min((activityCounts.prayer + activityCounts.meditation) / 20, 1) * 2, // 20% - Prayer/meditation (max 2 points)
      reading: Math.min(activityCounts.reading / 15, 1) * 1.5, // 15% - Reading program literature (max 1.5 points)
      service: Math.min(activityCounts.service / 5, 1) * 1.5, // 15% - Service work (max 1.5 points)
      stepwork: Math.min(activityCounts.stepwork / 5, 1) * 1, // 10% - Step work (max 1 point)
      sponsorship: Math.min(activityCounts.sponsorship / 5, 1) * 1 // 10% - Sponsorship (max 1 point)
    };
    
    // Calculate total score (max 10 points)
    const totalScore = Object.values(scoreComponents).reduce((sum, score) => sum + score, 0);
    
    // Create and save the record
    const timestamp = new Date().toISOString();
    const fitnessId = `sf_${Date.now()}`;
    
    const fitness = {
      id: fitnessId,
      userId,
      score: parseFloat(totalScore.toFixed(2)),
      components: scoreComponents,
      activityCounts,
      calculatedAt: timestamp
    };
    
    Database.insert('spiritualFitness', fitness);
    
    return fitness;
  }
};

// Meeting operations
Database.meetingOperations = {
  getAll: () => Database.getAll('meetings'),
  
  get: (meetingId) => Database.getById('meetings', meetingId),
  
  create: (meetingData) => {
    const timestamp = new Date().toISOString();
    const meetingId = meetingData.id || `meeting_${Date.now()}`;
    
    const meeting = {
      id: meetingId,
      name: meetingData.name || '',
      type: meetingData.type || '',
      day: meetingData.day || '',
      time: meetingData.time || '',
      location: meetingData.location || '',
      notes: meetingData.notes || '',
      shared: meetingData.shared === true,
      createdBy: meetingData.createdBy || null,
      createdAt: timestamp,
      updatedAt: timestamp
    };
    
    Database.insert('meetings', meeting);
    return meeting;
  },
  
  update: (meetingId, meetingData) => {
    const updates = {
      ...meetingData,
      updatedAt: new Date().toISOString()
    };
    
    return Database.update('meetings', meetingId, updates);
  },
  
  delete: (meetingId) => Database.deleteById('meetings', meetingId)
};

// Use a console message to confirm
console.log('Database module loaded');