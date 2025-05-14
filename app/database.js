/**
 * Client-side SQLite Database Module
 * This module handles all database operations for the Spiritual Condition Tracker
 */

// Data collections
let collections = {
  user: null,
  activities: [],
  meetings: [],
  nearbyUsers: []
};

/**
 * Initialize all data stores
 */
async function initDatabase() {
  console.log('Initializing database...');
  
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
      privacySettings: {
        discoverable: true,
        shareActivities: false,
        shareMeetings: true,
        proximityRadius: 1 // miles
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
  calculateSobrietyYears
};