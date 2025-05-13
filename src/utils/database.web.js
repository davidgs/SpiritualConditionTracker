/**
 * Web-compatible database implementation using localStorage
 * This is a simplified version that provides the same interface as the native SQLite implementation
 */

// Database keys for different tables
const DB_PREFIX = 'spiritual_condition_';
const DB_TABLES = {
  USERS: `${DB_PREFIX}users`,
  ACTIVITIES: `${DB_PREFIX}activities`,
  MEETINGS: `${DB_PREFIX}meetings`,
  SPIRITUAL_FITNESS: `${DB_PREFIX}spiritual_fitness`,
  REMINDERS: `${DB_PREFIX}reminders`,
  NEARBY_MEMBERS: `${DB_PREFIX}nearby_members`
};

// Initialize database tables in localStorage
export const initDatabase = async () => {
  console.log("Initializing web database with localStorage");
  
  try {
    // Initialize all tables if they don't exist
    Object.values(DB_TABLES).forEach(table => {
      if (!localStorage.getItem(table)) {
        localStorage.setItem(table, JSON.stringify([]));
      }
    });
    
    // Add default user if none exists
    const users = JSON.parse(localStorage.getItem(DB_TABLES.USERS) || '[]');
    if (users.length === 0) {
      users.push({
        id: 'default_user',
        name: 'Default User',
        sobriety_date: new Date().toISOString().split('T')[0],
        home_group: 'Web Group',
        privacy_settings: JSON.stringify({ shareLocation: false, shareActivities: true }),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      localStorage.setItem(DB_TABLES.USERS, JSON.stringify(users));
    }
    
    console.log("Web database initialized successfully");
    return true;
  } catch (error) {
    console.error("Error initializing web database:", error);
    return false;
  }
};

// Close database (no-op for localStorage)
export const closeDatabase = () => {
  console.log("Close database called (no-op for web)");
  return Promise.resolve(true);
};

// Get all items from a table
const getTableData = (tableName) => {
  try {
    return JSON.parse(localStorage.getItem(tableName) || '[]');
  } catch (error) {
    console.error(`Error reading from ${tableName}:`, error);
    return [];
  }
};

// Save data to a table
const saveTableData = (tableName, data) => {
  try {
    localStorage.setItem(tableName, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`Error saving to ${tableName}:`, error);
    return false;
  }
};

// Extract table name from SQL query
const extractTableName = (sql) => {
  sql = sql.toLowerCase();
  
  for (const [key, value] of Object.entries(DB_TABLES)) {
    const tableName = key.toLowerCase();
    if (sql.includes(tableName)) {
      return value;
    }
  }
  
  // Fallback detection
  if (sql.includes('users')) return DB_TABLES.USERS;
  if (sql.includes('activities')) return DB_TABLES.ACTIVITIES;
  if (sql.includes('meetings')) return DB_TABLES.MEETINGS;
  if (sql.includes('spiritual_fitness')) return DB_TABLES.SPIRITUAL_FITNESS;
  if (sql.includes('reminders')) return DB_TABLES.REMINDERS;
  if (sql.includes('nearby_members')) return DB_TABLES.NEARBY_MEMBERS;
  
  return null;
};

// Simple SQL-like operations for web
export const executeSql = async (sql, params = []) => {
  console.log(`Web DB: ${sql}`, params);
  
  try {
    const lowerSql = sql.toLowerCase();
    const tableName = extractTableName(sql);
    
    if (!tableName) {
      console.warn(`Couldn't determine table name from query: ${sql}`);
      return {
        rows: {
          length: 0,
          _array: [],
          item: () => null
        }
      };
    }
    
    // Handling different SQL operations
    
    // CREATE TABLE - just ignore, tables are set up in initDatabase
    if (lowerSql.startsWith('create table')) {
      return { rowsAffected: 0 };
    }
    
    // SELECT queries
    if (lowerSql.startsWith('select')) {
      const data = getTableData(tableName);
      let results = [...data];
      
      // Filter if WHERE clause exists
      if (lowerSql.includes('where')) {
        // Very simple WHERE implementation - just supports id = value
        if (lowerSql.includes('id = ?') && params.length > 0) {
          const id = params[0];
          results = results.filter(item => item.id === id);
        }
        // Date filtering
        else if (lowerSql.includes('date >= ?') && params.length > 0) {
          const date = params[0];
          results = results.filter(item => item.date >= date);
        }
      }
      
      // Support for LIMIT
      if (lowerSql.includes('limit ?') && params.length > 0) {
        const limit = parseInt(params[params.length - 1]);
        if (!isNaN(limit)) {
          results = results.slice(0, limit);
        }
      }
      
      return {
        rows: {
          length: results.length,
          _array: results,
          item: (index) => (index < results.length) ? results[index] : null
        }
      };
    }
    
    // INSERT queries
    if (lowerSql.startsWith('insert into')) {
      const data = getTableData(tableName);
      const newItem = { id: `web_${Date.now()}` };
      
      // Add timestamp fields
      if (!lowerSql.includes('created_at')) {
        newItem.created_at = new Date().toISOString();
      }
      
      data.push(newItem);
      saveTableData(tableName, data);
      
      return {
        insertId: newItem.id,
        rowsAffected: 1
      };
    }
    
    // UPDATE queries
    if (lowerSql.startsWith('update')) {
      const data = getTableData(tableName);
      let updated = 0;
      
      // Simple implementation - just support id = value
      if (lowerSql.includes('where id = ?') && params.length > 0) {
        const id = params[params.length - 1];
        const updatedData = data.map(item => {
          if (item.id === id) {
            updated++;
            return { ...item, updated_at: new Date().toISOString() };
          }
          return item;
        });
        
        saveTableData(tableName, updatedData);
      }
      
      return { rowsAffected: updated };
    }
    
    // DELETE queries
    if (lowerSql.startsWith('delete')) {
      const data = getTableData(tableName);
      
      // Simple implementation - just support id = value
      if (lowerSql.includes('where id = ?') && params.length > 0) {
        const id = params[0];
        const originalLength = data.length;
        const filteredData = data.filter(item => item.id !== id);
        
        saveTableData(tableName, filteredData);
        return { rowsAffected: originalLength - filteredData.length };
      }
      
      return { rowsAffected: 0 };
    }
    
    return {
      rows: {
        length: 0,
        _array: [],
        item: () => null
      }
    };
  } catch (error) {
    console.error(`Error executing SQL: ${sql}`, error);
    return {
      rows: {
        length: 0,
        _array: [],
        item: () => null
      }
    };
  }
};

// Helper functions
export const getAll = async (table) => {
  const tableName = Object.values(DB_TABLES).find(t => 
    t.toLowerCase().includes(table.toLowerCase()));
  
  if (!tableName) return [];
  
  return getTableData(tableName);
};

export const getById = async (table, id) => {
  const tableName = Object.values(DB_TABLES).find(t => 
    t.toLowerCase().includes(table.toLowerCase()));
  
  if (!tableName) return null;
  
  const data = getTableData(tableName);
  return data.find(item => item.id === id) || null;
};

export const insert = async (table, data) => {
  const tableName = Object.values(DB_TABLES).find(t => 
    t.toLowerCase().includes(table.toLowerCase()));
  
  if (!tableName) return null;
  
  const id = data.id || `web_${Date.now()}`;
  const newItem = {
    ...data,
    id,
    created_at: data.created_at || new Date().toISOString()
  };
  
  const tableData = getTableData(tableName);
  tableData.push(newItem);
  saveTableData(tableName, tableData);
  
  return id;
};

export const update = async (table, id, data) => {
  const tableName = Object.values(DB_TABLES).find(t => 
    t.toLowerCase().includes(table.toLowerCase()));
  
  if (!tableName) return 0;
  
  const tableData = getTableData(tableName);
  let updated = 0;
  
  const updatedData = tableData.map(item => {
    if (item.id === id) {
      updated++;
      return { 
        ...item, 
        ...data, 
        updated_at: new Date().toISOString() 
      };
    }
    return item;
  });
  
  saveTableData(tableName, updatedData);
  return updated;
};

export const deleteById = async (table, id) => {
  const tableName = Object.values(DB_TABLES).find(t => 
    t.toLowerCase().includes(table.toLowerCase()));
  
  if (!tableName) return 0;
  
  const tableData = getTableData(tableName);
  const originalLength = tableData.length;
  const filteredData = tableData.filter(item => item.id !== id);
  
  saveTableData(tableName, filteredData);
  return originalLength - filteredData.length;
};

// Utility functions
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

export const calculateSobrietyYears = (sobrietyDate, decimalPlaces = 2) => {
  const days = calculateSobrietyDays(sobrietyDate);
  const years = days / 365.25; // Account for leap years
  
  return parseFloat(years.toFixed(decimalPlaces));
};

// Specialized operations for each entity type
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
      const allActivities = await getAll('activities');
      return allActivities.filter(activity => activity.user_id === userId)
        .sort((a, b) => new Date(b.date) - new Date(a.date));
    } catch (error) {
      console.error('Error getting user activities:', error);
      return [];
    }
  },
  
  getRecentActivities: async (userId, limit = 10) => {
    try {
      const allActivities = await getAll('activities');
      return allActivities.filter(activity => activity.user_id === userId)
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting recent activities:', error);
      return [];
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
      
      const allActivities = await getAll('activities');
      const recentActivities = allActivities
        .filter(activity => 
          activity.user_id === userId && 
          new Date(activity.date) >= thirtyDaysAgo
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
      recentActivities.forEach(activity => {
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
        details: scores
      };
    } catch (error) {
      console.error('Error calculating spiritual fitness:', error);
      return {
        score: 0,
        details: {
          prayer: 0,
          meditation: 0,
          reading: 0,
          meeting: 0,
          service: 0
        }
      };
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
      name: meetingData.name,
      day: meetingData.day,
      time: meetingData.time,
      location: meetingData.location || '',
      address: meetingData.address || '',
      city: meetingData.city || '',
      state: meetingData.state || '',
      zip: meetingData.zip || '',
      type: meetingData.type || 'open',
      notes: meetingData.notes || '',
      shared: meetingData.shared || false,
      created_by: meetingData.createdBy,
      created_at: now,
      updated_at: now
    };
    
    await insert('meetings', data);
    return meetingId;
  },
  
  getMeetingById: async (meetingId) => {
    return await getById('meetings', meetingId);
  },
  
  getSharedMeetings: async () => {
    const allMeetings = await getAll('meetings');
    return allMeetings.filter(meeting => meeting.shared);
  },
  
  getUserMeetings: async (userId) => {
    const allMeetings = await getAll('meetings');
    return allMeetings.filter(meeting => meeting.created_by === userId);
  },
  
  updateMeeting: async (meetingId, meetingData) => {
    const updates = {
      updated_at: new Date().toISOString()
    };
    
    // Copy only defined fields
    if (meetingData.name) updates.name = meetingData.name;
    if (meetingData.day) updates.day = meetingData.day;
    if (meetingData.time) updates.time = meetingData.time;
    if (meetingData.location !== undefined) updates.location = meetingData.location;
    if (meetingData.address !== undefined) updates.address = meetingData.address;
    if (meetingData.city !== undefined) updates.city = meetingData.city;
    if (meetingData.state !== undefined) updates.state = meetingData.state;
    if (meetingData.zip !== undefined) updates.zip = meetingData.zip;
    if (meetingData.type !== undefined) updates.type = meetingData.type;
    if (meetingData.notes !== undefined) updates.notes = meetingData.notes;
    if (meetingData.shared !== undefined) updates.shared = meetingData.shared;
    
    return await update('meetings', meetingId, updates);
  },
  
  deleteMeeting: async (meetingId) => {
    return await deleteById('meetings', meetingId);
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
      reminder_time: reminderData.reminderTime || 30, // Default 30 minutes before
      notification_id: reminderData.notificationId || null,
      calendar_event_id: reminderData.calendarEventId || null,
      created_at: now
    };
    
    await insert('meeting_reminders', data);
    return reminderId;
  },
  
  getUserReminders: async (userId) => {
    const allReminders = await getAll('meeting_reminders');
    return allReminders.filter(reminder => reminder.user_id === userId);
  },
  
  deleteReminder: async (reminderId) => {
    return await deleteById('meeting_reminders', reminderId);
  }
};

// Nearby members operations
export const nearbyMembersOperations = {
  recordNearbyMember: async (data) => {
    const now = new Date().toISOString();
    const id = data.id || `nearby_${Date.now()}`;
    
    const entry = {
      id,
      user_id: data.userId,
      discovered_user_id: data.discoveredUserId,
      discovery_type: data.discoveryType || 'bluetooth',
      distance: data.distance || 0,
      last_seen: now
    };
    
    await insert('nearby_members', entry);
    return id;
  },
  
  getNearbyMembers: async (userId) => {
    const allNearby = await getAll('nearby_members');
    return allNearby.filter(entry => entry.user_id === userId);
  },
  
  updateLastSeen: async (id, distance) => {
    const now = new Date().toISOString();
    return await update('nearby_members', id, {
      last_seen: now,
      distance: distance || 0
    });
  }
};

// Export default object with all operations
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