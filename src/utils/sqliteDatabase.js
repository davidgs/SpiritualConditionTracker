/**
 * SQLite database implementation for the Spiritual Condition Tracker
 * Handles data persistence using SQLite instead of localStorage
 */

// Import calculation utilities
import { calculateSobrietyDays, calculateSobrietyYears } from './calculations';

// Initialize the SQLite database
let db = null;

/**
 * Initialize all database tables and create database connection
 */
export async function initDatabase() {
  console.log("[ sqliteDatabase.js ] Initializing SQLite database...");
  
  try {
    // Check for browser or native SQLite implementations
    if (window.openDatabase) {
      // Browser implementation (WebSQL)
      console.log("Using WebSQL implementation for browser");
      db = window.openDatabase(
        'spiritualTracker.db',
        '1.0',
        'Spiritual Condition Tracker Database',
        5 * 1024 * 1024 // 5MB
      );
    } else if (window.sqlitePlugin && window.sqlitePlugin.openDatabase) {
      // Native SQLite implementation (Cordova/React Native)
      console.log("Using native SQLite implementation");
      db = window.sqlitePlugin.openDatabase({
        name: 'spiritualTracker.db',
        location: 'default'
      });
    } else {
      // No SQLite implementation available
      console.error("SQLite not available - falling back to localStorage");
      initLocalStorageBackup();
      return false;
    }
    
    // Create tables if they don't exist
    await createTables();
    
    console.log("SQLite database initialized successfully");
    return true;
  } catch (error) {
    console.error("Error initializing SQLite database:", error);
    // Fall back to localStorage if SQLite fails
    initLocalStorageBackup();
    return false;
  }
}

/**
 * Create database tables if they don't exist
 */
async function createTables() {
  return new Promise((resolve, reject) => {
    // Use a transaction for creating all tables
    db.transaction(tx => {
      // Users table
      tx.executeSql(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          name TEXT,
          lastName TEXT,
          phoneNumber TEXT,
          email TEXT,
          sobrietyDate TEXT,
          homeGroups TEXT,
          privacySettings TEXT,
          preferences TEXT,
          sponsor TEXT,
          sponsees TEXT,
          messagingKeys TEXT,
          createdAt TEXT,
          updatedAt TEXT
        )
      `);
      
      // Activities table
      tx.executeSql(`
        CREATE TABLE IF NOT EXISTS activities (
          id TEXT PRIMARY KEY,
          type TEXT NOT NULL,
          duration INTEGER,
          date TEXT,
          notes TEXT,
          meeting TEXT,
          createdAt TEXT,
          updatedAt TEXT
        )
      `);
      
      // Meetings table
      tx.executeSql(`
        CREATE TABLE IF NOT EXISTS meetings (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          days TEXT,
          time TEXT,
          schedule TEXT,
          address TEXT,
          locationName TEXT,
          streetAddress TEXT,
          city TEXT,
          state TEXT,
          zipCode TEXT,
          coordinates TEXT,
          createdAt TEXT,
          updatedAt TEXT
        )
      `);
      
      // Messages table
      tx.executeSql(`
        CREATE TABLE IF NOT EXISTS messages (
          id TEXT PRIMARY KEY,
          senderId TEXT,
          recipientId TEXT,
          content TEXT,
          encrypted BOOLEAN,
          timestamp TEXT,
          read BOOLEAN
        )
      `);
    }, error => {
      console.error("Error creating tables:", error);
      reject(error);
    }, () => {
      console.log("Tables created successfully");
      resolve();
    });
  });
}

/**
 * Initialize localStorage as a backup if SQLite is not available
 */
function initLocalStorageBackup() {
  console.log("Initializing localStorage backup...");
  
  if (!window.db) {
    window.db = {
      users: JSON.parse(localStorage.getItem('users') || '[]'),
      activities: JSON.parse(localStorage.getItem('activities') || '[]'),
      meetings: JSON.parse(localStorage.getItem('meetings') || '[]'),
      messages: JSON.parse(localStorage.getItem('messages') || '[]'),
      calculateSobrietyDays: calculateSobrietyDays,
      calculateSobrietyYears: calculateSobrietyYears,
      calculateDistance: calculateDistance,
      user: JSON.parse(localStorage.getItem('user') || 'null')
    };
  }
}

/**
 * Get all items from a collection
 * @param {string} collection - The collection name
 * @returns {Promise<Array>} All items in the collection
 */
export async function getAll(collection) {
  return new Promise((resolve, reject) => {
    // Check if we're using SQLite or localStorage
    if (!db) {
      // Fallback to localStorage
      const items = window.db[collection] || [];
      resolve(items);
      return;
    }
    
    // Otherwise use SQLite
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM ${collection}`,
        [],
        (_, result) => {
          const items = [];
          const len = result.rows.length;
          
          for (let i = 0; i < len; i++) {
            const item = result.rows.item(i);
            
            // Parse JSON fields
            if (collection === 'users') {
              item.privacySettings = JSON.parse(item.privacySettings || '{}');
              item.preferences = JSON.parse(item.preferences || '{}');
              item.homeGroups = JSON.parse(item.homeGroups || '[]');
              item.sponsor = JSON.parse(item.sponsor || 'null');
              item.sponsees = JSON.parse(item.sponsees || '[]');
              item.messagingKeys = JSON.parse(item.messagingKeys || '{}');
            } else if (collection === 'meetings') {
              item.days = JSON.parse(item.days || '[]');
              item.schedule = JSON.parse(item.schedule || '[]');
              item.coordinates = JSON.parse(item.coordinates || 'null');
            }
            
            items.push(item);
          }
          
          resolve(items);
        },
        (_, error) => {
          console.error(`Error getting items from ${collection}:`, error);
          reject(error);
        }
      );
    });
  });
}

/**
 * Get an item by ID from a collection
 * @param {string} collection - The collection name
 * @param {string} id - The item ID
 * @returns {Promise<Object|null>} The found item or null
 */
export async function getById(collection, id) {
  return new Promise((resolve, reject) => {
    // Check if we're using SQLite or localStorage
    if (!db) {
      // Fallback to localStorage
      const items = window.db[collection] || [];
      const item = items.find(item => item.id === id) || null;
      resolve(item);
      return;
    }
    
    // Otherwise use SQLite
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM ${collection} WHERE id = ?`,
        [id],
        (_, result) => {
          if (result.rows.length === 0) {
            resolve(null);
            return;
          }
          
          const item = result.rows.item(0);
          
          // Parse JSON fields
          if (collection === 'users') {
            item.privacySettings = JSON.parse(item.privacySettings || '{}');
            item.preferences = JSON.parse(item.preferences || '{}');
            item.homeGroups = JSON.parse(item.homeGroups || '[]');
            item.sponsor = JSON.parse(item.sponsor || 'null');
            item.sponsees = JSON.parse(item.sponsees || '[]');
            item.messagingKeys = JSON.parse(item.messagingKeys || '{}');
          } else if (collection === 'meetings') {
            item.days = JSON.parse(item.days || '[]');
            item.schedule = JSON.parse(item.schedule || '[]');
            item.coordinates = JSON.parse(item.coordinates || 'null');
          }
          
          resolve(item);
        },
        (_, error) => {
          console.error(`Error getting item from ${collection}:`, error);
          reject(error);
        }
      );
    });
  });
}

/**
 * Add an item to a collection
 * @param {string} collection - The collection name
 * @param {Object} item - The item to add
 * @returns {Promise<Object>} The added item
 */
export async function add(collection, item) {
  return new Promise((resolve, reject) => {
    // Generate ID if not provided
    if (!item.id) {
      item.id = `${collection.slice(0, -1)}_${Date.now()}`;
    }
    
    // Add timestamps
    const now = new Date().toISOString();
    item.createdAt = now;
    item.updatedAt = now;
    
    // Check if we're using SQLite or localStorage
    if (!db) {
      // Fallback to localStorage
      const items = window.db[collection] || [];
      items.push(item);
      window.db[collection] = items;
      
      // Save to localStorage
      localStorage.setItem(collection, JSON.stringify(items));
      
      // Special case for user (single instance)
      if (collection === 'users' && items.length === 1) {
        window.db.user = item;
        localStorage.setItem('user', JSON.stringify(item));
      }
      
      resolve(item);
      return;
    }
    
    // Otherwise use SQLite
    db.transaction(tx => {
      if (collection === 'users') {
        const privacySettings = JSON.stringify(item.privacySettings || {});
        const preferences = JSON.stringify(item.preferences || {});
        const homeGroups = JSON.stringify(item.homeGroups || []);
        const sponsor = JSON.stringify(item.sponsor || null);
        const sponsees = JSON.stringify(item.sponsees || []);
        const messagingKeys = JSON.stringify(item.messagingKeys || {});
        
        tx.executeSql(
          `INSERT INTO users (
            id, name, lastName, phoneNumber, email, sobrietyDate, 
            homeGroups, privacySettings, preferences, sponsor, sponsees, 
            messagingKeys, createdAt, updatedAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            item.id, item.name, item.lastName, item.phoneNumber, item.email, 
            item.sobrietyDate, homeGroups, privacySettings, preferences, 
            sponsor, sponsees, messagingKeys, item.createdAt, item.updatedAt
          ],
          (_, result) => {
            resolve(item);
          },
          (_, error) => {
            console.error(`Error adding item to ${collection}:`, error);
            reject(error);
          }
        );
      } else if (collection === 'activities') {
        tx.executeSql(
          `INSERT INTO activities (
            id, type, duration, date, notes, meeting, createdAt, updatedAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            item.id, item.type, item.duration, item.date, item.notes, 
            item.meeting, item.createdAt, item.updatedAt
          ],
          (_, result) => {
            resolve(item);
          },
          (_, error) => {
            console.error(`Error adding item to ${collection}:`, error);
            reject(error);
          }
        );
      } else if (collection === 'meetings') {
        const days = JSON.stringify(item.days || []);
        const schedule = JSON.stringify(item.schedule || []);
        const coordinates = JSON.stringify(item.coordinates || null);
        
        tx.executeSql(
          `INSERT INTO meetings (
            id, name, days, time, schedule, address, locationName, 
            streetAddress, city, state, zipCode, coordinates, createdAt, updatedAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            item.id, item.name, days, item.time, schedule, item.address, 
            item.locationName, item.streetAddress, item.city, item.state, 
            item.zipCode, coordinates, item.createdAt, item.updatedAt
          ],
          (_, result) => {
            resolve(item);
          },
          (_, error) => {
            console.error(`Error adding item to ${collection}:`, error);
            reject(error);
          }
        );
      } else if (collection === 'messages') {
        tx.executeSql(
          `INSERT INTO messages (
            id, senderId, recipientId, content, encrypted, timestamp, read
          ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            item.id, item.senderId, item.recipientId, item.content, 
            item.encrypted ? 1 : 0, item.timestamp, item.read ? 1 : 0
          ],
          (_, result) => {
            resolve(item);
          },
          (_, error) => {
            console.error(`Error adding item to ${collection}:`, error);
            reject(error);
          }
        );
      } else {
        reject(new Error(`Unknown collection: ${collection}`));
      }
    });
  });
}

/**
 * Update an item in a collection
 * @param {string} collection - The collection name
 * @param {string} id - The item ID
 * @param {Object} updates - The updates to apply
 * @returns {Promise<Object|null>} The updated item or null if not found
 */
export async function update(collection, id, updates) {
  return new Promise(async (resolve, reject) => {
    // Update timestamp
    updates.updatedAt = new Date().toISOString();
    
    // Check if we're using SQLite or localStorage
    if (!db) {
      // Fallback to localStorage
      const items = window.db[collection] || [];
      const index = items.findIndex(item => item.id === id);
      
      if (index === -1) {
        resolve(null);
        return;
      }
      
      const updatedItem = { ...items[index], ...updates };
      items[index] = updatedItem;
      window.db[collection] = items;
      
      // Save to localStorage
      localStorage.setItem(collection, JSON.stringify(items));
      
      // Special case for user (single instance)
      if (collection === 'users' && id === window.db.user?.id) {
        window.db.user = updatedItem;
        localStorage.setItem('user', JSON.stringify(updatedItem));
      }
      
      resolve(updatedItem);
      return;
    }
    
    // Get the existing item first to merge updates
    const existingItem = await getById(collection, id);
    
    if (!existingItem) {
      resolve(null);
      return;
    }
    
    // Merge existing item with updates
    const updatedItem = { ...existingItem, ...updates };
    
    // Otherwise use SQLite
    db.transaction(tx => {
      if (collection === 'users') {
        const privacySettings = JSON.stringify(updatedItem.privacySettings || {});
        const preferences = JSON.stringify(updatedItem.preferences || {});
        const homeGroups = JSON.stringify(updatedItem.homeGroups || []);
        const sponsor = JSON.stringify(updatedItem.sponsor || null);
        const sponsees = JSON.stringify(updatedItem.sponsees || []);
        const messagingKeys = JSON.stringify(updatedItem.messagingKeys || {});
        
        tx.executeSql(
          `UPDATE users SET 
            name = ?, lastName = ?, phoneNumber = ?, email = ?, sobrietyDate = ?, 
            homeGroups = ?, privacySettings = ?, preferences = ?, sponsor = ?, 
            sponsees = ?, messagingKeys = ?, updatedAt = ?
          WHERE id = ?`,
          [
            updatedItem.name, updatedItem.lastName, updatedItem.phoneNumber, updatedItem.email, 
            updatedItem.sobrietyDate, homeGroups, privacySettings, preferences, 
            sponsor, sponsees, messagingKeys, updatedItem.updatedAt, id
          ],
          (_, result) => {
            if (result.rowsAffected === 0) {
              resolve(null);
            } else {
              resolve(updatedItem);
            }
          },
          (_, error) => {
            console.error(`Error updating item in ${collection}:`, error);
            reject(error);
          }
        );
      } else if (collection === 'activities') {
        tx.executeSql(
          `UPDATE activities SET 
            type = ?, duration = ?, date = ?, notes = ?, meeting = ?, updatedAt = ?
          WHERE id = ?`,
          [
            updatedItem.type, updatedItem.duration, updatedItem.date, 
            updatedItem.notes, updatedItem.meeting, updatedItem.updatedAt, id
          ],
          (_, result) => {
            if (result.rowsAffected === 0) {
              resolve(null);
            } else {
              resolve(updatedItem);
            }
          },
          (_, error) => {
            console.error(`Error updating item in ${collection}:`, error);
            reject(error);
          }
        );
      } else if (collection === 'meetings') {
        const days = JSON.stringify(updatedItem.days || []);
        const schedule = JSON.stringify(updatedItem.schedule || []);
        const coordinates = JSON.stringify(updatedItem.coordinates || null);
        
        tx.executeSql(
          `UPDATE meetings SET 
            name = ?, days = ?, time = ?, schedule = ?, address = ?, locationName = ?, 
            streetAddress = ?, city = ?, state = ?, zipCode = ?, 
            coordinates = ?, updatedAt = ?
          WHERE id = ?`,
          [
            updatedItem.name, days, updatedItem.time, schedule, updatedItem.address, 
            updatedItem.locationName, updatedItem.streetAddress, updatedItem.city, 
            updatedItem.state, updatedItem.zipCode, coordinates, updatedItem.updatedAt, id
          ],
          (_, result) => {
            if (result.rowsAffected === 0) {
              resolve(null);
            } else {
              resolve(updatedItem);
            }
          },
          (_, error) => {
            console.error(`Error updating item in ${collection}:`, error);
            reject(error);
          }
        );
      } else if (collection === 'messages') {
        tx.executeSql(
          `UPDATE messages SET 
            content = ?, encrypted = ?, read = ?
          WHERE id = ?`,
          [
            updatedItem.content, updatedItem.encrypted ? 1 : 0, 
            updatedItem.read ? 1 : 0, id
          ],
          (_, result) => {
            if (result.rowsAffected === 0) {
              resolve(null);
            } else {
              resolve(updatedItem);
            }
          },
          (_, error) => {
            console.error(`Error updating item in ${collection}:`, error);
            reject(error);
          }
        );
      } else {
        reject(new Error(`Unknown collection: ${collection}`));
      }
    });
  });
}

/**
 * Remove an item from a collection
 * @param {string} collection - The collection name
 * @param {string} id - The item ID
 * @returns {Promise<boolean>} Whether the item was removed
 */
export async function remove(collection, id) {
  return new Promise((resolve, reject) => {
    // Check if we're using SQLite or localStorage
    if (!db) {
      // Fallback to localStorage
      const items = window.db[collection] || [];
      const index = items.findIndex(item => item.id === id);
      
      if (index === -1) {
        resolve(false);
        return;
      }
      
      items.splice(index, 1);
      window.db[collection] = items;
      
      // Save to localStorage
      localStorage.setItem(collection, JSON.stringify(items));
      
      resolve(true);
      return;
    }
    
    // Otherwise use SQLite
    db.transaction(tx => {
      tx.executeSql(
        `DELETE FROM ${collection} WHERE id = ?`,
        [id],
        (_, result) => {
          resolve(result.rowsAffected > 0);
        },
        (_, error) => {
          console.error(`Error removing item from ${collection}:`, error);
          reject(error);
        }
      );
    });
  });
}

/**
 * Query items in a collection
 * @param {string} collection - The collection name
 * @param {Function} predicate - Filter function
 * @returns {Promise<Array>} Filtered items
 */
export async function query(collection, predicate) {
  // For now, get all items and filter in memory
  // In a future version, this could be optimized to use SQL WHERE clauses
  const items = await getAll(collection);
  return items.filter(predicate);
}

/**
 * Calculate sobriety days based on sobriety date
 * @param {string} sobrietyDate - Sobriety date in ISO format
 * @returns {number} - Number of days sober
 */
export function calculateSobrietyDays(sobrietyDate) {
  if (!sobrietyDate) return 0;
  
  const start = new Date(sobrietyDate);
  const now = new Date();
  
  // Calculate the difference in days
  const diffTime = Math.abs(now - start);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

/**
 * Calculate sobriety years with decimal precision
 * @param {string} sobrietyDate - Sobriety date in ISO format
 * @param {number} decimalPlaces - Number of decimal places
 * @returns {number} - Years of sobriety with decimal precision
 */
export function calculateSobrietyYears(sobrietyDate, decimalPlaces = 2) {
  if (!sobrietyDate) return 0;
  
  const start = new Date(sobrietyDate);
  const now = new Date();
  
  // Calculate exact years including fractional part
  const diffTime = now - start;
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  const years = diffDays / 365.25; // Account for leap years
  
  // Format to specified decimal places
  return Number(years.toFixed(decimalPlaces));
}

/**
 * Calculate distance between two lat/long points
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} - Distance in miles
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  if (lat1 === lat2 && lon1 === lon2) {
    return 0;
  }
  
  const radlat1 = (Math.PI * lat1) / 180;
  const radlat2 = (Math.PI * lat2) / 180;
  const theta = lon1 - lon2;
  const radtheta = (Math.PI * theta) / 180;
  let dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
  
  if (dist > 1) {
    dist = 1;
  }
  
  dist = Math.acos(dist);
  dist = (dist * 180) / Math.PI;
  dist = dist * 60 * 1.1515; // Miles
  return dist;
}

/**
 * Get user preference
 * @param {string} key - The preference key
 * @returns {Promise<any>} The preference value
 */
export async function getPreference(key) {
  const user = await getById('users', 'user_1'); // Assuming single user
  return user?.preferences?.[key];
}

/**
 * Set user preference
 * @param {string} key - The preference key
 * @param {any} value - The preference value
 * @returns {Promise<void>}
 */
export async function setPreference(key, value) {
  const user = await getById('users', 'user_1'); // Assuming single user
  
  if (!user) {
    return;
  }
  
  const preferences = user.preferences || {};
  preferences[key] = value;
  
  await update('users', user.id, { preferences });
}

// Expose methods on window.db for backwards compatibility
export function setupGlobalDbObject() {
  window.db = {
    getAll,
    getById,
    add,
    update,
    remove,
    query,
    calculateDistance,
    getPreference,
    setPreference,
    
    // Add a calculateSpiritualFitness method that works with activities
    calculateSpiritualFitness: async function(activities, timeframe = 30) {
      if (!activities || activities.length === 0) {
        return 20; // Base score if no activities
      }
      
      try {
        // Get user preference for timeframe if available
        const storedTimeframe = await getPreference('fitnessTimeframe');
        const calculationTimeframe = storedTimeframe ? parseInt(storedTimeframe, 10) : timeframe;
        
        // Start with a base score
        const baseScore = 20;
        let score = baseScore;
        const now = new Date();
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - calculationTimeframe);
        
        // Filter activities to those within the timeframe
        const recentActivities = activities.filter(activity => 
          new Date(activity.date) >= cutoffDate && new Date(activity.date) <= now
        );
        
        if (recentActivities.length === 0) {
          return baseScore; // Base score only if no recent activities
        }
        
        // Calculate points based on activities
        const activityPoints = Math.min(40, recentActivities.length * 2); // Cap at 40 points
        
        // Calculate consistency points
        // Group activities by day to check daily activity
        const activityDayMap = {};
        recentActivities.forEach(activity => {
          const day = new Date(activity.date).toISOString().split('T')[0];
          if (!activityDayMap[day]) {
            activityDayMap[day] = [];
          }
          activityDayMap[day].push(activity);
        });
        
        // Count days with activities
        const daysWithActivities = Object.keys(activityDayMap).length;
        
        // Calculate consistency as a percentage of the timeframe days
        const consistencyPercentage = daysWithActivities / calculationTimeframe;
        const consistencyPoints = Math.round(consistencyPercentage * 40); // Up to 40 points for consistency
        
        // Total score
        score = baseScore + activityPoints + consistencyPoints;
        
        // Ensure score doesn't exceed 100
        score = Math.min(100, score);
        
        // Round to 2 decimal places
        score = Math.round(score * 100) / 100;
        
        return score;
      } catch (error) {
        console.error('Error calculating spiritual fitness:', error);
        return 20; // Default base score on error
      }
    }
  };
  
  return window.db;
}

// Export all functions and data
export const dbOperations = {
  initDatabase,
  getAll,
  getById,
  add,
  update,
  remove,
  query,
  calculateDistance,
  getPreference,
  setPreference,
  setupGlobalDbObject
};

export default dbOperations;