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

/**
 * Initialize all data stores
 */
export const initDatabase = async () => {
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
export const getAll = (collection) => {
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
export const getById = (collection, id) => {
  const items = getAll(collection);
  return items.find(item => item.id === id) || null;
};

/**
 * Add an item to a collection
 * @param {string} collection - The collection name
 * @param {Object} item - The item to add
 * @returns {Object} The added item
 */
export const insert = (collection, item) => {
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
export const update = (collection, id, updates) => {
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
export const deleteById = (collection, id) => {
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
export const query = (collection, predicate) => {
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
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
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
export const calculateSobrietyDays = (sobrietyDate) => {
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
export const calculateSobrietyYears = (sobrietyDate, decimalPlaces = 2) => {
  const days = calculateSobrietyDays(sobrietyDate);
  const years = days / 365.25; // Account for leap years
  
  return parseFloat(years.toFixed(decimalPlaces));
};

// User operations
export const userOperations = {
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
export const activityOperations = {
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
export const spiritualFitnessOperations = {
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
export const meetingOperations = {
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

// Export the database interface
export default {
  initDatabase,
  getAll,
  getById,
  insert,
  update,
  deleteById,
  query,
  calculateDistance,
  calculateSobrietyDays,
  calculateSobrietyYears,
  userOperations,
  activityOperations,
  spiritualFitnessOperations,
  meetingOperations
};