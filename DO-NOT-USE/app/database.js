/**
 * Client-side SQLite Database Module
 * This module handles all database operations for the Spiritual Condition Tracker
 */

// Data collections
let collections = {
  user: null,
  activities: [],
  meetings: [],
  nearbyUsers: [],
  connections: [],
  messages: [],
  preferences: {
    scoreTimeframe: 30 // Default to 30 days for spiritual fitness score
  }
};

/**
 * Initialize all data stores
 */
async function initDatabase() {
  console.log('Initializing database...');
  
  // Load preferences from localStorage
  const preferencesData = localStorage.getItem('preferences');
  if (preferencesData) {
    collections.preferences = JSON.parse(preferencesData);
  } else {
    // Save default preferences to localStorage
    localStorage.setItem('preferences', JSON.stringify(collections.preferences));
  }
  
  // Check for existing user data in localStorage
  const userData = localStorage.getItem('user');
  if (userData) {
    collections.user = JSON.parse(userData);
  } else {
    // Set default user profile if none exists
    collections.user = {
      id: 1,
      name: '',
      sobrietyDate: '',
      homeGroup: '',
      sponsorName: '',
      sponsorPhone: '',
      sponsees: [],
      // Keys for secure messaging
      messagingKeys: {
        publicKey: '',
        privateKey: '',
        fingerprint: ''
      },
      privacySettings: {
        discoverable: true,
        shareActivities: false,
        shareMeetings: true,
        proximityRadius: 1, // miles
        allowMessages: true
      }
    };
    localStorage.setItem('user', JSON.stringify(collections.user));
  }
  
  // Load activities from localStorage
  const activitiesData = localStorage.getItem('activities');
  if (activitiesData) {
    collections.activities = JSON.parse(activitiesData);
  }
  
  // Load meetings from localStorage
  const meetingsData = localStorage.getItem('meetings');
  if (meetingsData) {
    collections.meetings = JSON.parse(meetingsData);
  }
  
  // Load connections from localStorage
  const connectionsData = localStorage.getItem('connections');
  if (connectionsData) {
    collections.connections = JSON.parse(connectionsData);
  }
  
  // Load messages from localStorage
  const messagesData = localStorage.getItem('messages');
  if (messagesData) {
    collections.messages = JSON.parse(messagesData);
  }
  
  console.log('Database initialized successfully');
  return collections;
}

/**
 * Get all items from a collection
 * @param {string} collection - The collection name
 * @returns {Array} All items in the collection
 */
function getAll(collection) {
  return collections[collection] || [];
}

/**
 * Get an item by ID from a collection
 * @param {string} collection - The collection name
 * @param {string} id - The item ID
 * @returns {Object|null} The found item or null
 */
function getById(collection, id) {
  if (!collections[collection]) return null;
  
  if (Array.isArray(collections[collection])) {
    return collections[collection].find(item => item.id === id) || null;
  }
  
  return collections[collection].id === id ? collections[collection] : null;
}

/**
 * Add an item to a collection
 * @param {string} collection - The collection name
 * @param {Object} item - The item to add
 * @returns {Object} The added item
 */
function add(collection, item) {
  console.log(`Adding to ${collection}:`, item);
  console.log(`Date before saving:`, item.date);
  
  if (!collections[collection]) {
    collections[collection] = [];
  }
  
  if (collection === 'user') {
    collections[collection] = item;
    localStorage.setItem(collection, JSON.stringify(item));
    return item;
  }
  
  // Generate a unique ID if none is provided
  if (!item.id) {
    item.id = Date.now().toString();
  }
  
  // For activities, ensure the date is preserved exactly as submitted
  if (collection === 'activities' && item.date) {
    // Keep the date exactly as is - do not convert to Date object
    console.log(`Keeping original date: ${item.date}`);
  }
  
  // Add timestamps
  if (!item.createdAt) {
    item.createdAt = new Date().toISOString();
  }
  item.updatedAt = new Date().toISOString();
  
  collections[collection].push(item);
  localStorage.setItem(collection, JSON.stringify(collections[collection]));
  
  return item;
}

/**
 * Update an item in a collection
 * @param {string} collection - The collection name
 * @param {string} id - The item ID
 * @param {Object} updates - The updates to apply
 * @returns {Object|null} The updated item or null if not found
 */
function update(collection, id, updates) {
  if (collection === 'user') {
    const updatedUser = { ...collections[collection], ...updates };
    collections[collection] = updatedUser;
    localStorage.setItem(collection, JSON.stringify(updatedUser));
    return updatedUser;
  }
  
  if (!collections[collection]) return null;
  
  const index = collections[collection].findIndex(item => item.id === id);
  if (index === -1) return null;
  
  // Update the item
  const updatedItem = { 
    ...collections[collection][index], 
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  collections[collection][index] = updatedItem;
  localStorage.setItem(collection, JSON.stringify(collections[collection]));
  
  return updatedItem;
}

/**
 * Remove an item from a collection
 * @param {string} collection - The collection name
 * @param {string} id - The item ID
 * @returns {boolean} Whether the item was removed
 */
function remove(collection, id) {
  if (!collections[collection]) return false;
  
  const initialLength = collections[collection].length;
  collections[collection] = collections[collection].filter(item => item.id !== id);
  
  const removed = initialLength > collections[collection].length;
  if (removed) {
    localStorage.setItem(collection, JSON.stringify(collections[collection]));
  }
  
  return removed;
}

/**
 * Query items in a collection
 * @param {string} collection - The collection name
 * @param {Function} predicate - Filter function
 * @returns {Array} Filtered items
 */
function query(collection, predicate) {
  if (!collections[collection]) return [];
  if (!Array.isArray(collections[collection])) return [];
  
  return collections[collection].filter(predicate);
}

/**
 * Calculate distance between two lat/long points
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} - Distance in miles
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 3958.8; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculate sobriety days based on sobriety date
 * @param {string} sobrietyDate - Sobriety date in ISO format
 * @returns {number} - Number of days sober
 */
function calculateSobrietyDays(sobrietyDate) {
  if (!sobrietyDate) return 0;
  
  const startDate = new Date(sobrietyDate);
  const today = new Date();
  
  // Calculate difference in milliseconds
  const diffMs = today - startDate;
  
  // Convert to days
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Calculate sobriety years with decimal precision
 * @param {string} sobrietyDate - Sobriety date in ISO format
 * @param {number} decimalPlaces - Number of decimal places
 * @returns {number} - Years of sobriety with decimal precision
 */
function calculateSobrietyYears(sobrietyDate, decimalPlaces = 2) {
  if (!sobrietyDate) return 0;
  
  const startDate = new Date(sobrietyDate);
  const today = new Date();
  
  // Calculate difference in milliseconds
  const diffMs = today - startDate;
  
  // Calculate years with decimal precision
  const years = diffMs / (1000 * 60 * 60 * 24 * 365.25);
  
  // Round to specified decimal places
  return parseFloat(years.toFixed(decimalPlaces));
}

/**
 * Calculate spiritual fitness score based on activities in the last 30 days
 * @returns {number} - Spiritual fitness score (0-100)
 */
function calculateSpiritualFitness() {
  if (!collections.activities || collections.activities.length === 0) {
    return 0;
  }
  
  // Get current date and date 30 days ago
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(now.getDate() - 30);
  
  // Filter activities in the last 30 days
  const recentActivities = collections.activities.filter(activity => {
    const activityDate = new Date(activity.date);
    return activityDate >= thirtyDaysAgo && activityDate <= now;
  });
  
  if (recentActivities.length === 0) {
    return 0;
  }
  
  let score = 0;
  let meetingsCount = 0;
  let sponseeTime = 0; // Track sponsee time for capping
  
  // Count activities by type for variety bonus
  const activityTypes = new Set();
  
  recentActivities.forEach(activity => {
    activityTypes.add(activity.type);
    
    switch (activity.type) {
      case 'meeting':
        // Base points for meeting attendance
        score += 5;
        meetingsCount++;
        
        // Additional points for roles
        if (activity.wasSpeaker) score += 3;
        if (activity.wasShare) score += 1;
        if (activity.wasChair) score += 1; // New: chair bonus
        break;
      
      case 'prayer':
      case 'meditation':
        // 2 points per 30 min
        score += Math.ceil(activity.duration / 30) * 2;
        break;
      
      case 'literature':
        // 2 points per 30 min
        score += Math.ceil(activity.duration / 30) * 2;
        break;
      
      case 'service':
        // 3 points per 30 min
        score += Math.ceil(activity.duration / 30) * 3;
        break;
      
      case 'sponsee':
        // 4 points per 30 min, maximum 20 points
        const sponseePoints = Math.ceil(activity.duration / 30) * 4;
        sponseeTime += sponseePoints;
        break;
      
      default:
        // 1 point for any other activity type
        score += 1;
    }
  });
  
  // Apply cap to sponsee time
  score += Math.min(sponseeTime, 20);
  
  // Add variety bonus (1-5 additional points)
  const varietyBonus = Math.min(activityTypes.size, 5);
  score += varietyBonus;
  
  // Cap the score at 100
  return Math.min(score, 100);
}

/**
 * Get user preference
 * @param {string} key - The preference key
 * @returns {any} The preference value
 */
function getPreference(key) {
  return collections.preferences[key];
}

/**
 * Set user preference
 * @param {string} key - The preference key
 * @param {any} value - The preference value
 */
function setPreference(key, value) {
  collections.preferences[key] = value;
  localStorage.setItem('preferences', JSON.stringify(collections.preferences));
  return value;
}

/**
 * Calculate spiritual fitness with a custom timeframe
 * @param {number} timeframe - Number of days to calculate score for
 * @returns {number} - Spiritual fitness score (0-100)
 */
function calculateSpiritualFitnessWithTimeframe(timeframe = 30) {
  const today = new Date();
  const timeframeDate = new Date(today);
  timeframeDate.setDate(today.getDate() - timeframe);
  
  // Get activities within the specified timeframe
  const recentActivities = collections.activities.filter(activity => {
    const activityDate = new Date(activity.date);
    return activityDate >= timeframeDate;
  });
  
  // Base calculation
  let score = 0;
  let meetingsCount = 0;
  let sponseeTime = 0;
  
  const activityTypes = new Set();
  
  // Group activities by week to analyze consistency
  const activityByWeek = {};
  const totalWeeks = Math.ceil(timeframe / 7);
  
  recentActivities.forEach(activity => {
    activityTypes.add(activity.type);
    
    // Calculate week number (0 = current week, 1 = last week, etc.)
    const activityDate = new Date(activity.date);
    const daysDiff = Math.floor((today - activityDate) / (1000 * 60 * 60 * 24));
    const weekNum = Math.floor(daysDiff / 7);
    
    // Initialize the week if not already
    if (!activityByWeek[weekNum]) {
      activityByWeek[weekNum] = {
        count: 0,
        types: new Set()
      };
    }
    
    // Add to week stats
    activityByWeek[weekNum].count++;
    activityByWeek[weekNum].types.add(activity.type);
    
    // Calculate base score as before
    switch (activity.type) {
      case 'meeting':
        score += 5;
        meetingsCount++;
        if (activity.wasSpeaker) score += 3;
        if (activity.wasShare) score += 1;
        if (activity.wasChair) score += 1;
        break;
      
      case 'prayer':
      case 'meditation':
        score += Math.ceil(activity.duration / 30) * 2;
        break;
      
      case 'literature':
        score += Math.ceil(activity.duration / 30) * 2;
        break;
      
      case 'service':
        score += Math.ceil(activity.duration / 30) * 3;
        break;
      
      case 'sponsee':
        const sponseePoints = Math.ceil(activity.duration / 30) * 4;
        sponseeTime += sponseePoints;
        break;
      
      default:
        score += 1;
    }
  });
  
  // Add sponsee time with cap
  score += Math.min(sponseeTime, 20);
  
  // Add variety bonus
  const varietyBonus = Math.min(activityTypes.size, 5);
  score += varietyBonus;
  
  // Apply consistency factor based on timeframe
  // Count how many weeks had activities
  const activeWeeks = Object.keys(activityByWeek).length;
  
  // Longer timeframes should have more consistency
  let consistencyScore = 0;
  
  if (timeframe <= 30) {
    // For 30 days, at least 3 of 4 weeks should have activities
    consistencyScore = Math.min(activeWeeks / 4, 1) * 10;
  } else if (timeframe <= 90) {
    // For 60-90 days, we expect more consistency over more weeks
    // For 60 days, that's ~8 weeks, for 90 days, that's ~12 weeks
    const expectedActiveWeeks = Math.ceil(timeframe / 7) * 0.75; // Expect activity in 75% of weeks
    consistencyScore = Math.min(activeWeeks / expectedActiveWeeks, 1) * 15;
  } else {
    // For longer timeframes (180-365 days), consistency is even more important
    // We expect activity in at least 70% of weeks
    const expectedActiveWeeks = Math.ceil(timeframe / 7) * 0.7;
    consistencyScore = Math.min(activeWeeks / expectedActiveWeeks, 1) * 20;
    
    // For longer timeframes, we also check for recent activity in the last 30 days
    const recentWeeks = Object.keys(activityByWeek).filter(week => week < 5).length;
    if (recentWeeks === 0) {
      // Significant penalty for no recent activity in last month
      consistencyScore -= 10;
    } else if (recentWeeks < 3) {
      // Some penalty for limited recent activity
      consistencyScore -= 5;
    }
  }
  
  // Add consistency score
  score += consistencyScore;
  
  // Normalize score based on timeframe - longer timeframes have higher expectations
  let normalizedScore = score;
  
  if (timeframe > 30) {
    // For timeframes over 30 days, we adjust expectations upward
    // The divisor increases as the timeframe increases, making it harder to maintain a high score
    const timeframeAdjustment = 1 + ((timeframe - 30) / 120); // Gradual increase
    normalizedScore = score / timeframeAdjustment;
  }
  
  // Debug output
  console.log("Spiritual Fitness Calculation:", {
    timeframe,
    activities: recentActivities.length,
    activeWeeks,
    totalWeeks,
    rawScore: score,
    consistencyScore,
    finalScore: Math.min(Math.round(normalizedScore), 100)
  });
  
  return Math.min(Math.round(normalizedScore), 100);
}

// Export database functions
window.db = {
  init: initDatabase,
  getAll,
  getById,
  add,
  update,
  remove,
  query,
  calculateDistance,
  calculateSobrietyDays,
  calculateSobrietyYears,
  calculateSpiritualFitness,
  calculateSpiritualFitnessWithTimeframe,
  getPreference,
  setPreference
};