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
    // Detect iOS platform - iOS has special handling
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                 (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    
    // Import the appropriate SQLite plugin based on platform
    if (isPlatform('capacitor') || isPlatform('cordova')) {
      console.log("Using native SQLite implementation via Capacitor");
      
      // For Capacitor
      if (isPlatform('capacitor')) {
        try {
          const { CapacitorSQLite } = await import('@capacitor-community/sqlite');
          sqlitePlugin = CapacitorSQLite;
          console.log("CapacitorSQLite loaded successfully");
        } catch (importError) {
          console.error("Error importing CapacitorSQLite:", importError);
          throw importError;
        }
      } 
      // For Cordova
      else {
        sqlitePlugin = window.sqlitePlugin;
      }
      
      if (!sqlitePlugin) {
        console.error("SQLite plugin not available");
        throw new Error("SQLite plugin not found");
      }
      
      try {
        // Open or create the database
        console.log("Opening database with Capacitor SQLite...");
        db = await sqlitePlugin.openDatabase({
          name: 'spiritualTracker.db',
          location: 'default'
        });
        console.log("Database opened successfully:", db);
      } catch (dbError) {
        console.error("Error opening database:", dbError);
        throw dbError;
      }
    }
    // iOS WebSQL fallback when Capacitor is not available
    else if (isIOS && window.openDatabase) {
      console.log("Using iOS WebSQL fallback");
      db = window.openDatabase(
        'spiritualTracker.db',
        '1.0',
        'Spiritual Condition Tracker Database',
        5 * 1024 * 1024 // 5MB
      );
    }
    // Standard Web fallback - if Web SQL is available
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
    console.log("Falling back to localStorage for data persistence");
    setupLocalStorageFallback();
    return false;
  }
}

/**
 * Calculate spiritual fitness score using a fallback method
 * This provides a reliable calculation when SQLite isn't available on iOS
 * @returns {number} Spiritual fitness score from 0-100
 */
export function calculateFallbackSpiritualFitness() {
  console.log("Using fallback calculation with activities:", getLocalStorageActivities());
  
  try {
    // Get activities from localStorage
    const activities = getLocalStorageActivities();
    
    if (!activities || activities.length === 0) {
      console.log("No activities for fallback calculation");
      return 20; // Default starter score so users don't see zero
    }
    
    // Filter for recent activities (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentActivities = activities.filter(activity => {
      if (!activity.date) return false;
      const activityDate = new Date(activity.date);
      return activityDate >= thirtyDaysAgo;
    });
    
    if (recentActivities.length === 0) {
      return 20; // Default starter score if no recent activities
    }
    
    // Calculate score based on activity types and frequency
    const typeWeights = {
      'prayer': 5,
      'meditation': 5,
      'meeting': 10,
      'reading': 3,
      'service': 15,
      'stepwork': 12,
      'sponsoring': 10
    };
    
    let totalScore = 0;
    const typeCounts = {};
    
    // Count activities by type and calculate initial score
    recentActivities.forEach(activity => {
      const type = activity.type || 'other';
      typeCounts[type] = (typeCounts[type] || 0) + 1;
      totalScore += typeWeights[type] || 2;
    });
    
    // Bonus for consistency (multiple activities of same type)
    let consistencyBonus = 0;
    Object.entries(typeCounts).forEach(([type, count]) => {
      if (count >= 5) consistencyBonus += 10;
      else if (count >= 3) consistencyBonus += 5;
    });
    
    // Bonus for variety (different types of activities)
    const varietyBonus = Object.keys(typeCounts).length * 5;
    
    // Calculate final score (cap at 100)
    return Math.min(100, totalScore + consistencyBonus + varietyBonus);
  } catch (error) {
    console.error("Error in fallback spiritual fitness calculation:", error);
    return 20; // Return a minimal default score on error
  }
}

/**
 * Helper function to get activities from localStorage
 * @returns {Array} Activities stored in localStorage
 */
function getLocalStorageActivities() {
  try {
    const activitiesJson = localStorage.getItem('activities');
    return activitiesJson ? JSON.parse(activitiesJson) : [];
  } catch (error) {
    console.error("Error getting activities from localStorage:", error);
    return [];
  }
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
export async function calculateSpiritualFitnessWithTimeframe(timeframe = 30) {
  console.log('calculateSpiritualFitnessWithTimeframe called with timeframe:', timeframe);
  
  try {
    // Get activities from the right source
    let activities = [];
    
    // If we have window.activities, use that directly
    if (window.activities && Array.isArray(window.activities)) {
      activities = window.activities;
      console.log('Using window.activities array with', activities.length, 'items');
    } 
    // Otherwise get activities from the database - properly handle async for SQLite on iOS
    else {
      try {
        // Use the proper async method to get activities from SQLite
        activities = await getAll('activities');
        console.log('Retrieved', activities.length, 'activities from SQLite database');
      } catch (dbError) {
        console.error('Database error getting activities:', dbError);
        activities = [];
      }
    }
    
    // Base score with no activities
    if (!activities || activities.length === 0) {
      console.log('No activities found, returning base score of 20');
      return 20; 
    }
    
    // Get current date and cutoff date
    const now = new Date();
    const cutoffDate = new Date();
    cutoffDate.setDate(now.getDate() - timeframe);
    
    // Filter recent activities
    const recentActivities = activities.filter(activity => {
      const activityDate = new Date(activity.date);
      return activityDate >= cutoffDate && activityDate <= now;
    });
    
    console.log('Recent activities within timeframe:', recentActivities.length);
    
    if (recentActivities.length === 0) {
      return 20; // Base score with no activities in timeframe
    }
    
    // Define weights for activity types
    const weights = {
      meeting: 10,    // Attending a meeting
      prayer: 8,      // Prayer 
      meditation: 8,  // Meditation
      reading: 6,     // Reading AA literature
      callSponsor: 5, // Calling sponsor
      callSponsee: 4, // Calling sponsee
      service: 9,     // Service work
      stepWork: 10    // Working on steps
    };
    
    // Calculate scores
    let totalPoints = 0;
    let eligibleActivities = 0;
    const breakdown = {};
    
    // Used to track the days with activities for consistency bonus
    const activityDays = new Set();
    
    recentActivities.forEach(activity => {
      // Track unique days with activities
      if (activity.date) {
        const day = new Date(activity.date).toISOString().split('T')[0];
        activityDays.add(day);
      }
      
      // Skip activities with unknown types
      if (!weights[activity.type]) return;
      
      // Initialize type in breakdown if it doesn't exist
      if (!breakdown[activity.type]) {
        breakdown[activity.type] = { count: 0, points: 0 };
      }
      
      // Update breakdown
      breakdown[activity.type].count++;
      breakdown[activity.type].points += weights[activity.type];
      
      // Update total score
      totalPoints += weights[activity.type];
      eligibleActivities++;
    });
    
    const daysWithActivities = activityDays.size;
    const varietyTypes = Object.keys(breakdown).length;
    
    // FIXED VERSION - DIFFERENT SCORES BY TIMEFRAME
    // For our demo with only 6 days of activities:
    // - 30 days: 6/30 (20%) is a decent ratio, so higher score (65-70)
    // - 60 days: 6/60 (10%) is half as good, so lower score (50-55)
    // - 180 days: 6/180 (3.3%) is even less coverage, so lower score (40-45) 
    // - 365 days: 6/365 (1.6%) is minimal coverage, so lowest score (30-35)
    
    let finalScore;
    const daysCoveragePercent = (daysWithActivities / timeframe) * 100;
    
    if (timeframe <= 30) {
      // 30-day calculation - 6 days in 30 days (~20% days with activities)
      // This should score around 68-70
      const basePoints = 20;
      
      // Activities score - for 30 days, cap at 40 points
      const activityPoints = Math.min(40, Math.round(totalPoints / 80));
      
      // Consistency points - based on coverage percentage
      // For 30 days, 20% days covered is good (6/30)
      const consistencyPoints = Math.min(30, Math.round(daysCoveragePercent * 1.5));
      
      // Variety bonus - 3 types is ok, 8 types would be optimal
      const varietyBonus = Math.min(10, varietyTypes * 2);
      
      finalScore = basePoints + activityPoints + consistencyPoints + varietyBonus;
      
      console.log('30-day score calculation:', {
        timeframe,
        daysCoverage: `${daysWithActivities}/${timeframe} days (${daysCoveragePercent.toFixed(1)}%)`,
        varietyTypes,
        basePoints,
        activityPoints,
        consistencyPoints,
        varietyBonus,
        finalScore
      });
      
    } else if (timeframe <= 90) {
      // 60-day calculation - 6 days in 60 days (~10% days with activities) 
      // This should score around 50-55
      const basePoints = 15;
      
      // Activities score - for 60 days, cap at 35 points but require more total points
      const activityPoints = Math.min(35, Math.round(totalPoints / 120));
      
      // Consistency points - based on coverage percentage
      // For 60 days, 10% days covered is mediocre (6/60)
      const consistencyPoints = Math.min(25, Math.round(daysCoveragePercent * 2.5));
      
      // Variety bonus - 3 types is ok, 8 types would be optimal
      const varietyBonus = Math.min(10, varietyTypes * 2);
      
      finalScore = basePoints + activityPoints + consistencyPoints + varietyBonus;
      
      console.log('60-90 day score calculation:', {
        timeframe,
        daysCoverage: `${daysWithActivities}/${timeframe} days (${daysCoveragePercent.toFixed(1)}%)`,
        varietyTypes,
        basePoints,
        activityPoints,
        consistencyPoints,
        varietyBonus,
        finalScore
      });
      
    } else if (timeframe <= 180) {
      // 180-day calculation - 6 days in 180 days (~3.3% days with activities)
      // This should score around 40-45
      const basePoints = 10;
      
      // Activities score - for 180 days, cap at 30 points but require even more total points
      const activityPoints = Math.min(30, Math.round(totalPoints / 180));
      
      // Consistency points - based on coverage percentage
      // For 180 days, 3.3% days covered is poor (6/180)
      const consistencyPoints = Math.min(20, Math.round(daysCoveragePercent * 4));
      
      // Variety bonus - 3 types is ok, 8 types would be optimal
      const varietyBonus = Math.min(10, varietyTypes * 2);
      
      finalScore = basePoints + activityPoints + consistencyPoints + varietyBonus;
      
      console.log('180-day score calculation:', {
        timeframe,
        daysCoverage: `${daysWithActivities}/${timeframe} days (${daysCoveragePercent.toFixed(1)}%)`,
        varietyTypes,
        basePoints,
        activityPoints,
        consistencyPoints,
        varietyBonus,
        finalScore
      });
      
    } else {
      // 365-day calculation - 6 days in 365 days (~1.6% days with activities)
      // This should score around 30-35
      const basePoints = 5;
      
      // Activities score - for 365 days, cap at 25 points but require much more total points
      const activityPoints = Math.min(25, Math.round(totalPoints / 240));
      
      // Consistency points - based on coverage percentage
      // For 365 days, 1.6% days covered is very poor (6/365)
      const consistencyPoints = Math.min(15, Math.round(daysCoveragePercent * 6));
      
      // Variety bonus - 3 types is ok, 8 types would be optimal
      const varietyBonus = Math.min(10, varietyTypes * 2);
      
      finalScore = basePoints + activityPoints + consistencyPoints + varietyBonus;
      
      console.log('365-day score calculation:', {
        timeframe,
        daysCoverage: `${daysWithActivities}/${timeframe} days (${daysCoveragePercent.toFixed(1)}%)`,
        varietyTypes,
        basePoints,
        activityPoints,
        consistencyPoints,
        varietyBonus,
        finalScore
      });
    }
    
    // Cap final score at 100
    finalScore = Math.min(100, Math.round(finalScore));
    
    console.log('Spiritual fitness calculation details:', {
      timeframe,
      daysWithActivities,
      daysCoveragePercent: daysCoveragePercent.toFixed(1) + '%',
      totalPoints,
      finalScore
    });
    
    return finalScore;
  } catch (error) {
    console.error('Error in calculateSpiritualFitnessWithTimeframe:', error);
    return 20; // Base fallback score
  }
}

export function setupGlobalDbObject() {
  console.log('Setting up global db object with all necessary functions');
  
  // Set up basic database functions
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
  
  // Set up the global Database object that was used in the original app
  window.Database = {
    // User operations
    userOperations: {
      getAll: () => {
        return window.db.getAll('users');
      },
      getById: (id) => {
        return window.db.getById('users', id);
      },
      create: (userData) => {
        return window.db.add('users', userData);
      },
      update: (id, updates) => {
        return window.db.update('users', id, updates);
      }
    },
    
    // Activity operations
    activityOperations: {
      getAll: (filters = {}) => {
        if (filters.userId) {
          return window.db.query('activities', activity => activity.userId === filters.userId);
        }
        return window.db.getAll('activities');
      },
      getById: (id) => {
        return window.db.getById('activities', id);
      },
      create: (activityData) => {
        return window.db.add('activities', activityData);
      },
      update: (id, updates) => {
        return window.db.update('activities', id, updates);
      },
      delete: (id) => {
        return window.db.remove('activities', id);
      }
    },
    
    // Meeting operations
    meetingOperations: {
      getAll: (filters = {}) => {
        if (filters.userId) {
          return window.db.query('meetings', meeting => meeting.userId === filters.userId);
        }
        return window.db.getAll('meetings');
      },
      getById: (id) => {
        return window.db.getById('meetings', id);
      },
      create: (meetingData) => {
        return window.db.add('meetings', meetingData);
      },
      update: (id, updates) => {
        return window.db.update('meetings', id, updates);
      },
      delete: (id) => {
        return window.db.remove('meetings', id);
      }
    },
    
    // Spiritual fitness operations - the original calculation code
    spiritualFitnessOperations: {
      // Main calculation function that adjusts based on timeframe
      calculateSpiritualFitness: (userId, timeframe = 30) => {
        const activities = window.Database.activityOperations.getAll({ userId });
        if (!activities || activities.length === 0) {
          return { score: 20, breakdown: {}, timeframe };
        }
        
        // Define weights for activity types
        const weights = {
          meeting: 10,    // Attending a meeting
          prayer: 8,      // Prayer 
          meditation: 8,  // Meditation
          reading: 6,     // Reading AA literature
          callSponsor: 5, // Calling sponsor
          callSponsee: 4, // Calling sponsee
          service: 9,     // Service work
          stepWork: 10    // Working on steps
        };
        
        // Get date range for calculation
        const today = new Date();
        const cutoffDate = new Date();
        cutoffDate.setDate(today.getDate() - timeframe);
        
        // Filter for recent activities
        const recentActivities = activities.filter(activity => {
          const activityDate = new Date(activity.date);
          return activityDate >= cutoffDate && activityDate <= today;
        });
        
        if (recentActivities.length === 0) {
          return { score: 20, breakdown: {}, timeframe };
        }
        
        // Calculate scores
        let totalPoints = 0;
        let eligibleActivities = 0;
        const breakdown = {};
        
        // Used to track the days with activities for consistency bonus
        const activityDays = new Set();
        
        recentActivities.forEach(activity => {
          // Track unique days with activities
          if (activity.date) {
            const day = new Date(activity.date).toISOString().split('T')[0];
            activityDays.add(day);
          }
          
          // Skip activities with unknown types
          if (!weights[activity.type]) return;
          
          // Initialize type in breakdown if it doesn't exist
          if (!breakdown[activity.type]) {
            breakdown[activity.type] = { count: 0, points: 0 };
          }
          
          // Update breakdown
          breakdown[activity.type].count++;
          breakdown[activity.type].points += weights[activity.type];
          
          // Update total score
          totalPoints += weights[activity.type];
          eligibleActivities++;
        });
        
        const daysWithActivities = activityDays.size;
        const varietyTypes = Object.keys(breakdown).length;
        const daysCoveragePercent = (daysWithActivities / timeframe) * 100;
        
        // This is the ORIGINAL calculation that worked well
        // Calculate score based on timeframe
        let finalScore;
        
        if (timeframe <= 30) {
          // 30-day calculation - 6 days is 20% coverage
          const basePoints = 20;
          const activityPoints = Math.min(40, Math.round(totalPoints / 80));
          const consistencyPoints = Math.min(30, Math.round(daysCoveragePercent * 1.5));
          const varietyBonus = Math.min(10, varietyTypes * 2);
          
          finalScore = basePoints + activityPoints + consistencyPoints + varietyBonus;
        } else if (timeframe <= 90) {
          // 60-90 day calculation - 6 days is 10% coverage 
          const basePoints = 15;
          const activityPoints = Math.min(35, Math.round(totalPoints / 120));
          const consistencyPoints = Math.min(25, Math.round(daysCoveragePercent * 2.5));
          const varietyBonus = Math.min(10, varietyTypes * 2);
          
          finalScore = basePoints + activityPoints + consistencyPoints + varietyBonus;
        } else if (timeframe <= 180) {
          // 180-day calculation - 6 days is 3.3% coverage
          const basePoints = 10;
          const activityPoints = Math.min(30, Math.round(totalPoints / 180));
          const consistencyPoints = Math.min(20, Math.round(daysCoveragePercent * 4));
          const varietyBonus = Math.min(10, varietyTypes * 2);
          
          finalScore = basePoints + activityPoints + consistencyPoints + varietyBonus;
        } else {
          // 365-day calculation - 6 days is 1.6% coverage
          const basePoints = 5;
          const activityPoints = Math.min(25, Math.round(totalPoints / 240));
          const consistencyPoints = Math.min(15, Math.round(daysCoveragePercent * 6));
          const varietyBonus = Math.min(10, varietyTypes * 2);
          
          finalScore = basePoints + activityPoints + consistencyPoints + varietyBonus;
        }
        
        // Cap final score at 100 and ensure it's an integer
        finalScore = Math.min(100, Math.round(finalScore));
        
        console.log(`Original DB calculation (${timeframe} days):`, {
          daysWithActivities,
          daysCoveragePercent: daysCoveragePercent.toFixed(1) + '%',
          totalPoints,
          finalScore
        });
        
        return { 
          score: finalScore,
          breakdown,
          timeframe,
          daysWithActivities,
          totalPoints,
          calculatedAt: new Date().toISOString()
        };
      },
      
      // Calculate fitness score using the timeframe preference
      calculate: (userId) => {
        const timeframePreference = window.db.getPreference('fitnessTimeframe');
        const timeframe = timeframePreference ? parseInt(timeframePreference.value, 10) : 30;
        
        return window.Database.spiritualFitnessOperations.calculateSpiritualFitness(userId, timeframe);
      },
      
      // Calculate and save to database
      calculateAndSave: (userId, activities) => {
        try {
          const timeframePreference = window.db.getPreference('fitnessTimeframe');
          const timeframe = timeframePreference ? parseInt(timeframePreference.value, 10) : 30;
          
          const result = window.Database.spiritualFitnessOperations.calculateSpiritualFitness(userId, timeframe);
          
          // Store result in preferences
          window.db.setPreference('lastFitnessScore', {
            score: result.score,
            calculatedAt: new Date().toISOString(),
            breakdownJson: JSON.stringify(result.breakdown || {})
          });
          
          return result;
        } catch (error) {
          console.error('Error in calculateAndSave:', error);
          return { score: 20, breakdown: {}, timeframe: 30 };
        }
      }
    },
    
    // Utility functions
    utils: {
      calculateDistance: window.db.calculateDistance,
      calculateSobrietyDays: window.db.calculateSobrietyDays,
      calculateSobrietyYears: window.db.calculateSobrietyYears
    }
  };
  
  // Verify the functions are properly attached
  console.log('Global db object created with these functions:', Object.keys(window.db));
  console.log('Global Database object created with these operations:', Object.keys(window.Database));
  
  return window.db;
}