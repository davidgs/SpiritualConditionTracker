/**
 * Database utility functions for SQLite operations
 */
import SQLite from 'react-native-sqlite-storage';

// Enable debugging in development
SQLite.DEBUG(true);
// Use the new native promise API
SQLite.enablePromise(true);

// Define database schema
const DB_NAME = 'aarecovery.db';
const DB_VERSION = '1.0';
const DB_DISPLAY_NAME = 'AA Recovery Database';
const DB_SIZE = 200000; // ~200MB

let database = null;

/**
 * Initialize the database
 * @returns {Promise<SQLite.SQLiteDatabase>}
 */
export const initDatabase = async () => {
  if (database) {
    console.log("Database already initialized");
    return database;
  }
  
  try {
    console.log("Opening database...");
    database = await SQLite.openDatabase({
      name: DB_NAME,
      location: 'default',
      createFromLocation: 1,
      version: DB_VERSION,
      displayName: DB_DISPLAY_NAME,
      size: DB_SIZE
    });
    
    console.log("Database initialized successfully");
    
    // Initialize tables
    await createTables();
    
    return database;
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
};

/**
 * Create database tables if they don't exist
 */
const createTables = async () => {
  const db = await initDatabase();
  
  try {
    // Create users table
    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT,
        sobriety_date TEXT,
        home_group TEXT,
        phone TEXT,
        email TEXT,
        sponsor_id TEXT,
        privacy_settings TEXT,
        created_at TEXT,
        updated_at TEXT
      );
    `);
    
    // Create activities table
    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS activities (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        type TEXT,
        date TEXT,
        duration INTEGER,
        notes TEXT,
        created_at TEXT,
        FOREIGN KEY (user_id) REFERENCES users (id)
      );
    `);
    
    // Create spiritual_fitness table
    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS spiritual_fitness (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        score REAL,
        prayer_score REAL,
        meditation_score REAL,
        reading_score REAL,
        meeting_score REAL,
        service_score REAL,
        calculated_at TEXT,
        FOREIGN KEY (user_id) REFERENCES users (id)
      );
    `);
    
    // Create meetings table
    await db.executeSql(`
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
        shared BOOLEAN,
        created_by TEXT,
        created_at TEXT,
        updated_at TEXT,
        FOREIGN KEY (created_by) REFERENCES users (id)
      );
    `);
    
    // Create meeting_reminders table
    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS meeting_reminders (
        id TEXT PRIMARY KEY,
        meeting_id TEXT,
        user_id TEXT,
        reminder_time INTEGER,
        notification_id TEXT,
        calendar_event_id TEXT,
        created_at TEXT,
        FOREIGN KEY (meeting_id) REFERENCES meetings (id),
        FOREIGN KEY (user_id) REFERENCES users (id)
      );
    `);
    
    // Create nearby_members table
    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS nearby_members (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        discovered_user_id TEXT,
        discovery_type TEXT,
        distance REAL,
        last_seen TEXT,
        FOREIGN KEY (user_id) REFERENCES users (id)
      );
    `);
    
    console.log("Database tables created successfully");
  } catch (error) {
    console.error("Error creating tables:", error);
    throw error;
  }
};

/**
 * Close the database connection
 */
export const closeDatabase = async () => {
  if (database) {
    await database.close();
    database = null;
    console.log("Database connection closed");
  }
};

/**
 * Execute a single SQL statement
 * @param {string} query - SQL query to execute
 * @param {Array} params - Parameters for the query
 * @returns {Promise<any>} - Query results
 */
export const executeSql = async (query, params = []) => {
  const db = await initDatabase();
  try {
    const [results] = await db.executeSql(query, params);
    return results;
  } catch (error) {
    console.error(`Error executing SQL: ${query}`, error);
    throw error;
  }
};

/**
 * Get all rows from a table
 * @param {string} table - Table name
 * @returns {Promise<Array>} - Array of rows
 */
export const getAll = async (table) => {
  try {
    const results = await executeSql(`SELECT * FROM ${table}`);
    let rows = [];
    for (let i = 0; i < results.rows.length; i++) {
      rows.push(results.rows.item(i));
    }
    return rows;
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
    const results = await executeSql(
      `SELECT * FROM ${table} WHERE id = ?`,
      [id]
    );
    
    if (results.rows.length > 0) {
      return results.rows.item(0);
    }
    return null;
  } catch (error) {
    console.error(`Error getting row by id from ${table}:`, error);
    throw error;
  }
};

/**
 * Insert a row into a table
 * @param {string} table - Table name
 * @param {Object} data - Data to insert
 * @returns {Promise<number>} - Row ID of the inserted row
 */
export const insert = async (table, data) => {
  const keys = Object.keys(data);
  const values = Object.values(data);
  const placeholders = keys.map(() => '?').join(', ');
  
  try {
    const results = await executeSql(
      `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`,
      values
    );
    
    return results.insertId;
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
  const keys = Object.keys(data);
  const values = Object.values(data);
  const setClause = keys.map(key => `${key} = ?`).join(', ');
  
  try {
    const results = await executeSql(
      `UPDATE ${table} SET ${setClause} WHERE id = ?`,
      [...values, id]
    );
    
    return results.rowsAffected;
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
    const results = await executeSql(
      `DELETE FROM ${table} WHERE id = ?`,
      [id]
    );
    
    return results.rowsAffected;
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

/**
 * Specialized operations for each entity type
 */

// User operations
export const userOperations = {
  /**
   * Create a new user
   * @param {Object} userData - User data
   * @returns {Promise<string>} - User ID
   */
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
  
  /**
   * Get user by ID
   * @param {string} userId - User ID
   * @returns {Promise<Object|null>} - User object or null
   */
  getUserById: async (userId) => {
    const user = await getById('users', userId);
    
    if (user) {
      // Convert privacy_settings from JSON string to object
      user.privacySettings = user.privacy_settings ? JSON.parse(user.privacy_settings) : {};
      return user;
    }
    
    return null;
  },
  
  /**
   * Update user data
   * @param {string} userId - User ID
   * @param {Object} userData - User data to update
   * @returns {Promise<number>} - Number of rows affected
   */
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
  /**
   * Create a new activity
   * @param {Object} activityData - Activity data
   * @returns {Promise<string>} - Activity ID
   */
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
  
  /**
   * Get activities for a user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} - Array of activities
   */
  getUserActivities: async (userId) => {
    try {
      const results = await executeSql(
        'SELECT * FROM activities WHERE user_id = ? ORDER BY date DESC',
        [userId]
      );
      
      let activities = [];
      for (let i = 0; i < results.rows.length; i++) {
        activities.push(results.rows.item(i));
      }
      
      return activities;
    } catch (error) {
      console.error('Error getting user activities:', error);
      throw error;
    }
  },
  
  /**
   * Get recent activities for a user
   * @param {string} userId - User ID
   * @param {number} limit - Maximum number of activities to return
   * @returns {Promise<Array>} - Array of recent activities
   */
  getRecentActivities: async (userId, limit = 10) => {
    try {
      const results = await executeSql(
        'SELECT * FROM activities WHERE user_id = ? ORDER BY date DESC LIMIT ?',
        [userId, limit]
      );
      
      let activities = [];
      for (let i = 0; i < results.rows.length; i++) {
        activities.push(results.rows.item(i));
      }
      
      return activities;
    } catch (error) {
      console.error('Error getting recent activities:', error);
      throw error;
    }
  },
  
  /**
   * Delete an activity
   * @param {string} activityId - Activity ID
   * @returns {Promise<number>} - Number of rows affected
   */
  deleteActivity: async (activityId) => {
    return await deleteById('activities', activityId);
  }
};

// Spiritual fitness operations
export const spiritualFitnessOperations = {
  /**
   * Calculate spiritual fitness for a user
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Spiritual fitness data
   */
  calculateSpiritualFitness: async (userId) => {
    try {
      // Get user activities for the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const results = await executeSql(
        'SELECT * FROM activities WHERE user_id = ? AND date >= ? ORDER BY date DESC',
        [userId, thirtyDaysAgo.toISOString()]
      );
      
      let activities = [];
      for (let i = 0; i < results.rows.length; i++) {
        activities.push(results.rows.item(i));
      }
      
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
      
      // Check if there's an existing entry to update
      const existingResults = await executeSql(
        'SELECT id FROM spiritual_fitness WHERE user_id = ? ORDER BY calculated_at DESC LIMIT 1',
        [userId]
      );
      
      if (existingResults.rows.length > 0) {
        const existingId = existingResults.rows.item(0).id;
        await update('spiritual_fitness', existingId, data);
      } else {
        await insert('spiritual_fitness', data);
      }
      
      return {
        score: finalScore,
        details: scores,
        calculatedAt: now
      };
    } catch (error) {
      console.error('Error calculating spiritual fitness:', error);
      throw error;
    }
  },
  
  /**
   * Get the latest spiritual fitness for a user
   * @param {string} userId - User ID
   * @returns {Promise<Object|null>} - Spiritual fitness data or null
   */
  getSpiritualFitness: async (userId) => {
    try {
      const results = await executeSql(
        'SELECT * FROM spiritual_fitness WHERE user_id = ? ORDER BY calculated_at DESC LIMIT 1',
        [userId]
      );
      
      if (results.rows.length > 0) {
        const data = results.rows.item(0);
        
        return {
          score: data.score,
          details: {
            prayer: data.prayer_score,
            meditation: data.meditation_score,
            reading: data.reading_score,
            meeting: data.meeting_score,
            service: data.service_score
          },
          calculatedAt: data.calculated_at
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error getting spiritual fitness:', error);
      throw error;
    }
  }
};

// Meeting operations
export const meetingOperations = {
  /**
   * Create a new meeting
   * @param {Object} meetingData - Meeting data
   * @returns {Promise<string>} - Meeting ID
   */
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
      shared: meetingData.shared ? 1 : 0,
      created_by: meetingData.createdBy,
      created_at: now,
      updated_at: now
    };
    
    await insert('meetings', data);
    return meetingId;
  },
  
  /**
   * Get all meetings by creator
   * @param {string} userId - User ID
   * @returns {Promise<Array>} - Array of meetings
   */
  getUserMeetings: async (userId) => {
    try {
      const results = await executeSql(
        'SELECT * FROM meetings WHERE created_by = ? ORDER BY day, time',
        [userId]
      );
      
      let meetings = [];
      for (let i = 0; i < results.rows.length; i++) {
        const meeting = results.rows.item(i);
        meeting.shared = Boolean(meeting.shared); // Convert to boolean
        meetings.push(meeting);
      }
      
      return meetings;
    } catch (error) {
      console.error('Error getting user meetings:', error);
      throw error;
    }
  },
  
  /**
   * Get shared meetings from all users
   * @returns {Promise<Array>} - Array of shared meetings
   */
  getSharedMeetings: async () => {
    try {
      const results = await executeSql(
        'SELECT * FROM meetings WHERE shared = 1 ORDER BY day, time',
        []
      );
      
      let meetings = [];
      for (let i = 0; i < results.rows.length; i++) {
        const meeting = results.rows.item(i);
        meeting.shared = Boolean(meeting.shared); // Convert to boolean
        meetings.push(meeting);
      }
      
      return meetings;
    } catch (error) {
      console.error('Error getting shared meetings:', error);
      throw error;
    }
  },
  
  /**
   * Update a meeting
   * @param {string} meetingId - Meeting ID
   * @param {Object} meetingData - Meeting data to update
   * @returns {Promise<number>} - Number of rows affected
   */
  updateMeeting: async (meetingId, meetingData) => {
    const updates = {
      updated_at: new Date().toISOString()
    };
    
    const fields = [
      'name', 'day', 'time', 'location', 'address', 'city', 
      'state', 'zip', 'type', 'notes'
    ];
    
    fields.forEach(field => {
      if (meetingData[field] !== undefined) {
        updates[field] = meetingData[field];
      }
    });
    
    if (meetingData.shared !== undefined) {
      updates.shared = meetingData.shared ? 1 : 0;
    }
    
    return await update('meetings', meetingId, updates);
  },
  
  /**
   * Delete a meeting
   * @param {string} meetingId - Meeting ID
   * @returns {Promise<number>} - Number of rows affected
   */
  deleteMeeting: async (meetingId) => {
    // First delete any reminders for this meeting
    await executeSql(
      'DELETE FROM meeting_reminders WHERE meeting_id = ?',
      [meetingId]
    );
    
    // Then delete the meeting
    return await deleteById('meetings', meetingId);
  }
};

// Meeting reminder operations
export const reminderOperations = {
  /**
   * Create a meeting reminder
   * @param {Object} reminderData - Reminder data
   * @returns {Promise<string>} - Reminder ID
   */
  createReminder: async (reminderData) => {
    const now = new Date().toISOString();
    const reminderId = reminderData.id || `reminder_${Date.now()}`;
    
    const data = {
      id: reminderId,
      meeting_id: reminderData.meetingId,
      user_id: reminderData.userId,
      reminder_time: reminderData.reminderTime || 15, // Default 15 minutes
      notification_id: reminderData.notificationId || null,
      calendar_event_id: reminderData.calendarEventId || null,
      created_at: now
    };
    
    await insert('meeting_reminders', data);
    return reminderId;
  },
  
  /**
   * Get reminders for a user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} - Array of reminders with meeting data
   */
  getUserReminders: async (userId) => {
    try {
      const results = await executeSql(
        `SELECT r.*, m.name as meeting_name, m.day, m.time, m.location
         FROM meeting_reminders r
         JOIN meetings m ON r.meeting_id = m.id
         WHERE r.user_id = ?
         ORDER BY m.day, m.time`,
        [userId]
      );
      
      let reminders = [];
      for (let i = 0; i < results.rows.length; i++) {
        reminders.push(results.rows.item(i));
      }
      
      return reminders;
    } catch (error) {
      console.error('Error getting user reminders:', error);
      throw error;
    }
  },
  
  /**
   * Update a reminder
   * @param {string} reminderId - Reminder ID
   * @param {Object} reminderData - Reminder data to update
   * @returns {Promise<number>} - Number of rows affected
   */
  updateReminder: async (reminderId, reminderData) => {
    const updates = {};
    
    if (reminderData.reminderTime !== undefined) {
      updates.reminder_time = reminderData.reminderTime;
    }
    if (reminderData.notificationId !== undefined) {
      updates.notification_id = reminderData.notificationId;
    }
    if (reminderData.calendarEventId !== undefined) {
      updates.calendar_event_id = reminderData.calendarEventId;
    }
    
    return await update('meeting_reminders', reminderId, updates);
  },
  
  /**
   * Delete a reminder
   * @param {string} reminderId - Reminder ID
   * @returns {Promise<number>} - Number of rows affected
   */
  deleteReminder: async (reminderId) => {
    return await deleteById('meeting_reminders', reminderId);
  }
};

// Nearby members operations
export const nearbyMembersOperations = {
  /**
   * Record a nearby member discovery
   * @param {Object} discoveryData - Discovery data
   * @returns {Promise<string>} - Discovery ID
   */
  recordDiscovery: async (discoveryData) => {
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
    
    // Check if we've seen this user before
    const results = await executeSql(
      'SELECT id FROM nearby_members WHERE user_id = ? AND discovered_user_id = ?',
      [discoveryData.userId, discoveryData.discoveredUserId]
    );
    
    if (results.rows.length > 0) {
      // Update existing record
      const existingId = results.rows.item(0).id;
      await update('nearby_members', existingId, {
        discovery_type: data.discovery_type,
        distance: data.distance,
        last_seen: data.last_seen
      });
      return existingId;
    } else {
      // Insert new record
      await insert('nearby_members', data);
      return discoveryId;
    }
  },
  
  /**
   * Get recently discovered nearby members
   * @param {string} userId - User ID
   * @param {number} days - How many days back to look
   * @returns {Promise<Array>} - Array of nearby members
   */
  getRecentNearbyMembers: async (userId, days = 7) => {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      const results = await executeSql(
        `SELECT n.*, u.name, u.sobriety_date
         FROM nearby_members n
         JOIN users u ON n.discovered_user_id = u.id
         WHERE n.user_id = ? AND n.last_seen >= ?
         ORDER BY n.last_seen DESC`,
        [userId, cutoffDate.toISOString()]
      );
      
      let nearbyMembers = [];
      for (let i = 0; i < results.rows.length; i++) {
        nearbyMembers.push(results.rows.item(i));
      }
      
      return nearbyMembers;
    } catch (error) {
      console.error('Error getting nearby members:', error);
      throw error;
    }
  }
};

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