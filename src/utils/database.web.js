/**
 * Web-specific implementation of database operations using localStorage
 * This is used automatically when running on web platforms
 */

// Define database schema
const DB_NAME = 'aarecovery.db';
const DB_VERSION = '1.0';
const DB_DISPLAY_NAME = 'AA Recovery Database';

// Tables storage keys
const TABLES = {
  USERS: 'aarecovery_users',
  ACTIVITIES: 'aarecovery_activities',
  SPIRITUAL_FITNESS: 'aarecovery_spiritual_fitness',
  MEETINGS: 'aarecovery_meetings',
  MEETING_REMINDERS: 'aarecovery_meeting_reminders',
  NEARBY_MEMBERS: 'aarecovery_nearby_members'
};

// Initialize empty tables if they don't exist
const initializeTables = () => {
  Object.values(TABLES).forEach(tableKey => {
    if (!localStorage.getItem(tableKey)) {
      localStorage.setItem(tableKey, JSON.stringify([]));
    }
  });
  
  console.log('Web localStorage tables initialized');
};

// Helper to get all items from a table
const getTableData = (tableKey) => {
  try {
    return JSON.parse(localStorage.getItem(tableKey)) || [];
  } catch (error) {
    console.error(`Error reading from ${tableKey}:`, error);
    return [];
  }
};

// Helper to save data to a table
const saveTableData = (tableKey, data) => {
  try {
    localStorage.setItem(tableKey, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`Error writing to ${tableKey}:`, error);
    return false;
  }
};

/**
 * Initialize the database
 * @returns {Promise<Object>} - Database object
 */
export const initDatabase = async () => {
  console.log('Initializing web localStorage database...');
  
  try {
    // Initialize tables
    initializeTables();
    
    console.log('Web database initialized successfully');
    return { isInitialized: true };
  } catch (error) {
    console.error('Error initializing web database:', error);
    throw error;
  }
};

/**
 * Close the database connection (no-op for web)
 */
export const closeDatabase = async () => {
  console.log('Web database connection closed (no-op)');
};

/**
 * Execute a SQL-like query (simplified for localStorage)
 * This is a stub that provides minimal compatibility with the SQLite version
 * Only supports very basic operations
 */
export const executeSql = async (query, params = []) => {
  console.log('Web executeSql called:', query, params);
  
  // Parse the query to determine operation and table
  const queryLower = query.toLowerCase();
  
  // Very basic query parsing
  if (queryLower.includes('create table')) {
    // Create table is handled by initialization
    return { rows: { length: 0 } };
  } else if (queryLower.includes('select') && queryLower.includes('from')) {
    // Basic SELECT query
    const tableMatch = query.match(/from\s+(\w+)/i);
    if (!tableMatch) {
      throw new Error('Invalid SELECT query: table not specified');
    }
    
    const tableName = tableMatch[1].toLowerCase();
    const tableKey = Object.values(TABLES).find(key => 
      key.toLowerCase().includes(tableName)
    );
    
    if (!tableKey) {
      throw new Error(`Unknown table: ${tableName}`);
    }
    
    const data = getTableData(tableKey);
    
    // Handle WHERE clause (very basic implementation)
    let filteredData = data;
    if (queryLower.includes('where')) {
      const whereCondition = query.match(/where\s+(.*?)(?:order by|limit|$)/i);
      if (whereCondition && whereCondition[1]) {
        const condition = whereCondition[1].trim();
        
        // Handle id = ? condition
        if (condition.includes('id = ?') && params.length > 0) {
          const idValue = params[0];
          filteredData = data.filter(item => item.id === idValue);
        } 
        // Handle user_id = ? condition
        else if (condition.includes('user_id = ?') && params.length > 0) {
          const userIdValue = params[0];
          filteredData = data.filter(item => item.user_id === userIdValue);
        }
      }
    }
    
    // Handle ORDER BY (very basic implementation)
    if (queryLower.includes('order by')) {
      const orderMatch = query.match(/order by\s+(.*?)(?:limit|$)/i);
      if (orderMatch && orderMatch[1]) {
        const orderParts = orderMatch[1].trim().split(/\s+/);
        const orderField = orderParts[0];
        const orderDesc = orderParts.length > 1 && orderParts[1].toLowerCase() === 'desc';
        
        filteredData.sort((a, b) => {
          if (orderDesc) {
            return a[orderField] > b[orderField] ? -1 : 1;
          }
          return a[orderField] > b[orderField] ? 1 : -1;
        });
      }
    }
    
    // Handle LIMIT
    if (queryLower.includes('limit') && params.length > 0) {
      const limitMatch = query.match(/limit\s+\?/i);
      if (limitMatch) {
        const limitValue = parseInt(params[params.length - 1], 10);
        if (!isNaN(limitValue)) {
          filteredData = filteredData.slice(0, limitValue);
        }
      }
    }
    
    // Create a rows object that mimics SQLite results
    const rows = {
      length: filteredData.length,
      item: (index) => filteredData[index],
      _array: filteredData
    };
    
    return { rows };
  } else if (queryLower.includes('insert into')) {
    // Handle INSERT operation
    const tableMatch = query.match(/insert into\s+(\w+)/i);
    if (!tableMatch) {
      throw new Error('Invalid INSERT query: table not specified');
    }
    
    const tableName = tableMatch[1].toLowerCase();
    const tableKey = Object.values(TABLES).find(key => 
      key.toLowerCase().includes(tableName)
    );
    
    if (!tableKey) {
      throw new Error(`Unknown table: ${tableName}`);
    }
    
    // Extract column names from query
    const columnsMatch = query.match(/\(([^)]+)\)/);
    if (!columnsMatch) {
      throw new Error('Invalid INSERT query: columns not specified');
    }
    
    const columns = columnsMatch[1].split(',').map(col => col.trim());
    
    // Create new object from columns and params
    const newObject = {};
    columns.forEach((col, index) => {
      newObject[col] = params[index];
    });
    
    // Add to table
    const tableData = getTableData(tableKey);
    tableData.push(newObject);
    saveTableData(tableKey, tableData);
    
    return { insertId: newObject.id };
  } else if (queryLower.includes('update')) {
    // Handle UPDATE operation
    const tableMatch = query.match(/update\s+(\w+)/i);
    if (!tableMatch) {
      throw new Error('Invalid UPDATE query: table not specified');
    }
    
    const tableName = tableMatch[1].toLowerCase();
    const tableKey = Object.values(TABLES).find(key => 
      key.toLowerCase().includes(tableName)
    );
    
    if (!tableKey) {
      throw new Error(`Unknown table: ${tableName}`);
    }
    
    // Get table data
    const tableData = getTableData(tableKey);
    
    // Extract SET clause and parse field updates
    const setMatch = query.match(/set\s+(.*?)\s+where/i);
    if (!setMatch) {
      throw new Error('Invalid UPDATE query: SET clause not found');
    }
    
    const setClauses = setMatch[1].split(',').map(clause => clause.trim());
    const updateFields = setClauses.map(clause => clause.split('=')[0].trim());
    
    // Find the object to update
    let rowsAffected = 0;
    const idValue = params[params.length - 1]; // ID is the last parameter
    
    const updatedData = tableData.map(item => {
      if (item.id === idValue) {
        const updatedItem = { ...item };
        
        // Apply updates
        updateFields.forEach((field, index) => {
          updatedItem[field] = params[index];
        });
        
        rowsAffected++;
        return updatedItem;
      }
      return item;
    });
    
    saveTableData(tableKey, updatedData);
    
    return { rowsAffected };
  } else if (queryLower.includes('delete')) {
    // Handle DELETE operation
    const tableMatch = query.match(/delete from\s+(\w+)/i);
    if (!tableMatch) {
      throw new Error('Invalid DELETE query: table not specified');
    }
    
    const tableName = tableMatch[1].toLowerCase();
    const tableKey = Object.values(TABLES).find(key => 
      key.toLowerCase().includes(tableName)
    );
    
    if (!tableKey) {
      throw new Error(`Unknown table: ${tableName}`);
    }
    
    // Get table data
    const tableData = getTableData(tableKey);
    
    // Find items to delete
    const idValue = params[0];
    const filteredData = tableData.filter(item => item.id !== idValue);
    
    const rowsAffected = tableData.length - filteredData.length;
    saveTableData(tableKey, filteredData);
    
    return { rowsAffected };
  }
  
  throw new Error(`Unsupported query in web database: ${query}`);
};

/**
 * Get all rows from a table
 * @param {string} table - Table name
 * @returns {Promise<Array>} - Array of rows
 */
export const getAll = async (table) => {
  try {
    const tableKey = Object.values(TABLES).find(key => 
      key.toLowerCase().includes(table.toLowerCase())
    );
    
    if (!tableKey) {
      throw new Error(`Unknown table: ${table}`);
    }
    
    return getTableData(tableKey);
  } catch (error) {
    console.error(`Error getting all rows from ${table}:`, error);
    throw error;
  }
};

/**
 * Get a row by ID
 * @param {string} table - Table name
 * @param {string} id - Row ID
 * @returns {Promise<Object|null>} - Row object or null if not found
 */
export const getById = async (table, id) => {
  try {
    const tableKey = Object.values(TABLES).find(key => 
      key.toLowerCase().includes(table.toLowerCase())
    );
    
    if (!tableKey) {
      throw new Error(`Unknown table: ${table}`);
    }
    
    const tableData = getTableData(tableKey);
    return tableData.find(item => item.id === id) || null;
  } catch (error) {
    console.error(`Error getting row by id from ${table}:`, error);
    throw error;
  }
};

/**
 * Insert a row into a table
 * @param {string} table - Table name
 * @param {Object} data - Data to insert
 * @returns {Promise<string>} - Row ID of the inserted row
 */
export const insert = async (table, data) => {
  try {
    const tableKey = Object.values(TABLES).find(key => 
      key.toLowerCase().includes(table.toLowerCase())
    );
    
    if (!tableKey) {
      throw new Error(`Unknown table: ${table}`);
    }
    
    const tableData = getTableData(tableKey);
    tableData.push(data);
    saveTableData(tableKey, tableData);
    
    return data.id;
  } catch (error) {
    console.error(`Error inserting into ${table}:`, error);
    throw error;
  }
};

/**
 * Update a row in a table
 * @param {string} table - Table name
 * @param {string} id - Row ID
 * @param {Object} data - Data to update
 * @returns {Promise<number>} - Number of rows affected
 */
export const update = async (table, id, data) => {
  try {
    const tableKey = Object.values(TABLES).find(key => 
      key.toLowerCase().includes(table.toLowerCase())
    );
    
    if (!tableKey) {
      throw new Error(`Unknown table: ${table}`);
    }
    
    const tableData = getTableData(tableKey);
    let rowsAffected = 0;
    
    const updatedData = tableData.map(item => {
      if (item.id === id) {
        rowsAffected++;
        return { ...item, ...data };
      }
      return item;
    });
    
    saveTableData(tableKey, updatedData);
    return rowsAffected;
  } catch (error) {
    console.error(`Error updating ${table}:`, error);
    throw error;
  }
};

/**
 * Delete a row from a table
 * @param {string} table - Table name
 * @param {string} id - Row ID
 * @returns {Promise<number>} - Number of rows affected
 */
export const deleteById = async (table, id) => {
  try {
    const tableKey = Object.values(TABLES).find(key => 
      key.toLowerCase().includes(table.toLowerCase())
    );
    
    if (!tableKey) {
      throw new Error(`Unknown table: ${table}`);
    }
    
    const tableData = getTableData(tableKey);
    const filteredData = tableData.filter(item => item.id !== id);
    
    const rowsAffected = tableData.length - filteredData.length;
    saveTableData(tableKey, filteredData);
    
    return rowsAffected;
  } catch (error) {
    console.error(`Error deleting from ${table}:`, error);
    throw error;
  }
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
  
  if (dist > 1) {
    dist = 1;
  }
  
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

// Add all the operation objects from the native version
// These should match the native SQLite version's API

// User operations
export const userOperations = {
  createUser: async (userData) => {
    const now = new Date().toISOString();
    const userId = userData.id || `user_${Date.now()}`;
    
    const data = {
      id: userId,
      name: userData.name || '',
      sobriety_date: userData.sobrietyDate || null,
      home_group: userData.homeGroup || '',
      phone: userData.phone || '',
      email: userData.email || '',
      sponsor_id: userData.sponsorId || null,
      privacy_settings: JSON.stringify(userData.privacySettings || {}),
      created_at: now,
      updated_at: now
    };
    
    await insert('users', data);
    return userId;
  },
  
  getUserById: async (userId) => {
    const user = await getById('users', userId);
    
    if (user) {
      // Convert privacy_settings from JSON string to object
      user.privacySettings = user.privacy_settings ? JSON.parse(user.privacy_settings) : {};
      return user;
    }
    
    return null;
  },
  
  updateUser: async (userId, userData) => {
    const updates = {
      updated_at: new Date().toISOString()
    };
    
    if (userData.name) updates.name = userData.name;
    if (userData.sobrietyDate) updates.sobriety_date = userData.sobrietyDate;
    if (userData.homeGroup) updates.home_group = userData.homeGroup;
    if (userData.phone) updates.phone = userData.phone;
    if (userData.email) updates.email = userData.email;
    if (userData.sponsorId !== undefined) updates.sponsor_id = userData.sponsorId;
    if (userData.privacySettings) {
      updates.privacy_settings = JSON.stringify(userData.privacySettings);
    }
    
    return await update('users', userId, updates);
  }
};

// Activity operations
export const activityOperations = {
  createActivity: async (activityData) => {
    const now = new Date().toISOString();
    const activityId = activityData.id || `activity_${Date.now()}`;
    
    const data = {
      id: activityId,
      user_id: activityData.userId,
      type: activityData.type,
      date: activityData.date || now,
      duration: activityData.duration || 0,
      notes: activityData.notes || '',
      created_at: now
    };
    
    await insert('activities', data);
    return activityId;
  },
  
  getUserActivities: async (userId) => {
    try {
      const results = await executeSql(
        'SELECT * FROM activities WHERE user_id = ? ORDER BY date DESC',
        [userId]
      );
      
      return results.rows._array || [];
    } catch (error) {
      console.error('Error getting user activities:', error);
      throw error;
    }
  },
  
  getRecentActivities: async (userId, limit = 10) => {
    try {
      const results = await executeSql(
        'SELECT * FROM activities WHERE user_id = ? ORDER BY date DESC LIMIT ?',
        [userId, limit]
      );
      
      return results.rows._array || [];
    } catch (error) {
      console.error('Error getting recent activities:', error);
      throw error;
    }
  },
  
  deleteActivity: async (activityId) => {
    return await deleteById('activities', activityId);
  }
};

// Spiritual fitness operations
export const spiritualFitnessOperations = {
  calculateSpiritualFitness: async (userId) => {
    try {
      // Get user activities for the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const results = await executeSql(
        'SELECT * FROM activities WHERE user_id = ? AND date >= ? ORDER BY date DESC',
        [userId, thirtyDaysAgo.toISOString()]
      );
      
      const activities = results.rows._array || [];
      
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
      
      const data = {
        id: fitnessId,
        user_id: userId,
        score: finalScore,
        prayer_score: scores.prayer,
        meditation_score: scores.meditation,
        reading_score: scores.reading,
        meeting_score: scores.meeting,
        service_score: scores.service,
        calculated_at: now
      };
      
      await insert('spiritual_fitness', data);
      
      return {
        score: finalScore,
        details: scores,
        calculatedAt: now
      };
    } catch (error) {
      console.error('Error calculating spiritual fitness:', error);
      throw error;
    }
  }
};

// Meeting operations
export const meetingOperations = {
  createMeeting: async (meetingData) => {
    const now = new Date().toISOString();
    const meetingId = meetingData.id || `meeting_${Date.now()}`;
    
    const data = {
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
      shared: meetingData.shared === true ? 1 : 0,
      created_by: meetingData.createdBy || null,
      created_at: now,
      updated_at: now
    };
    
    await insert('meetings', data);
    return meetingId;
  },
  
  getSharedMeetings: async () => {
    try {
      const results = await executeSql(
        'SELECT * FROM meetings WHERE shared = ? ORDER BY day, time',
        [1]
      );
      
      return results.rows._array || [];
    } catch (error) {
      console.error('Error getting shared meetings:', error);
      throw error;
    }
  },
  
  getUserMeetings: async (userId) => {
    try {
      const results = await executeSql(
        'SELECT * FROM meetings WHERE created_by = ? ORDER BY day, time',
        [userId]
      );
      
      return results.rows._array || [];
    } catch (error) {
      console.error('Error getting user meetings:', error);
      throw error;
    }
  }
};

// Reminder operations
export const reminderOperations = {
  createReminder: async (reminderData) => {
    const now = new Date().toISOString();
    const reminderId = reminderData.id || `reminder_${Date.now()}`;
    
    const data = {
      id: reminderId,
      meeting_id: reminderData.meetingId,
      user_id: reminderData.userId,
      reminder_time: reminderData.reminderTime || 30,
      notification_id: reminderData.notificationId || null,
      calendar_event_id: reminderData.calendarEventId || null,
      created_at: now
    };
    
    await insert('meeting_reminders', data);
    return reminderId;
  },
  
  getUserReminders: async (userId) => {
    try {
      const results = await executeSql(
        'SELECT r.*, m.name, m.day, m.time, m.location ' +
        'FROM meeting_reminders r ' +
        'JOIN meetings m ON r.meeting_id = m.id ' +
        'WHERE r.user_id = ? ' +
        'ORDER BY m.day, m.time',
        [userId]
      );
      
      return results.rows._array || [];
    } catch (error) {
      console.error('Error getting user reminders:', error);
      throw error;
    }
  }
};

// Nearby members operations
export const nearbyMembersOperations = {
  saveMemberDiscovery: async (discoveryData) => {
    const now = new Date().toISOString();
    const discoveryId = discoveryData.id || `discovery_${Date.now()}`;
    
    const data = {
      id: discoveryId,
      user_id: discoveryData.userId,
      discovered_user_id: discoveryData.discoveredUserId,
      discovery_type: discoveryData.discoveryType || 'bluetooth',
      distance: discoveryData.distance || 0,
      last_seen: now
    };
    
    await insert('nearby_members', data);
    return discoveryId;
  },
  
  getNearbyMembers: async (userId) => {
    try {
      const results = await executeSql(
        'SELECT d.*, u.name ' +
        'FROM nearby_members d ' +
        'JOIN users u ON d.discovered_user_id = u.id ' +
        'WHERE d.user_id = ? ' +
        'ORDER BY d.last_seen DESC',
        [userId]
      );
      
      return results.rows._array || [];
    } catch (error) {
      console.error('Error getting nearby members:', error);
      throw error;
    }
  }
};

// Export everything
export default {
  initDatabase,
  closeDatabase,
  executeSql,
  getAll,
  getById,
  insert,
  update,
  deleteById,
  calculateDistance,
  calculateSobrietyDays,
  calculateSobrietyYears,
  userOperations,
  activityOperations,
  spiritualFitnessOperations,
  meetingOperations,
  reminderOperations,
  nearbyMembersOperations
};