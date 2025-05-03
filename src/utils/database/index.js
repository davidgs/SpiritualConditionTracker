/**
 * Database Service
 * Manages all interactions with the SQLite database
 */

import SQLite from 'react-native-sqlite-storage';

// Enable SQLite Promises
SQLite.enablePromise(true);

// Database connection instance
let database = null;

/**
 * Initialize the database connection
 * @returns {Promise<SQLite.SQLiteDatabase>} Database instance
 */
export const initDatabase = async () => {
  if (database) {
    console.log('Database is already initialized');
    return database;
  }

  try {
    database = await SQLite.openDatabase({
      name: 'aarecovery.db',
      location: 'default',
    });
    
    console.log('Database initialized successfully');
    
    // Create tables if they don't exist
    await createTables();
    
    return database;
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

/**
 * Create database tables if they don't exist
 */
const createTables = async () => {
  try {
    // Create users table
    await database.executeSql(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT,
        email TEXT,
        phone TEXT,
        sobrietyDate TEXT,
        homeGroup TEXT,
        profileSettings TEXT,
        createdAt TEXT,
        updatedAt TEXT
      );
    `);
    
    // Create activities table
    await database.executeSql(`
      CREATE TABLE IF NOT EXISTS activities (
        id TEXT PRIMARY KEY,
        userId TEXT,
        type TEXT,
        date TEXT,
        duration INTEGER,
        notes TEXT,
        createdAt TEXT,
        FOREIGN KEY (userId) REFERENCES users (id)
      );
    `);
    
    // Create meetings table
    await database.executeSql(`
      CREATE TABLE IF NOT EXISTS meetings (
        id TEXT PRIMARY KEY,
        name TEXT,
        location TEXT,
        address TEXT,
        latitude REAL,
        longitude REAL,
        day TEXT,
        time TEXT,
        type TEXT,
        notes TEXT,
        isShared INTEGER,
        createdBy TEXT,
        createdAt TEXT,
        updatedAt TEXT
      );
    `);
    
    // Create meeting attendance table
    await database.executeSql(`
      CREATE TABLE IF NOT EXISTS meetingAttendance (
        id TEXT PRIMARY KEY,
        userId TEXT,
        meetingId TEXT,
        date TEXT,
        notes TEXT,
        FOREIGN KEY (userId) REFERENCES users (id),
        FOREIGN KEY (meetingId) REFERENCES meetings (id)
      );
    `);
    
    // Create spiritual fitness table
    await database.executeSql(`
      CREATE TABLE IF NOT EXISTS spiritualFitness (
        id TEXT PRIMARY KEY,
        userId TEXT,
        date TEXT,
        score REAL,
        breakdown TEXT,
        FOREIGN KEY (userId) REFERENCES users (id)
      );
    `);
    
    // Create calendar reminders table
    await database.executeSql(`
      CREATE TABLE IF NOT EXISTS calendarReminders (
        id TEXT PRIMARY KEY,
        meetingId TEXT,
        calendarEventId TEXT,
        reminderTime INTEGER,
        isActive INTEGER,
        FOREIGN KEY (meetingId) REFERENCES meetings (id)
      );
    `);
    
    // Create discovered members table
    await database.executeSql(`
      CREATE TABLE IF NOT EXISTS discoveredMembers (
        id TEXT PRIMARY KEY,
        deviceId TEXT,
        name TEXT,
        discoveryMethod TEXT,
        firstDiscovered TEXT,
        lastSeen TEXT,
        meetCount INTEGER
      );
    `);
    
    console.log('Database tables created successfully');
  } catch (error) {
    console.error('Error creating database tables:', error);
    throw error;
  }
};

/**
 * Generate a unique ID
 * @returns {string} A unique ID
 */
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
};

/**
 * User operations
 */
export const userOperations = {
  /**
   * Get user by ID
   * @param {string} id - The user ID
   * @returns {Promise<Object|null>} User object or null if not found
   */
  getById: async (id) => {
    try {
      const [results] = await database.executeSql(
        'SELECT * FROM users WHERE id = ?',
        [id]
      );
      
      if (results.rows.length === 0) {
        return null;
      }
      
      return results.rows.item(0);
    } catch (error) {
      console.error('Error getting user by ID:', error);
      throw error;
    }
  },
  
  /**
   * Create a new user
   * @param {Object} user - User object
   * @returns {Promise<Object>} Created user
   */
  create: async (user) => {
    try {
      const now = new Date().toISOString();
      const userId = user.id || generateId();
      
      const newUser = {
        id: userId,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        sobrietyDate: user.sobrietyDate || null,
        homeGroup: user.homeGroup || '',
        profileSettings: JSON.stringify(user.profileSettings || {}),
        createdAt: now,
        updatedAt: now
      };
      
      await database.executeSql(
        `INSERT INTO users (
          id, name, email, phone, sobrietyDate, homeGroup, profileSettings, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          newUser.id, newUser.name, newUser.email, newUser.phone, 
          newUser.sobrietyDate, newUser.homeGroup, newUser.profileSettings,
          newUser.createdAt, newUser.updatedAt
        ]
      );
      
      return newUser;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },
  
  /**
   * Update a user
   * @param {string} id - The user ID
   * @param {Object} updates - User updates
   * @returns {Promise<Object|null>} Updated user or null if not found
   */
  update: async (id, updates) => {
    try {
      // Check if user exists
      const user = await userOperations.getById(id);
      if (!user) {
        return null;
      }
      
      const now = new Date().toISOString();
      
      // Handle profile settings
      let profileSettings = updates.profileSettings;
      if (profileSettings && typeof profileSettings === 'object') {
        profileSettings = JSON.stringify(profileSettings);
      } else if (profileSettings === undefined) {
        profileSettings = user.profileSettings;
      }
      
      // Build SET clause and parameters
      const fields = ['name', 'email', 'phone', 'sobrietyDate', 'homeGroup'];
      let setClauses = [];
      let params = [];
      
      fields.forEach(field => {
        if (updates[field] !== undefined) {
          setClauses.push(`${field} = ?`);
          params.push(updates[field]);
        }
      });
      
      // Add profile settings and updatedAt
      setClauses.push('profileSettings = ?');
      setClauses.push('updatedAt = ?');
      params.push(profileSettings);
      params.push(now);
      
      // Add ID at the end
      params.push(id);
      
      // Execute update
      await database.executeSql(
        `UPDATE users SET ${setClauses.join(', ')} WHERE id = ?`,
        params
      );
      
      // Return updated user
      return await userOperations.getById(id);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },
  
  /**
   * Delete a user
   * @param {string} id - User ID
   * @returns {Promise<boolean>} Whether deletion was successful
   */
  delete: async (id) => {
    try {
      await database.executeSql('DELETE FROM users WHERE id = ?', [id]);
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }
};

/**
 * Activity operations
 */
export const activityOperations = {
  /**
   * Get all activities
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Activities array
   */
  getAll: async (options = {}) => {
    try {
      let query = 'SELECT * FROM activities';
      let params = [];
      
      // Filter by user ID if provided
      if (options.userId) {
        query += ' WHERE userId = ?';
        params.push(options.userId);
      }
      
      // Add order by
      query += ' ORDER BY date DESC';
      
      // Add limit if provided
      if (options.limit) {
        query += ' LIMIT ?';
        params.push(options.limit);
      }
      
      const [results] = await database.executeSql(query, params);
      
      const activities = [];
      for (let i = 0; i < results.rows.length; i++) {
        activities.push(results.rows.item(i));
      }
      
      return activities;
    } catch (error) {
      console.error('Error getting all activities:', error);
      throw error;
    }
  },
  
  /**
   * Get activity by ID
   * @param {string} id - Activity ID
   * @returns {Promise<Object|null>} Activity object or null if not found
   */
  getById: async (id) => {
    try {
      const [results] = await database.executeSql(
        'SELECT * FROM activities WHERE id = ?',
        [id]
      );
      
      if (results.rows.length === 0) {
        return null;
      }
      
      return results.rows.item(0);
    } catch (error) {
      console.error('Error getting activity by ID:', error);
      throw error;
    }
  },
  
  /**
   * Create a new activity
   * @param {Object} activity - Activity object
   * @returns {Promise<Object>} Created activity
   */
  create: async (activity) => {
    try {
      const now = new Date().toISOString();
      const activityId = activity.id || generateId();
      
      const newActivity = {
        id: activityId,
        userId: activity.userId,
        type: activity.type,
        date: activity.date || now,
        duration: activity.duration || 0,
        notes: activity.notes || '',
        createdAt: now
      };
      
      await database.executeSql(
        `INSERT INTO activities (
          id, userId, type, date, duration, notes, createdAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          newActivity.id, newActivity.userId, newActivity.type, 
          newActivity.date, newActivity.duration, newActivity.notes,
          newActivity.createdAt
        ]
      );
      
      return newActivity;
    } catch (error) {
      console.error('Error creating activity:', error);
      throw error;
    }
  },
  
  /**
   * Update an activity
   * @param {string} id - Activity ID
   * @param {Object} updates - Activity updates
   * @returns {Promise<Object|null>} Updated activity or null if not found
   */
  update: async (id, updates) => {
    try {
      // Check if activity exists
      const activity = await activityOperations.getById(id);
      if (!activity) {
        return null;
      }
      
      // Build SET clause and parameters
      const fields = ['type', 'date', 'duration', 'notes'];
      let setClauses = [];
      let params = [];
      
      fields.forEach(field => {
        if (updates[field] !== undefined) {
          setClauses.push(`${field} = ?`);
          params.push(updates[field]);
        }
      });
      
      // Add ID at the end
      params.push(id);
      
      // Execute update
      await database.executeSql(
        `UPDATE activities SET ${setClauses.join(', ')} WHERE id = ?`,
        params
      );
      
      // Return updated activity
      return await activityOperations.getById(id);
    } catch (error) {
      console.error('Error updating activity:', error);
      throw error;
    }
  },
  
  /**
   * Delete an activity
   * @param {string} id - Activity ID
   * @returns {Promise<boolean>} Whether deletion was successful
   */
  delete: async (id) => {
    try {
      await database.executeSql('DELETE FROM activities WHERE id = ?', [id]);
      return true;
    } catch (error) {
      console.error('Error deleting activity:', error);
      throw error;
    }
  }
};

/**
 * Meeting operations
 */
export const meetingOperations = {
  /**
   * Get all meetings
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Meetings array
   */
  getAll: async (options = {}) => {
    try {
      let query = 'SELECT * FROM meetings';
      let params = [];
      
      // Filter by creator ID if provided
      if (options.createdBy) {
        query += ' WHERE createdBy = ?';
        params.push(options.createdBy);
      }
      
      // Filter by day if provided
      if (options.day) {
        query += params.length ? ' AND' : ' WHERE';
        query += ' day = ?';
        params.push(options.day);
      }
      
      // Filter by type if provided
      if (options.type) {
        query += params.length ? ' AND' : ' WHERE';
        query += ' type = ?';
        params.push(options.type);
      }
      
      // Add order by
      query += ' ORDER BY day ASC, time ASC';
      
      const [results] = await database.executeSql(query, params);
      
      const meetings = [];
      for (let i = 0; i < results.rows.length; i++) {
        meetings.push(results.rows.item(i));
      }
      
      return meetings;
    } catch (error) {
      console.error('Error getting all meetings:', error);
      throw error;
    }
  },
  
  /**
   * Get meeting by ID
   * @param {string} id - Meeting ID
   * @returns {Promise<Object|null>} Meeting object or null if not found
   */
  getById: async (id) => {
    try {
      const [results] = await database.executeSql(
        'SELECT * FROM meetings WHERE id = ?',
        [id]
      );
      
      if (results.rows.length === 0) {
        return null;
      }
      
      return results.rows.item(0);
    } catch (error) {
      console.error('Error getting meeting by ID:', error);
      throw error;
    }
  },
  
  /**
   * Create a new meeting
   * @param {Object} meeting - Meeting object
   * @returns {Promise<Object>} Created meeting
   */
  create: async (meeting) => {
    try {
      const now = new Date().toISOString();
      const meetingId = meeting.id || generateId();
      
      const newMeeting = {
        id: meetingId,
        name: meeting.name || '',
        location: meeting.location || '',
        address: meeting.address || '',
        latitude: meeting.latitude || 0,
        longitude: meeting.longitude || 0,
        day: meeting.day || '',
        time: meeting.time || '',
        type: meeting.type || '',
        notes: meeting.notes || '',
        isShared: meeting.isShared ? 1 : 0,
        createdBy: meeting.createdBy || '',
        createdAt: now,
        updatedAt: now
      };
      
      await database.executeSql(
        `INSERT INTO meetings (
          id, name, location, address, latitude, longitude, day, time, type,
          notes, isShared, createdBy, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          newMeeting.id, newMeeting.name, newMeeting.location, newMeeting.address,
          newMeeting.latitude, newMeeting.longitude, newMeeting.day, newMeeting.time, 
          newMeeting.type, newMeeting.notes, newMeeting.isShared, newMeeting.createdBy,
          newMeeting.createdAt, newMeeting.updatedAt
        ]
      );
      
      return newMeeting;
    } catch (error) {
      console.error('Error creating meeting:', error);
      throw error;
    }
  },
  
  /**
   * Update a meeting
   * @param {string} id - Meeting ID
   * @param {Object} updates - Meeting updates
   * @returns {Promise<Object|null>} Updated meeting or null if not found
   */
  update: async (id, updates) => {
    try {
      // Check if meeting exists
      const meeting = await meetingOperations.getById(id);
      if (!meeting) {
        return null;
      }
      
      const now = new Date().toISOString();
      
      // Build SET clause and parameters
      const fields = [
        'name', 'location', 'address', 'latitude', 'longitude', 
        'day', 'time', 'type', 'notes'
      ];
      let setClauses = [];
      let params = [];
      
      fields.forEach(field => {
        if (updates[field] !== undefined) {
          setClauses.push(`${field} = ?`);
          params.push(updates[field]);
        }
      });
      
      // Handle isShared separately (it's a boolean converted to integer)
      if (updates.isShared !== undefined) {
        setClauses.push('isShared = ?');
        params.push(updates.isShared ? 1 : 0);
      }
      
      // Add updatedAt
      setClauses.push('updatedAt = ?');
      params.push(now);
      
      // Add ID at the end
      params.push(id);
      
      // Execute update
      await database.executeSql(
        `UPDATE meetings SET ${setClauses.join(', ')} WHERE id = ?`,
        params
      );
      
      // Return updated meeting
      return await meetingOperations.getById(id);
    } catch (error) {
      console.error('Error updating meeting:', error);
      throw error;
    }
  },
  
  /**
   * Delete a meeting
   * @param {string} id - Meeting ID
   * @returns {Promise<boolean>} Whether deletion was successful
   */
  delete: async (id) => {
    try {
      await database.executeSql('DELETE FROM meetings WHERE id = ?', [id]);
      return true;
    } catch (error) {
      console.error('Error deleting meeting:', error);
      throw error;
    }
  }
};

/**
 * Spiritual fitness operations
 */
export const spiritualFitnessOperations = {
  /**
   * Get spiritual fitness for a user
   * @param {string} userId - User ID
   * @param {Object} options - Query options
   * @returns {Promise<Object|null>} Spiritual fitness or null if not found
   */
  getForUser: async (userId, options = {}) => {
    try {
      let query = 'SELECT * FROM spiritualFitness WHERE userId = ?';
      let params = [userId];
      
      // Filter by date if provided
      if (options.date) {
        query += ' AND date = ?';
        params.push(options.date);
      }
      
      // Add order by and limit
      query += ' ORDER BY date DESC LIMIT 1';
      
      const [results] = await database.executeSql(query, params);
      
      if (results.rows.length === 0) {
        return null;
      }
      
      const fitness = results.rows.item(0);
      
      // Parse the breakdown JSON
      if (fitness.breakdown) {
        try {
          fitness.breakdown = JSON.parse(fitness.breakdown);
        } catch (e) {
          console.warn('Error parsing spiritual fitness breakdown:', e);
        }
      }
      
      return fitness;
    } catch (error) {
      console.error('Error getting spiritual fitness:', error);
      throw error;
    }
  },
  
  /**
   * Calculate and save spiritual fitness for a user
   * @param {string} userId - User ID
   * @param {Array} activities - Recent user activities
   * @returns {Promise<Object>} Calculated spiritual fitness
   */
  calculateAndSave: async (userId, activities) => {
    try {
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      
      // Define weights for different activity types
      const weights = {
        meeting: 10,
        prayer: 8,
        meditation: 8,
        reading: 6,
        callSponsor: 5,
        callSponsee: 4,
        service: 9,
        stepWork: 10
      };
      
      // Initialize scores
      let totalScore = 0;
      let breakdown = {};
      let eligibleActivities = 0;
      
      // Group activities by type and calculate scores
      activities.forEach(activity => {
        // Only count activities from the last 30 days
        const activityDate = new Date(activity.date);
        const daysDiff = Math.floor((now - activityDate) / (1000 * 60 * 60 * 24));
        
        if (daysDiff <= 30 && weights[activity.type]) {
          // Initialize type in breakdown if not exists
          if (!breakdown[activity.type]) {
            breakdown[activity.type] = {
              count: 0,
              points: 0,
              recentDates: []
            };
          }
          
          // Update breakdown
          breakdown[activity.type].count++;
          breakdown[activity.type].points += weights[activity.type];
          breakdown[activity.type].recentDates.push(activity.date);
          
          // Update total score
          totalScore += weights[activity.type];
          eligibleActivities++;
        }
      });
      
      // Calculate final score (normalized to 10)
      let finalScore = 0;
      if (eligibleActivities > 0) {
        // Base score on total points, but cap at 10 and round to 2 decimal places
        finalScore = Math.min(10, (totalScore / (eligibleActivities * 4)));
        finalScore = Math.round(finalScore * 100) / 100;
      }
      
      // Create spiritual fitness record
      const fitness = {
        id: generateId(),
        userId,
        date: dateStr,
        score: finalScore,
        breakdown: JSON.stringify(breakdown)
      };
      
      // Save to database
      await database.executeSql(
        `INSERT OR REPLACE INTO spiritualFitness (
          id, userId, date, score, breakdown
        ) VALUES (?, ?, ?, ?, ?)`,
        [fitness.id, fitness.userId, fitness.date, fitness.score, fitness.breakdown]
      );
      
      // Return fitness with parsed breakdown
      fitness.breakdown = breakdown;
      return fitness;
    } catch (error) {
      console.error('Error calculating spiritual fitness:', error);
      throw error;
    }
  }
};

/**
 * Calendar reminder operations
 */
export const calendarReminderOperations = {
  /**
   * Get reminders for a meeting
   * @param {string} meetingId - Meeting ID
   * @returns {Promise<Array>} Reminders array
   */
  getForMeeting: async (meetingId) => {
    try {
      const [results] = await database.executeSql(
        'SELECT * FROM calendarReminders WHERE meetingId = ?',
        [meetingId]
      );
      
      const reminders = [];
      for (let i = 0; i < results.rows.length; i++) {
        reminders.push(results.rows.item(i));
      }
      
      return reminders;
    } catch (error) {
      console.error('Error getting reminders for meeting:', error);
      throw error;
    }
  },
  
  /**
   * Save a calendar reminder
   * @param {Object} reminder - Reminder object
   * @returns {Promise<Object>} Saved reminder
   */
  save: async (reminder) => {
    try {
      const reminderId = reminder.id || generateId();
      
      const newReminder = {
        id: reminderId,
        meetingId: reminder.meetingId,
        calendarEventId: reminder.calendarEventId || '',
        reminderTime: reminder.reminderTime || 30,
        isActive: reminder.isActive ? 1 : 0
      };
      
      await database.executeSql(
        `INSERT OR REPLACE INTO calendarReminders (
          id, meetingId, calendarEventId, reminderTime, isActive
        ) VALUES (?, ?, ?, ?, ?)`,
        [
          newReminder.id, newReminder.meetingId, newReminder.calendarEventId,
          newReminder.reminderTime, newReminder.isActive
        ]
      );
      
      return newReminder;
    } catch (error) {
      console.error('Error saving calendar reminder:', error);
      throw error;
    }
  },
  
  /**
   * Delete a calendar reminder
   * @param {string} id - Reminder ID
   * @returns {Promise<boolean>} Whether deletion was successful
   */
  delete: async (id) => {
    try {
      await database.executeSql('DELETE FROM calendarReminders WHERE id = ?', [id]);
      return true;
    } catch (error) {
      console.error('Error deleting calendar reminder:', error);
      throw error;
    }
  }
};

/**
 * Discovered members operations
 */
export const discoveredMembersOperations = {
  /**
   * Get all discovered members
   * @returns {Promise<Array>} Discovered members array
   */
  getAll: async () => {
    try {
      const [results] = await database.executeSql(
        'SELECT * FROM discoveredMembers ORDER BY lastSeen DESC'
      );
      
      const members = [];
      for (let i = 0; i < results.rows.length; i++) {
        members.push(results.rows.item(i));
      }
      
      return members;
    } catch (error) {
      console.error('Error getting discovered members:', error);
      throw error;
    }
  },
  
  /**
   * Save a discovered member
   * @param {Object} member - Member object
   * @returns {Promise<Object>} Saved member
   */
  saveOrUpdate: async (member) => {
    try {
      const now = new Date().toISOString();
      
      // Check if member exists by deviceId
      const [existingResults] = await database.executeSql(
        'SELECT * FROM discoveredMembers WHERE deviceId = ?',
        [member.deviceId]
      );
      
      if (existingResults.rows.length > 0) {
        // Update existing member
        const existing = existingResults.rows.item(0);
        const meetCount = existing.meetCount + 1;
        
        await database.executeSql(
          `UPDATE discoveredMembers 
           SET name = ?, discoveryMethod = ?, lastSeen = ?, meetCount = ? 
           WHERE id = ?`,
          [
            member.name || existing.name,
            member.discoveryMethod || existing.discoveryMethod,
            now,
            meetCount,
            existing.id
          ]
        );
        
        return {
          ...existing,
          name: member.name || existing.name,
          discoveryMethod: member.discoveryMethod || existing.discoveryMethod,
          lastSeen: now,
          meetCount
        };
      } else {
        // Create new member
        const memberId = generateId();
        
        const newMember = {
          id: memberId,
          deviceId: member.deviceId,
          name: member.name || 'Anonymous Member',
          discoveryMethod: member.discoveryMethod || 'unknown',
          firstDiscovered: now,
          lastSeen: now,
          meetCount: 1
        };
        
        await database.executeSql(
          `INSERT INTO discoveredMembers (
            id, deviceId, name, discoveryMethod, firstDiscovered, lastSeen, meetCount
          ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            newMember.id, newMember.deviceId, newMember.name, newMember.discoveryMethod,
            newMember.firstDiscovered, newMember.lastSeen, newMember.meetCount
          ]
        );
        
        return newMember;
      }
    } catch (error) {
      console.error('Error saving discovered member:', error);
      throw error;
    }
  },
  
  /**
   * Delete a discovered member
   * @param {string} id - Member ID
   * @returns {Promise<boolean>} Whether deletion was successful
   */
  delete: async (id) => {
    try {
      await database.executeSql('DELETE FROM discoveredMembers WHERE id = ?', [id]);
      return true;
    } catch (error) {
      console.error('Error deleting discovered member:', error);
      throw error;
    }
  }
};

// Export all operations
export default {
  initDatabase,
  userOperations,
  activityOperations,
  meetingOperations,
  spiritualFitnessOperations,
  calendarReminderOperations,
  discoveredMembersOperations
};