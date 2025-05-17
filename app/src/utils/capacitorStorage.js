/**
 * Capacitor-compatible SQLite storage implementation
 * Optimized for native iOS and Android compiled apps
 */

import { isPlatform } from '@ionic/react';

// Database connection
let db = null;
let sqlitePlugin = null;

/**
 * Initialize the database connection
 * @returns {Promise<boolean>} Whether initialization was successful
 */
export async function initDatabase() {
  console.log("Initializing SQLite database for Capacitor...");
  
  try {
    // Import the appropriate SQLite plugin based on platform
    if (isPlatform('capacitor') || isPlatform('cordova')) {
      console.log("Using native SQLite implementation via Capacitor");
      
      // For Capacitor
      if (isPlatform('capacitor')) {
        const { CapacitorSQLite } = await import('@capacitor-community/sqlite');
        sqlitePlugin = CapacitorSQLite;
      } 
      // For Cordova
      else {
        sqlitePlugin = window.sqlitePlugin;
      }
      
      // Open or create the database
      db = await sqlitePlugin.openDatabase({
        name: 'spiritualTracker.db',
        location: 'default'
      });
    }
    // Web fallback - if Web SQL is available
    else if (window.openDatabase) {
      console.log("Using WebSQL implementation for browser");
      db = window.openDatabase(
        'spiritualTracker.db',
        '1.0',
        'Spiritual Condition Tracker Database',
        5 * 1024 * 1024 // 5MB
      );
    }
    // No SQL support - use localStorage
    else {
      console.warn("SQLite not available - using localStorage fallback");
      setupLocalStorageFallback();
      return false;
    }
    
    // Create tables
    await createTables();
    
    console.log("SQLite database initialized successfully");
    return true;
  } catch (error) {
    console.error("Error initializing database:", error);
    setupLocalStorageFallback();
    return false;
  }
}

/**
 * Create a fallback using localStorage if SQLite is not available
 */
function setupLocalStorageFallback() {
  console.log("Setting up localStorage fallback for data persistence");
  
  // Create an object that mimics SQLite interface but uses localStorage
  db = {
    transaction: (fn) => {
      const tx = {
        executeSql: (query, params, successCallback, errorCallback) => {
          try {
            // Very simplified SQL parsing - handle only basic operations
            const queryLower = query.toLowerCase().trim();
            
            if (queryLower.startsWith('create table')) {
              // For create table, just do nothing as localStorage doesn't need tables
              successCallback({}, { rows: { length: 0 } });
            }
            else if (queryLower.startsWith('select')) {
              handleLocalStorageSelect(queryLower, params, successCallback, errorCallback);
            }
            else if (queryLower.startsWith('insert')) {
              handleLocalStorageInsert(queryLower, params, successCallback, errorCallback);
            }
            else if (queryLower.startsWith('update')) {
              handleLocalStorageUpdate(queryLower, params, successCallback, errorCallback);
            }
            else if (queryLower.startsWith('delete')) {
              handleLocalStorageDelete(queryLower, params, successCallback, errorCallback);
            }
            else {
              // Unknown query
              console.warn("Unsupported SQL query for localStorage:", query);
              successCallback({}, { rows: { length: 0 } });
            }
          } catch (error) {
            console.error("Error in localStorage fallback:", error);
            if (errorCallback) errorCallback({}, error);
          }
        }
      };
      fn(tx);
    }
  };
  
  // Helper functions for localStorage operations
  function getCollection(name) {
    return JSON.parse(localStorage.getItem(name) || '[]');
  }
  
  function saveCollection(name, data) {
    localStorage.setItem(name, JSON.stringify(data));
  }
  
  function handleLocalStorageSelect(query, params, successCallback) {
    // Extract table name (very simplified parser)
    const fromMatch = query.match(/from\s+([^\s,)]+)/i);
    if (!fromMatch) {
      throw new Error("Invalid SELECT query: " + query);
    }
    
    const tableName = fromMatch[1];
    let items = getCollection(tableName);
    
    // Handle WHERE clause (very simplified)
    const whereMatch = query.match(/where\s+([^\s]+)\s*=\s*\?/i);
    if (whereMatch && params.length > 0) {
      const fieldName = whereMatch[1];
      items = items.filter(item => item[fieldName] === params[0]);
    }
    
    // Create a result object with a row-like interface
    const result = {
      rows: {
        length: items.length,
        item: (index) => items[index],
        _array: items
      }
    };
    
    successCallback({}, result);
  }
  
  function handleLocalStorageInsert(query, params, successCallback) {
    // Extract table name (very simplified parser)
    const intoMatch = query.match(/into\s+([^\s(]+)/i);
    if (!intoMatch) {
      throw new Error("Invalid INSERT query: " + query);
    }
    
    const tableName = intoMatch[1];
    
    // Construct an object from params (very simplified)
    const item = constructItemFromParams(tableName, params);
    
    // Add to collection
    const items = getCollection(tableName);
    items.push(item);
    saveCollection(tableName, items);
    
    successCallback({}, { insertId: item.id, rowsAffected: 1 });
  }
  
  function handleLocalStorageUpdate(query, params, successCallback) {
    // Extract table name (very simplified parser)
    const updateMatch = query.match(/update\s+([^\s]+)/i);
    const whereMatch = query.match(/where\s+([^\s]+)\s*=\s*\?/i);
    
    if (!updateMatch || !whereMatch) {
      throw new Error("Invalid UPDATE query: " + query);
    }
    
    const tableName = updateMatch[1];
    const fieldName = whereMatch[1];
    const fieldValue = params[params.length - 1]; // assuming last param is the ID
    
    const items = getCollection(tableName);
    const index = items.findIndex(item => item[fieldName] === fieldValue);
    
    if (index === -1) {
      successCallback({}, { rowsAffected: 0 });
      return;
    }
    
    // Update the item
    const updatedItem = constructItemFromParams(tableName, params, items[index]);
    items[index] = updatedItem;
    saveCollection(tableName, items);
    
    successCallback({}, { rowsAffected: 1 });
  }
  
  function handleLocalStorageDelete(query, params, successCallback) {
    // Extract table name (very simplified parser)
    const fromMatch = query.match(/from\s+([^\s]+)/i);
    const whereMatch = query.match(/where\s+([^\s]+)\s*=\s*\?/i);
    
    if (!fromMatch || !whereMatch) {
      throw new Error("Invalid DELETE query: " + query);
    }
    
    const tableName = fromMatch[1];
    const fieldName = whereMatch[1];
    const fieldValue = params[0];
    
    const items = getCollection(tableName);
    const filteredItems = items.filter(item => item[fieldName] !== fieldValue);
    
    if (filteredItems.length === items.length) {
      successCallback({}, { rowsAffected: 0 });
      return;
    }
    
    saveCollection(tableName, filteredItems);
    successCallback({}, { rowsAffected: 1 });
  }
  
  function constructItemFromParams(tableName, params, existingItem = {}) {
    // Very simplified approach - in a real implementation you would
    // parse column names from the query
    
    // This is just a basic implementation to make it work
    const item = { ...existingItem };
    
    // Set some fields based on table and params
    if (tableName === 'users' && params.length >= 3) {
      item.id = params[0] || existingItem.id || `user_${Date.now()}`;
      item.name = params[1] || existingItem.name;
      item.lastName = params[2] || existingItem.lastName;
      // Add more fields as needed
    }
    else if (tableName === 'activities' && params.length >= 3) {
      item.id = params[0] || existingItem.id || `activity_${Date.now()}`;
      item.type = params[1] || existingItem.type;
      item.duration = params[2] || existingItem.duration;
      // Add more fields as needed
    }
    // Add more tables as needed
    
    return item;
  }
}

/**
 * Create database tables
 */
async function createTables() {
  if (!db) return;
  
  // Define table creation queries
  const tableQueries = [
    `CREATE TABLE IF NOT EXISTS users (
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
    )`,
    
    `CREATE TABLE IF NOT EXISTS activities (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      duration INTEGER,
      date TEXT,
      notes TEXT,
      meeting TEXT,
      createdAt TEXT,
      updatedAt TEXT
    )`,
    
    `CREATE TABLE IF NOT EXISTS meetings (
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
    )`,
    
    `CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      senderId TEXT,
      recipientId TEXT,
      content TEXT,
      encrypted INTEGER,
      timestamp TEXT,
      read INTEGER
    )`,
    
    `CREATE TABLE IF NOT EXISTS preferences (
      id TEXT PRIMARY KEY,
      value TEXT,
      createdAt TEXT,
      updatedAt TEXT
    )`
  ];
  
  // Execute each table creation query
  for (const query of tableQueries) {
    await executeQuery(query);
  }
  
  console.log("All database tables created successfully");
}

/**
 * Execute a SQL query
 * @param {string} query - The SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise<any>} Query result
 */
function executeQuery(query, params = []) {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error("Database not initialized"));
      return;
    }
    
    db.transaction((tx) => {
      tx.executeSql(
        query,
        params,
        (_, result) => resolve(result),
        (_, error) => {
          console.error("SQL Error:", error);
          reject(error);
          return false;
        }
      );
    });
  });
}

/**
 * Get all items from a collection
 * @param {string} collection - The collection name
 * @returns {Promise<Array>} All items in the collection
 */
export async function getAll(collection) {
  try {
    const result = await executeQuery(`SELECT * FROM ${collection}`);
    const items = [];
    const len = result.rows.length;
    
    for (let i = 0; i < len; i++) {
      const item = result.rows.item(i);
      
      // Parse JSON fields based on collection type
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
      } else if (collection === 'preferences') {
        item.value = JSON.parse(item.value || 'null');
      }
      
      items.push(item);
    }
    
    return items;
  } catch (error) {
    console.error(`Error getting all items from ${collection}:`, error);
    return [];
  }
}

/**
 * Get an item by ID from a collection
 * @param {string} collection - The collection name
 * @param {string} id - The item ID
 * @returns {Promise<Object|null>} The found item or null
 */
export async function getById(collection, id) {
  try {
    const result = await executeQuery(
      `SELECT * FROM ${collection} WHERE id = ?`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const item = result.rows.item(0);
    
    // Parse JSON fields based on collection type
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
    } else if (collection === 'preferences') {
      item.value = JSON.parse(item.value || 'null');
    }
    
    return item;
  } catch (error) {
    console.error(`Error getting item by ID from ${collection}:`, error);
    return null;
  }
}

/**
 * Add an item to a collection
 * @param {string} collection - The collection name
 * @param {Object} item - The item to add
 * @returns {Promise<Object>} The added item
 */
export async function add(collection, item) {
  try {
    // Generate ID if not provided
    if (!item.id) {
      item.id = `${collection.slice(0, -1)}_${Date.now()}`;
    }
    
    // Add timestamps
    const now = new Date().toISOString();
    item.createdAt = item.createdAt || now;
    item.updatedAt = now;
    
    // Prepare item based on collection type
    let columns, placeholders, values;
    
    if (collection === 'users') {
      const privacySettings = JSON.stringify(item.privacySettings || {});
      const preferences = JSON.stringify(item.preferences || {});
      const homeGroups = JSON.stringify(item.homeGroups || []);
      const sponsor = JSON.stringify(item.sponsor || null);
      const sponsees = JSON.stringify(item.sponsees || []);
      const messagingKeys = JSON.stringify(item.messagingKeys || {});
      
      columns = 'id, name, lastName, phoneNumber, email, sobrietyDate, homeGroups, privacySettings, preferences, sponsor, sponsees, messagingKeys, createdAt, updatedAt';
      placeholders = '?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?';
      values = [
        item.id, item.name, item.lastName, item.phoneNumber, item.email, 
        item.sobrietyDate, homeGroups, privacySettings, preferences, 
        sponsor, sponsees, messagingKeys, item.createdAt, item.updatedAt
      ];
    } else if (collection === 'activities') {
      columns = 'id, type, duration, date, notes, meeting, createdAt, updatedAt';
      placeholders = '?, ?, ?, ?, ?, ?, ?, ?';
      values = [
        item.id, item.type, item.duration, item.date, item.notes, 
        item.meeting, item.createdAt, item.updatedAt
      ];
    } else if (collection === 'meetings') {
      const days = JSON.stringify(item.days || []);
      const schedule = JSON.stringify(item.schedule || []);
      const coordinates = JSON.stringify(item.coordinates || null);
      
      columns = 'id, name, days, time, schedule, address, locationName, streetAddress, city, state, zipCode, coordinates, createdAt, updatedAt';
      placeholders = '?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?';
      values = [
        item.id, item.name, days, item.time, schedule, item.address, 
        item.locationName, item.streetAddress, item.city, item.state, 
        item.zipCode, coordinates, item.createdAt, item.updatedAt
      ];
    } else if (collection === 'messages') {
      columns = 'id, senderId, recipientId, content, encrypted, timestamp, read';
      placeholders = '?, ?, ?, ?, ?, ?, ?';
      values = [
        item.id, item.senderId, item.recipientId, item.content, 
        item.encrypted ? 1 : 0, item.timestamp, item.read ? 1 : 0
      ];
    } else if (collection === 'preferences') {
      columns = 'id, value, createdAt, updatedAt';
      placeholders = '?, ?, ?, ?';
      values = [
        item.id, JSON.stringify(item.value), item.createdAt, item.updatedAt
      ];
    } else {
      throw new Error(`Unknown collection: ${collection}`);
    }
    
    // Execute insert query
    await executeQuery(
      `INSERT INTO ${collection} (${columns}) VALUES (${placeholders})`,
      values
    );
    
    console.log(`Added item to ${collection} with ID: ${item.id}`);
    return item;
  } catch (error) {
    console.error(`Error adding item to ${collection}:`, error);
    throw error;
  }
}

/**
 * Update an item in a collection
 * @param {string} collection - The collection name
 * @param {string} id - The item ID
 * @param {Object} updates - The updates to apply
 * @returns {Promise<Object|null>} The updated item or null if not found
 */
export async function update(collection, id, updates) {
  try {
    // Update timestamp
    updates.updatedAt = new Date().toISOString();
    
    // Get the existing item first
    const existingItem = await getById(collection, id);
    
    if (!existingItem) {
      console.log(`Item with ID ${id} not found in ${collection}`);
      return null;
    }
    
    // Merge existing item with updates
    const updatedItem = { ...existingItem, ...updates };
    
    // Prepare update based on collection type
    let setClauses, values;
    
    if (collection === 'users') {
      const privacySettings = JSON.stringify(updatedItem.privacySettings || {});
      const preferences = JSON.stringify(updatedItem.preferences || {});
      const homeGroups = JSON.stringify(updatedItem.homeGroups || []);
      const sponsor = JSON.stringify(updatedItem.sponsor || null);
      const sponsees = JSON.stringify(updatedItem.sponsees || []);
      const messagingKeys = JSON.stringify(updatedItem.messagingKeys || {});
      
      setClauses = 'name = ?, lastName = ?, phoneNumber = ?, email = ?, sobrietyDate = ?, homeGroups = ?, privacySettings = ?, preferences = ?, sponsor = ?, sponsees = ?, messagingKeys = ?, updatedAt = ?';
      values = [
        updatedItem.name, updatedItem.lastName, updatedItem.phoneNumber, updatedItem.email, 
        updatedItem.sobrietyDate, homeGroups, privacySettings, preferences, 
        sponsor, sponsees, messagingKeys, updatedItem.updatedAt, id
      ];
    } else if (collection === 'activities') {
      setClauses = 'type = ?, duration = ?, date = ?, notes = ?, meeting = ?, updatedAt = ?';
      values = [
        updatedItem.type, updatedItem.duration, updatedItem.date, 
        updatedItem.notes, updatedItem.meeting, updatedItem.updatedAt, id
      ];
    } else if (collection === 'meetings') {
      const days = JSON.stringify(updatedItem.days || []);
      const schedule = JSON.stringify(updatedItem.schedule || []);
      const coordinates = JSON.stringify(updatedItem.coordinates || null);
      
      setClauses = 'name = ?, days = ?, time = ?, schedule = ?, address = ?, locationName = ?, streetAddress = ?, city = ?, state = ?, zipCode = ?, coordinates = ?, updatedAt = ?';
      values = [
        updatedItem.name, days, updatedItem.time, schedule, updatedItem.address, 
        updatedItem.locationName, updatedItem.streetAddress, updatedItem.city, 
        updatedItem.state, updatedItem.zipCode, coordinates, updatedItem.updatedAt, id
      ];
    } else if (collection === 'messages') {
      setClauses = 'content = ?, encrypted = ?, read = ?';
      values = [
        updatedItem.content, updatedItem.encrypted ? 1 : 0, updatedItem.read ? 1 : 0, id
      ];
    } else if (collection === 'preferences') {
      setClauses = 'value = ?, updatedAt = ?';
      values = [
        JSON.stringify(updatedItem.value), updatedItem.updatedAt, id
      ];
    } else {
      throw new Error(`Unknown collection: ${collection}`);
    }
    
    // Execute update query
    const result = await executeQuery(
      `UPDATE ${collection} SET ${setClauses} WHERE id = ?`,
      values
    );
    
    if (result.rowsAffected === 0) {
      console.log(`No rows affected when updating ${collection} with ID: ${id}`);
      return null;
    }
    
    console.log(`Updated item in ${collection} with ID: ${id}`);
    return updatedItem;
  } catch (error) {
    console.error(`Error updating item in ${collection}:`, error);
    throw error;
  }
}

/**
 * Remove an item from a collection
 * @param {string} collection - The collection name
 * @param {string} id - The item ID
 * @returns {Promise<boolean>} Whether the item was removed
 */
export async function remove(collection, id) {
  try {
    const result = await executeQuery(
      `DELETE FROM ${collection} WHERE id = ?`,
      [id]
    );
    
    const success = result.rowsAffected > 0;
    
    if (success) {
      console.log(`Removed item from ${collection} with ID: ${id}`);
    } else {
      console.log(`No item found in ${collection} with ID: ${id}`);
    }
    
    return success;
  } catch (error) {
    console.error(`Error removing item from ${collection}:`, error);
    return false;
  }
}

/**
 * Query items in a collection
 * @param {string} collection - The collection name
 * @param {Function} predicate - Filter function
 * @returns {Promise<Array>} Filtered items
 */
export async function query(collection, predicate) {
  try {
    const items = await getAll(collection);
    return items.filter(predicate);
  } catch (error) {
    console.error(`Error querying ${collection}:`, error);
    return [];
  }
}

/**
 * Get user preference
 * @param {string} key - The preference key
 * @returns {Promise<any>} The preference value
 */
export async function getPreference(key) {
  try {
    const preference = await getById('preferences', key);
    return preference?.value;
  } catch (error) {
    console.error(`Error getting preference ${key}:`, error);
    return null;
  }
}

/**
 * Set user preference
 * @param {string} key - The preference key
 * @param {any} value - The preference value
 * @returns {Promise<void>}
 */
export async function setPreference(key, value) {
  try {
    const now = new Date().toISOString();
    const preference = {
      id: key,
      value: value,
      createdAt: now,
      updatedAt: now
    };
    
    // Check if preference exists
    const existingPref = await getById('preferences', key);
    
    if (existingPref) {
      // Update existing preference
      await update('preferences', key, { value, updatedAt: now });
    } else {
      // Add new preference
      await add('preferences', preference);
    }
  } catch (error) {
    console.error(`Error setting preference ${key}:`, error);
  }
}

/**
 * Calculate spiritual fitness score
 * @param {Array} activities - The activities array
 * @param {number} timeframe - Timeframe in days (default: 30)
 * @returns {Promise<number>} Spiritual fitness score
 */
export async function calculateSpiritualFitness(activities, timeframe = 30) {
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
 * Check if there is data in localStorage to migrate
 * @returns {boolean} Whether localStorage contains data to migrate
 */
export function hasLocalStorageData() {
  return !!(
    localStorage.getItem('user') ||
    localStorage.getItem('activities') ||
    localStorage.getItem('meetings') ||
    localStorage.getItem('messages')
  );
}

/**
 * Migrate data from localStorage to the database
 * @returns {Promise<boolean>} Whether migration was successful
 */
export async function migrateFromLocalStorage() {
  console.log("Starting migration from localStorage to SQLite...");
  
  try {
    // Migrate user data
    const userData = JSON.parse(localStorage.getItem('user'));
    if (userData) {
      console.log("Migrating user data...");
      await add('users', userData);
    }
    
    // Migrate activities
    const activitiesData = JSON.parse(localStorage.getItem('activities') || '[]');
    if (activitiesData.length > 0) {
      console.log(`Migrating ${activitiesData.length} activities...`);
      for (const activity of activitiesData) {
        await add('activities', activity);
      }
    }
    
    // Migrate meetings
    const meetingsData = JSON.parse(localStorage.getItem('meetings') || '[]');
    if (meetingsData.length > 0) {
      console.log(`Migrating ${meetingsData.length} meetings...`);
      for (const meeting of meetingsData) {
        await add('meetings', meeting);
      }
    }
    
    // Migrate messages
    const messagesData = JSON.parse(localStorage.getItem('messages') || '[]');
    if (messagesData.length > 0) {
      console.log(`Migrating ${messagesData.length} messages...`);
      for (const message of messagesData) {
        await add('messages', message);
      }
    }
    
    console.log("Migration completed successfully!");
    return true;
  } catch (error) {
    console.error("Error during migration:", error);
    return false;
  }
}

/**
 * Set up global window.db object for backward compatibility
 * @returns {Object} The database interface
 */
/**
 * Calculate sobriety days based on sobriety date
 * @param {string} sobrietyDate - Sobriety date in ISO format
 * @returns {number} - Number of days sober
 */
export function calculateSobrietyDays(sobrietyDate) {
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
export function calculateSobrietyYears(sobrietyDate, decimalPlaces = 2) {
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
 * Calculate spiritual fitness with a custom timeframe
 * @param {number} timeframe - Number of days to calculate score for (default 30)
 * @returns {number} - Spiritual fitness score (0-100)
 */
export function calculateSpiritualFitnessWithTimeframe(timeframe = 30) {
  console.log('calculateSpiritualFitnessWithTimeframe called with timeframe:', timeframe);
  
  // Start with a base score
  const baseScore = 20;
  
  try {
    // Get activities from the right source - we'll use async/await pattern
    let activities;
    
    // If we have window.activities, use that directly
    if (window.activities && Array.isArray(window.activities)) {
      activities = window.activities;
    } 
    // Otherwise get activities from the database synchronously
    else {
      try {
        // Get all activities using executeQuery directly
        const result = executeQuery('SELECT * FROM activities');
        activities = [];
        
        for (let i = 0; i < result.rows.length; i++) {
          activities.push(result.rows.item(i));
        }
      } catch (dbError) {
        console.error('Database error getting activities:', dbError);
        // Fallback to empty array
        activities = [];
      }
    }
    
    console.log('Activities for fitness calculation:', activities);
    
    if (!activities || activities.length === 0) {
      console.log('No activities found, returning base score');
      return baseScore;
    }
    
    // Get current date and cutoff date
    const today = new Date();
    const cutoffDate = new Date();
    cutoffDate.setDate(today.getDate() - timeframe);
    
    // Filter recent activities
    const recentActivities = activities.filter(activity => {
      const activityDate = new Date(activity.date);
      return activityDate >= cutoffDate && activityDate <= today;
    });
    
    console.log('Recent activities within timeframe:', recentActivities.length);
    
    if (recentActivities.length === 0) {
      return baseScore;
    }
    
    // Calculate basic activity points (2 points per activity, max 40)
    const activityPoints = Math.min(40, recentActivities.length * 2);
    
    // Calculate consistency (days with activities / timeframe days)
    const activityDays = new Set();
    recentActivities.forEach(activity => {
      if (activity.date) {
        const day = new Date(activity.date).toISOString().split('T')[0];
        activityDays.add(day);
      }
    });
    
    const daysWithActivities = activityDays.size;
    
    // Adjust consistency calculation based on timeframe
    let consistencyPoints = 0;
    
    if (timeframe <= 30) {
      // For 30 days, aim for higher consistency
      const consistencyPercentage = daysWithActivities / timeframe;
      consistencyPoints = Math.round(consistencyPercentage * 40);
    } else if (timeframe <= 90) {
      // For 60-90 days, adjust expectations - can't have activities every day
      // We'll use a lower target percentage for full points
      const consistencyPercentage = daysWithActivities / (timeframe * 0.7); // 70% of days is target
      consistencyPoints = Math.min(40, Math.round(consistencyPercentage * 40));
    } else if (timeframe <= 180) {
      // For 180 days, expect activity on ~50% of days for full points
      const consistencyPercentage = daysWithActivities / (timeframe * 0.5);
      consistencyPoints = Math.min(40, Math.round(consistencyPercentage * 40));
    } else {
      // For 365 days, expect activity on ~35% of days for full points
      const consistencyPercentage = daysWithActivities / (timeframe * 0.35);
      consistencyPoints = Math.min(40, Math.round(consistencyPercentage * 40));
    }
    
    console.log('Consistency calculation details:', {
      daysWithActivities,
      timeframe,
      expectedDaysPercentage: timeframe <= 30 ? 1.0 : 
                             timeframe <= 90 ? 0.7 : 
                             timeframe <= 180 ? 0.5 : 0.35,
      consistencyPoints
    });
    
    // Final score calculation
    const totalScore = Math.min(100, baseScore + activityPoints + consistencyPoints);
    
    console.log('Spiritual fitness calculation details:', {
      baseScore,
      activityPoints,
      consistencyPoints,
      daysWithActivities,
      timeframe,
      totalScore
    });
    
    return totalScore;
  } catch (error) {
    console.error('Error in calculateSpiritualFitnessWithTimeframe:', error);
    return baseScore;
  }
}

export function setupGlobalDbObject() {
  console.log('Setting up global db object with all necessary functions');
  
  window.db = {
    getAll,
    getById,
    add,
    update,
    remove,
    query,
    calculateDistance,
    calculateSobrietyDays,
    calculateSobrietyYears,
    getPreference,
    setPreference,
    calculateSpiritualFitness,
    calculateSpiritualFitnessWithTimeframe,
    hasLocalStorageData,
    migrateFromLocalStorage
  };
  
  // Verify the functions are properly attached
  console.log('Global db object created with these functions:', Object.keys(window.db));
  
  return window.db;
}