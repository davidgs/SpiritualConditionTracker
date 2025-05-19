/**
 * Capacitor-compatible SQLite storage implementation
 * Optimized for native iOS and Android compiled apps
 * Fixed version with simpler implementation
 */

import { isPlatform } from '@ionic/react';
import { DEFAULT_SPIRITUAL_FITNESS_SCORE } from './constants';

// Make the default score available globally
window.DEFAULT_SPIRITUAL_FITNESS_SCORE = DEFAULT_SPIRITUAL_FITNESS_SCORE;

// Database connection
let db = null;
let dbData = {
  users: [],
  activities: [],
  meetings: [],
  preferences: {}
};

/**
 * Initialize the database connection
 * @returns {Promise<boolean>} Whether initialization was successful
 */
export async function initDatabase() {
  console.log("Initializing fixed database for app...");
  
  try {
    // For this simplified version, we'll use localStorage for data persistence
    // This addresses the SQLite initialization errors
    setupLocalStorageFallback();
    
    // Load initial data from localStorage
    loadFromLocalStorage();
    
    console.log("Database initialized successfully (fixed implementation)");
    return true;
  } catch (error) {
    console.error("Error initializing database:", error);
    setupLocalStorageFallback(); // Fallback in case of error
    return false;
  }
}

/**
 * Setup localStorage fallback for data persistence
 */
function setupLocalStorageFallback() {
  console.log("Setting up localStorage fallback for data persistence");

  db = {
    transaction: function(callback, errorCallback, successCallback) {
      try {
        // Create a simplified transaction object with executeSql method
        const tx = {
          executeSql: function(query, params, successCallback, errorCallback) {
            try {
              // Process query and return result through success callback
              const result = executeQueryOnLocalData(query, params);
              
              if (successCallback) {
                successCallback(tx, result);
              }
            } catch (error) {
              console.error("Error executing query:", error);
              if (errorCallback) {
                errorCallback(tx, error);
              }
            }
          }
        };
        
        // Execute the transaction
        callback(tx);
        
        // Call success callback if provided
        if (successCallback) {
          successCallback();
        }
      } catch (error) {
        console.error("Transaction error:", error);
        if (errorCallback) {
          errorCallback(error);
        }
      }
    }
  };
}

/**
 * Execute query on local data
 * @param {string} query - SQL query
 * @param {Array} params - Query parameters
 * @returns {Object} Query result
 */
function executeQueryOnLocalData(query, params) {
  // This is a simplified function to interpret SQL-like queries on local data
  // It doesn't handle all SQL cases, just the basic CRUD operations
  
  // Normalize the query by removing extra spaces and converting to lowercase
  const normalizedQuery = query.toLowerCase().trim().replace(/\s+/g, ' ');
  
  // SELECT query handling
  if (normalizedQuery.startsWith('select')) {
    return handleSelectQuery(normalizedQuery, params);
  }
  // INSERT query handling
  else if (normalizedQuery.startsWith('insert')) {
    return handleInsertQuery(normalizedQuery, params);
  }
  // UPDATE query handling
  else if (normalizedQuery.startsWith('update')) {
    return handleUpdateQuery(normalizedQuery, params);
  }
  // DELETE query handling
  else if (normalizedQuery.startsWith('delete')) {
    return handleDeleteQuery(normalizedQuery, params);
  }
  // CREATE TABLE query (just ignore for this implementation)
  else if (normalizedQuery.startsWith('create table')) {
    return { rows: { length: 0, item: () => null, _array: [] }, rowsAffected: 0, insertId: null };
  }
  
  // Default result for unsupported queries
  console.warn("Unsupported query type:", normalizedQuery);
  return { rows: { length: 0, item: () => null, _array: [] }, rowsAffected: 0, insertId: null };
}

/**
 * Handle SELECT query on local data
 * @param {string} query - The SQL query
 * @param {Array} params - Query parameters
 * @returns {Object} Query result
 */
function handleSelectQuery(query, params) {
  let values = [];
  let tableName = '';
  
  // Extract table name
  const fromMatch = query.match(/from\s+([a-z0-9_]+)/i);
  if (fromMatch && fromMatch[1]) {
    tableName = fromMatch[1];
  }
  
  // Get data from the appropriate table
  if (tableName === 'users') {
    values = dbData.users;
  } else if (tableName === 'activities') {
    values = dbData.activities;
  } else if (tableName === 'meetings') {
    values = dbData.meetings;
  } else if (tableName === 'preferences') {
    // Convert preferences object to array format
    values = Object.keys(dbData.preferences).map(key => {
      return { key, value: dbData.preferences[key] };
    });
  }
  
  // Handle WHERE clause if present
  if (query.includes('where')) {
    const whereClause = query.split('where')[1].trim();
    // This is a very simplified WHERE handling
    if (whereClause.includes('id = ?') && params && params.length > 0) {
      const id = params[0];
      values = values.filter(item => item.id === id);
    } else if (whereClause.includes('key = ?') && params && params.length > 0) {
      const key = params[0];
      values = values.filter(item => item.key === key);
    }
  }
  
  return {
    rows: {
      length: values.length,
      item: (i) => values[i],
      _array: values
    },
    rowsAffected: 0,
    insertId: null
  };
}

/**
 * Handle INSERT query on local data
 * @param {string} query - The SQL query
 * @param {Array} params - Query parameters
 * @returns {Object} Query result
 */
function handleInsertQuery(query, params) {
  let tableName = '';
  
  // Extract table name
  const intoMatch = query.match(/into\s+([a-z0-9_]+)/i);
  if (intoMatch && intoMatch[1]) {
    tableName = intoMatch[1];
  }
  
  // Handle different tables
  if (tableName === 'users' && params.length > 0) {
    const user = JSON.parse(params[params.length - 1]);
    if (!user.id) {
      user.id = 'user_' + Date.now();
    }
    
    // Add to users array
    dbData.users.push(user);
    saveToLocalStorage();
    
    return {
      rows: { length: 0, item: () => null, _array: [] },
      rowsAffected: 1,
      insertId: user.id
    };
  } else if (tableName === 'activities' && params.length > 0) {
    const activity = JSON.parse(params[params.length - 1]);
    if (!activity.id) {
      activity.id = 'activity_' + Date.now();
    }
    
    // Add to activities array
    dbData.activities.push(activity);
    saveToLocalStorage();
    
    return {
      rows: { length: 0, item: () => null, _array: [] },
      rowsAffected: 1,
      insertId: activity.id
    };
  } else if (tableName === 'meetings' && params.length > 0) {
    const meeting = JSON.parse(params[params.length - 1]);
    if (!meeting.id) {
      meeting.id = 'meeting_' + Date.now();
    }
    
    // Add to meetings array
    dbData.meetings.push(meeting);
    saveToLocalStorage();
    
    return {
      rows: { length: 0, item: () => null, _array: [] },
      rowsAffected: 1,
      insertId: meeting.id
    };
  } else if (tableName === 'preferences' && params.length >= 2) {
    const key = params[0];
    const value = params[1];
    
    // Update preferences
    dbData.preferences[key] = value;
    saveToLocalStorage();
    
    return {
      rows: { length: 0, item: () => null, _array: [] },
      rowsAffected: 1,
      insertId: null
    };
  }
  
  return {
    rows: { length: 0, item: () => null, _array: [] },
    rowsAffected: 0,
    insertId: null
  };
}

/**
 * Handle UPDATE query on local data
 * @param {string} query - The SQL query
 * @param {Array} params - Query parameters
 * @returns {Object} Query result
 */
function handleUpdateQuery(query, params) {
  let tableName = '';
  
  // Extract table name
  const updateMatch = query.match(/update\s+([a-z0-9_]+)/i);
  if (updateMatch && updateMatch[1]) {
    tableName = updateMatch[1];
  }
  
  // Handle different tables
  if (tableName === 'users' && params.length > 0) {
    const id = params[params.length - 1]; // ID is the last param in the update
    const updatedData = JSON.parse(params[0]); // Updated data is first param
    
    // Find and update user
    const userIndex = dbData.users.findIndex(user => user.id === id);
    if (userIndex !== -1) {
      dbData.users[userIndex] = { ...dbData.users[userIndex], ...updatedData };
      saveToLocalStorage();
      
      return {
        rows: { length: 0, item: () => null, _array: [] },
        rowsAffected: 1,
        insertId: null
      };
    }
  } else if (tableName === 'activities' && params.length > 0) {
    const id = params[params.length - 1];
    const updatedData = JSON.parse(params[0]);
    
    // Find and update activity
    const activityIndex = dbData.activities.findIndex(activity => activity.id === id);
    if (activityIndex !== -1) {
      dbData.activities[activityIndex] = { ...dbData.activities[activityIndex], ...updatedData };
      saveToLocalStorage();
      
      return {
        rows: { length: 0, item: () => null, _array: [] },
        rowsAffected: 1,
        insertId: null
      };
    }
  } else if (tableName === 'meetings' && params.length > 0) {
    const id = params[params.length - 1];
    const updatedData = JSON.parse(params[0]);
    
    // Find and update meeting
    const meetingIndex = dbData.meetings.findIndex(meeting => meeting.id === id);
    if (meetingIndex !== -1) {
      dbData.meetings[meetingIndex] = { ...dbData.meetings[meetingIndex], ...updatedData };
      saveToLocalStorage();
      
      return {
        rows: { length: 0, item: () => null, _array: [] },
        rowsAffected: 1,
        insertId: null
      };
    }
  } else if (tableName === 'preferences' && params.length >= 2) {
    const key = params[0];
    const value = params[1];
    
    // Update preference
    dbData.preferences[key] = value;
    saveToLocalStorage();
    
    return {
      rows: { length: 0, item: () => null, _array: [] },
      rowsAffected: 1,
      insertId: null
    };
  }
  
  return {
    rows: { length: 0, item: () => null, _array: [] },
    rowsAffected: 0,
    insertId: null
  };
}

/**
 * Handle DELETE query on local data
 * @param {string} query - The SQL query
 * @param {Array} params - Query parameters
 * @returns {Object} Query result
 */
function handleDeleteQuery(query, params) {
  let tableName = '';
  
  // Extract table name
  const fromMatch = query.match(/from\s+([a-z0-9_]+)/i);
  if (fromMatch && fromMatch[1]) {
    tableName = fromMatch[1];
  }
  
  // Handle WHERE clause
  if (query.includes('where') && params.length > 0) {
    const id = params[0];
    
    if (tableName === 'users') {
      const initialLength = dbData.users.length;
      dbData.users = dbData.users.filter(user => user.id !== id);
      const rowsAffected = initialLength - dbData.users.length;
      
      if (rowsAffected > 0) {
        saveToLocalStorage();
      }
      
      return {
        rows: { length: 0, item: () => null, _array: [] },
        rowsAffected,
        insertId: null
      };
    } else if (tableName === 'activities') {
      const initialLength = dbData.activities.length;
      dbData.activities = dbData.activities.filter(activity => activity.id !== id);
      const rowsAffected = initialLength - dbData.activities.length;
      
      if (rowsAffected > 0) {
        saveToLocalStorage();
      }
      
      return {
        rows: { length: 0, item: () => null, _array: [] },
        rowsAffected,
        insertId: null
      };
    } else if (tableName === 'meetings') {
      const initialLength = dbData.meetings.length;
      dbData.meetings = dbData.meetings.filter(meeting => meeting.id !== id);
      const rowsAffected = initialLength - dbData.meetings.length;
      
      if (rowsAffected > 0) {
        saveToLocalStorage();
      }
      
      return {
        rows: { length: 0, item: () => null, _array: [] },
        rowsAffected,
        insertId: null
      };
    } else if (tableName === 'preferences') {
      const key = params[0];
      if (dbData.preferences[key] !== undefined) {
        delete dbData.preferences[key];
        saveToLocalStorage();
        
        return {
          rows: { length: 0, item: () => null, _array: [] },
          rowsAffected: 1,
          insertId: null
        };
      }
    }
  }
  
  return {
    rows: { length: 0, item: () => null, _array: [] },
    rowsAffected: 0,
    insertId: null
  };
}

/**
 * Save data to localStorage
 */
function saveToLocalStorage() {
  try {
    localStorage.setItem('users', JSON.stringify(dbData.users));
    localStorage.setItem('activities', JSON.stringify(dbData.activities));
    localStorage.setItem('meetings', JSON.stringify(dbData.meetings));
    localStorage.setItem('preferences', JSON.stringify(dbData.preferences));
  } catch (error) {
    console.error("Error saving to localStorage:", error);
  }
}

/**
 * Load data from localStorage
 */
function loadFromLocalStorage() {
  try {
    const users = localStorage.getItem('users');
    if (users) {
      dbData.users = JSON.parse(users);
    }
    
    const activities = localStorage.getItem('activities');
    if (activities) {
      dbData.activities = JSON.parse(activities);
    }
    
    const meetings = localStorage.getItem('meetings');
    if (meetings) {
      dbData.meetings = JSON.parse(meetings);
    }
    
    const preferences = localStorage.getItem('preferences');
    if (preferences) {
      dbData.preferences = JSON.parse(preferences);
    }
    
    console.log("Data loaded from localStorage");
  } catch (error) {
    console.error("Error loading from localStorage:", error);
  }
}

/**
 * Setup a global database object that matches the expected interface
 * @returns {Object} Database object
 */
export function setupGlobalDbObject() {
  // Create the global db object with expected methods
  const dbObj = {
    getAll: function(collection) {
      if (collection === 'users') return dbData.users;
      if (collection === 'activities') return dbData.activities;
      if (collection === 'meetings') return dbData.meetings;
      return [];
    },
    
    getById: function(collection, id) {
      if (collection === 'users') {
        return dbData.users.find(item => item.id === id) || null;
      }
      if (collection === 'activities') {
        return dbData.activities.find(item => item.id === id) || null;
      }
      if (collection === 'meetings') {
        return dbData.meetings.find(item => item.id === id) || null;
      }
      return null;
    },
    
    add: function(collection, item) {
      if (!item.id) {
        item.id = collection.slice(0, -1) + '_' + Date.now();
      }
      
      if (collection === 'users') {
        dbData.users.push(item);
      } else if (collection === 'activities') {
        dbData.activities.push(item);
      } else if (collection === 'meetings') {
        dbData.meetings.push(item);
      }
      
      saveToLocalStorage();
      return item;
    },
    
    update: function(collection, id, updates) {
      let updated = null;
      
      if (collection === 'users') {
        const index = dbData.users.findIndex(item => item.id === id);
        if (index !== -1) {
          dbData.users[index] = { ...dbData.users[index], ...updates };
          updated = dbData.users[index];
        }
      } else if (collection === 'activities') {
        const index = dbData.activities.findIndex(item => item.id === id);
        if (index !== -1) {
          dbData.activities[index] = { ...dbData.activities[index], ...updates };
          updated = dbData.activities[index];
        }
      } else if (collection === 'meetings') {
        const index = dbData.meetings.findIndex(item => item.id === id);
        if (index !== -1) {
          dbData.meetings[index] = { ...dbData.meetings[index], ...updates };
          updated = dbData.meetings[index];
        }
      }
      
      if (updated) {
        saveToLocalStorage();
      }
      
      return updated;
    },
    
    remove: function(collection, id) {
      let removed = false;
      
      if (collection === 'users') {
        const initialLength = dbData.users.length;
        dbData.users = dbData.users.filter(item => item.id !== id);
        removed = initialLength > dbData.users.length;
      } else if (collection === 'activities') {
        const initialLength = dbData.activities.length;
        dbData.activities = dbData.activities.filter(item => item.id !== id);
        removed = initialLength > dbData.activities.length;
      } else if (collection === 'meetings') {
        const initialLength = dbData.meetings.length;
        dbData.meetings = dbData.meetings.filter(item => item.id !== id);
        removed = initialLength > dbData.meetings.length;
      }
      
      if (removed) {
        saveToLocalStorage();
      }
      
      return removed;
    },
    
    query: function(collection, predicate) {
      if (collection === 'users') {
        return dbData.users.filter(predicate);
      }
      if (collection === 'activities') {
        return dbData.activities.filter(predicate);
      }
      if (collection === 'meetings') {
        return dbData.meetings.filter(predicate);
      }
      return [];
    },
    
    getPreference: function(key, defaultValue) {
      return dbData.preferences[key] !== undefined ? dbData.preferences[key] : defaultValue;
    },
    
    setPreference: function(key, value) {
      dbData.preferences[key] = value;
      saveToLocalStorage();
      return true;
    },
    
    calculateSobrietyDays: function(sobrietyDate) {
      return calculateSobrietyDays(sobrietyDate);
    },
    
    calculateSobrietyYears: function(sobrietyDate, decimalPlaces = 2) {
      return calculateSobrietyYears(sobrietyDate, decimalPlaces);
    },
    
    calculateSpiritualFitness: function() {
      return calculateSpiritualFitness(dbData.activities);
    },
    
    calculateSpiritualFitnessWithTimeframe: function(timeframe = 30) {
      return calculateSpiritualFitnessWithTimeframe(dbData.activities, timeframe);
    }
  };
  
  // Set the global object
  window.db = dbObj;
  
  return dbObj;
}

/**
 * Check if there's data in localStorage
 * @returns {boolean} Whether localStorage has data
 */
export function hasLocalStorageData() {
  return !!(localStorage.getItem('users') || 
           localStorage.getItem('activities') || 
           localStorage.getItem('meetings'));
}

/**
 * Migrate data from localStorage to SQLite
 * @param {Object} dbObj - Database object
 */
export async function migrateFromLocalStorage(dbObj) {
  // Since we're already using localStorage, no migration is needed
  return true;
}

/**
 * Calculate sobriety days based on sobriety date
 * @param {string} sobrietyDate - Sobriety date in ISO format
 * @returns {number} - Number of days sober
 */
export function calculateSobrietyDays(sobrietyDate) {
  if (!sobrietyDate) return 0;
  
  const startDate = new Date(sobrietyDate);
  const now = new Date();
  
  // Calculate difference in milliseconds
  const diffMs = now - startDate;
  
  // Convert to days and return the integer value
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Calculate sobriety years with decimal precision
 * @param {string} sobrietyDate - Sobriety date in ISO format
 * @param {number} decimalPlaces - Number of decimal places
 * @returns {number} - Years of sobriety with decimal precision
 */
export function calculateSobrietyYears(sobrietyDate, decimalPlaces = 2) {
  if (!sobrietyDate) return 0;
  
  const startDate = new Date(sobrietyDate);
  const now = new Date();
  
  // Calculate difference in milliseconds
  const diffMs = now - startDate;
  
  // Convert to years with decimal precision
  const years = diffMs / (1000 * 60 * 60 * 24 * 365.25);
  
  // Return with specified decimal places
  return parseFloat(years.toFixed(decimalPlaces));
}

/**
 * Calculate spiritual fitness score
 * @param {Array} activities - Activities array
 * @returns {number} - Spiritual fitness score
 */
function calculateSpiritualFitness(activities) {
  // Use default timeframe of 30 days
  return calculateSpiritualFitnessWithTimeframe(activities, 30);
}

/**
 * Calculate spiritual fitness with a custom timeframe
 * @param {Array} activities - Activities array
 * @param {number} timeframe - Number of days to calculate score for
 * @returns {number} - Spiritual fitness score (0-100)
 */
function calculateSpiritualFitnessWithTimeframe(activities, timeframe = 30) {
  // Start with a base score
  const baseScore = 5;
  let finalScore = baseScore;
  
  // Only proceed if we have activities
  if (activities && activities.length > 0) {
    // Define time period based on timeframe
    const now = new Date();
    const startDate = new Date();
    startDate.setDate(now.getDate() - timeframe);
    
    // Filter for recent activities
    const recentActivities = activities.filter(activity => {
      const activityDate = new Date(activity.date);
      return activityDate >= startDate && activityDate <= now;
    });
    
    // Add points based on activity count (2 points per activity, max 40)
    const activityPoints = Math.min(40, recentActivities.length * 2);
    
    // Track unique days with activities for consistency calculation
    const activityDays = new Set();
    recentActivities.forEach(activity => {
      if (activity.date) {
        const dayKey = new Date(activity.date).toISOString().split('T')[0];
        activityDays.add(dayKey);
      }
    });
    
    const daysWithActivities = activityDays.size;
    
    // Calculate consistency points (up to 40 points)
    const consistencyPercentage = daysWithActivities / timeframe;
    const consistencyPoints = Math.round(consistencyPercentage * 40);
    
    // Calculate final score (capped at 100)
    finalScore = Math.min(100, baseScore + activityPoints + consistencyPoints);
  }
  
  return finalScore;
}